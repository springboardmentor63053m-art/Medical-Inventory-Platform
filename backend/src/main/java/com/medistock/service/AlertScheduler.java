package com.medistock.service;

import com.medistock.model.Medicine;
import com.medistock.model.NotificationType;
import com.medistock.model.Severity;
import com.medistock.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Runs daily to generate low-stock, expiry, and general inventory-reminder
 * notifications automatically — this is what makes alerts proactive rather
 * than only reactive to manual stock changes.
 */
@Component
@RequiredArgsConstructor
public class AlertScheduler {

    private final MedicineRepository medicineRepository;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;
    private final SystemSettingsService systemSettingsService;

    // Runs once a day at 07:00 server time. Also runs 30s after startup
    // for demo purposes so alerts are visible immediately.
    @Scheduled(cron = "0 0 7 * * *")
    public void runDailyChecks() {
        generateLowStockAlerts();
        generateExpiryAlerts();
        generateInventoryReminder();
        sendCriticalEmailDigest();
    }

    @Scheduled(initialDelay = 30_000, fixedDelay = Long.MAX_VALUE)
    public void runOnStartup() {
        generateLowStockAlerts();
        generateExpiryAlerts();
    }

    private void generateLowStockAlerts() {
        for (Medicine m : medicineRepository.findLowStock()) {
            if (m.getQuantity() == 0) {
                notificationService.create(NotificationType.OUT_OF_STOCK, Severity.CRITICAL,
                        "Out of stock", m.getName() + " is out of stock.", "ALL", m.getId());
            } else {
                notificationService.create(NotificationType.LOW_STOCK, Severity.WARNING,
                        "Low stock", m.getName() + " is at " + m.getQuantity()
                                + " units (reorder level " + m.getReorderLevel() + ").", "ALL", m.getId());
            }
        }
    }

    private void generateExpiryAlerts() {
        int windowDays = systemSettingsService.get().getNearExpiryWindowDays();
        for (Medicine m : medicineRepository.findNearExpiry(LocalDate.now().plusDays(windowDays))) {
            notificationService.create(NotificationType.EXPIRY_ALERT, Severity.WARNING,
                    "Expiring soon", m.getName() + " (batch " + m.getBatchNumber()
                            + ") expires on " + m.getExpiryDate() + ".", "PHARMACIST", m.getId());
        }
        for (Medicine m : medicineRepository.findExpired()) {
            notificationService.create(NotificationType.EXPIRY_ALERT, Severity.CRITICAL,
                    "Expired stock", m.getName() + " (batch " + m.getBatchNumber()
                            + ") expired on " + m.getExpiryDate() + " — remove from shelf.", "ALL", m.getId());
        }
    }

    private void generateInventoryReminder() {
        long total = medicineRepository.count();
        notificationService.create(NotificationType.INVENTORY_REMINDER, Severity.INFO,
                "Daily inventory reminder",
                "Daily check complete — " + total + " medicines tracked. Review the dashboard for anything needing attention.",
                "ADMIN", null);
    }

    /**
     * Best-effort daily digest of everything that needs urgent attention
     * (out-of-stock + expired), emailed to whoever is configured in
     * app.notifications.email.recipients. No-ops entirely if email alerts
     * aren't configured (see EmailNotificationService).
     */
    private void sendCriticalEmailDigest() {
        if (!emailNotificationService.isActive()) return;

        List<Medicine> outOfStock = medicineRepository.findLowStock().stream()
                .filter(m -> m.getQuantity() == 0).toList();
        List<Medicine> expired = medicineRepository.findExpired();
        if (outOfStock.isEmpty() && expired.isEmpty()) return;

        List<String> lines = new ArrayList<>();
        lines.add("MediStock daily critical alert digest — " + LocalDate.now());
        lines.add("");
        if (!outOfStock.isEmpty()) {
            lines.add("Out of stock (" + outOfStock.size() + "):");
            outOfStock.forEach(m -> lines.add("  - " + m.getName() + " (batch " + m.getBatchNumber() + ")"));
            lines.add("");
        }
        if (!expired.isEmpty()) {
            lines.add("Expired (" + expired.size() + "):");
            expired.forEach(m -> lines.add("  - " + m.getName() + " (batch " + m.getBatchNumber()
                    + ") expired " + m.getExpiryDate()));
        }
        emailNotificationService.sendAlertDigest(
                "MediStock: " + (outOfStock.size() + expired.size()) + " item(s) need attention",
                String.join("\n", lines));
    }
}
