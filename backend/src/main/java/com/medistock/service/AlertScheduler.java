package com.medistock.service;

import com.medistock.model.Medicine;
import com.medistock.model.NotificationType;
import com.medistock.model.Severity;
import com.medistock.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

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

    // Runs once a day at 07:00 server time. Also runs 30s after startup
    // for demo purposes so alerts are visible immediately.
    @Scheduled(cron = "0 0 7 * * *")
    public void runDailyChecks() {
        generateLowStockAlerts();
        generateExpiryAlerts();
        generateInventoryReminder();
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
        for (Medicine m : medicineRepository.findNearExpiry(LocalDate.now().plusDays(30))) {
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
}
