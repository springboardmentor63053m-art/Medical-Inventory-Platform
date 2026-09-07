package com.medicalinventory.service;

import com.medicalinventory.entity.*;
import com.medicalinventory.exception.*;
import com.medicalinventory.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    private final AlertRepository     alertRepository;
    private final InventoryRepository inventoryRepository;

    public AlertService(AlertRepository alertRepository, InventoryRepository inventoryRepository) {
        this.alertRepository = alertRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatusOrderByCreatedAtDesc(Alert.AlertStatus.ACTIVE);
    }

    @Transactional
    public void checkAndGenerateAlerts(Medicine medicine, Inventory inventory) {
        if (inventory.getQuantity() == 0) {
            createAlertIfNotExists(medicine, Alert.AlertType.OUT_OF_STOCK,
                    String.format("'%s' is OUT OF STOCK. Immediate reorder required.", medicine.getName()));
        } else if (inventory.getQuantity() <= medicine.getReorderLevel()) {
            createAlertIfNotExists(medicine, Alert.AlertType.LOW_STOCK,
                    String.format("'%s' stock (%d) is at or below reorder level (%d). Please reorder.",
                            medicine.getName(), inventory.getQuantity(), medicine.getReorderLevel()));
        }

        if (inventory.getExpiryDate() != null) {
            LocalDate today = LocalDate.now();
            if (inventory.getExpiryDate().isBefore(today.plusDays(31))) {
                createAlertIfNotExists(medicine, Alert.AlertType.EXPIRY_30_DAYS,
                        String.format("'%s' expires on %s — within 30 days. Take immediate action.", medicine.getName(), inventory.getExpiryDate()));
            } else if (inventory.getExpiryDate().isBefore(today.plusDays(61))) {
                createAlertIfNotExists(medicine, Alert.AlertType.EXPIRY_60_DAYS,
                        String.format("'%s' expires on %s — within 60 days.", medicine.getName(), inventory.getExpiryDate()));
            } else if (inventory.getExpiryDate().isBefore(today.plusDays(91))) {
                createAlertIfNotExists(medicine, Alert.AlertType.EXPIRY_90_DAYS,
                        String.format("'%s' expires on %s — within 90 days.", medicine.getName(), inventory.getExpiryDate()));
            }
        }
    }

    private void createAlertIfNotExists(Medicine medicine, Alert.AlertType type, String message) {
        List<Alert> existing = alertRepository.findByMedicineIdAndAlertTypeAndStatus(
                medicine.getId(), type, Alert.AlertStatus.ACTIVE);
        if (existing.isEmpty()) {
            Alert alert = Alert.builder()
                    .medicine(medicine)
                    .alertType(type)
                    .message(message)
                    .status(Alert.AlertStatus.ACTIVE)
                    .build();
            alertRepository.save(alert);
            log.info("Alert generated: {} for medicine: {}", type, medicine.getName());
        }
    }

    @Transactional
    public Alert acknowledgeAlert(Long alertId, User user) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", alertId));
        alert.setStatus(Alert.AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedBy(user);
        alert.setAcknowledgedAt(java.time.LocalDateTime.now());
        return alertRepository.save(alert);
    }

    @Transactional
    public Alert resolveAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", alertId));
        alert.setStatus(Alert.AlertStatus.RESOLVED);
        alert.setResolvedAt(java.time.LocalDateTime.now());
        return alertRepository.save(alert);
    }

    @Scheduled(cron = "${app.scheduler.alert-check-cron}")
    @Transactional
    public void runDailyAlertCheck() {
        log.info("Running scheduled daily alert check...");

        List<Inventory> allInventory = inventoryRepository.findAll();
        for (Inventory inv : allInventory) {
            checkAndGenerateAlerts(inv.getMedicine(), inv);
        }

        log.info("Daily alert check completed. Total inventory records checked: {}", allInventory.size());
    }
}
