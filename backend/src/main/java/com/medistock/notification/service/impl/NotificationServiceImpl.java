package com.medistock.notification.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.inventory.entity.Inventory;
import com.medistock.inventory.repository.InventoryRepository;
import com.medistock.notification.dto.response.NotificationResponse;
import com.medistock.notification.entity.Notification;
import com.medistock.notification.repository.NotificationRepository;
import com.medistock.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final int EXPIRING_SOON_DAYS = 30;

    private final NotificationRepository notificationRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public List<NotificationResponse> getActiveNotifications() {
        syncInventoryNotifications();
        return notificationRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications() {
        return notificationRepository.findByIsActiveTrueAndIsReadFalse().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByIsActiveTrueAndIsReadFalse();
    }

    @Override
    @Transactional
    public void syncInventoryNotifications() {
        List<Inventory> inventories = inventoryRepository.findAll();
        for (Inventory item : inventories) {
            syncSingleInventoryItem(item);
        }
    }

    @Override
    @Transactional
    public void syncNotificationForInventory(Long inventoryId) {
        if (inventoryId == null) return;
        inventoryRepository.findById(inventoryId).ifPresent(this::syncSingleInventoryItem);
    }

    private void syncSingleInventoryItem(Inventory item) {
        if (item == null) return;

        LocalDate today = LocalDate.now();
        int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
        int minStock = item.getMinimumStock() != null ? item.getMinimumStock() : 0;
        LocalDate expiryDate = item.getExpiryDate();
        String medicineName = (item.getMedicine() != null && item.getMedicine().getName() != null)
                ? item.getMedicine().getName()
                : "Medicine";
        String batchNo = item.getBatchNumber() != null ? item.getBatchNumber() : "N/A";

        // Determine target active conditions
        String targetStockType = null; // "OUT_OF_STOCK", "LOW_STOCK", or null
        if (quantity == 0) {
            targetStockType = "OUT_OF_STOCK";
        } else if (quantity < minStock) {
            targetStockType = "LOW_STOCK";
        }

        String targetExpiryType = null; // "EXPIRED", "EXPIRING_SOON", or null
        if (expiryDate != null) {
            if (expiryDate.isBefore(today)) {
                targetExpiryType = "EXPIRED";
            } else if (!expiryDate.isAfter(today.plusDays(EXPIRING_SOON_DAYS))) {
                targetExpiryType = "EXPIRING_SOON";
            }
        }

        Set<String> neededTypes = new HashSet<>();
        if (targetStockType != null) neededTypes.add(targetStockType);
        if (targetExpiryType != null) neededTypes.add(targetExpiryType);

        // Fetch existing active notifications for this batch
        List<Notification> activeNotifs = notificationRepository.findByInventoryIdAndIsActiveTrue(item.getId());

        // Deactivate active notifications that are no longer valid
        for (Notification notif : activeNotifs) {
            if (!neededTypes.contains(notif.getType())) {
                notif.setIsActive(false);
                notif.setResolvedAt(LocalDateTime.now());
                notificationRepository.save(notif);
            }
        }

        // Process target conditions: update existing or create new
        if (targetStockType != null) {
            processCondition(item, targetStockType, medicineName, batchNo, quantity, minStock, expiryDate);
        }
        if (targetExpiryType != null) {
            processCondition(item, targetExpiryType, medicineName, batchNo, quantity, minStock, expiryDate);
        }
    }

    private void processCondition(Inventory item, String type, String medicineName, String batchNo,
                                  int quantity, int minStock, LocalDate expiryDate) {
        List<Notification> existingNotifications = notificationRepository
                .findByInventoryIdAndTypeAndIsActiveTrueOrderByCreatedAtDesc(
                        item.getId(),
                        type
                );

        Notification existing = existingNotifications.isEmpty()
                ? null
                : existingNotifications.get(0);

        if (existingNotifications.size() > 1) {
            LocalDateTime resolvedAt = LocalDateTime.now();

            for (int i = 1; i < existingNotifications.size(); i++) {
                Notification duplicate = existingNotifications.get(i);
                duplicate.setIsActive(false);
                duplicate.setResolvedAt(resolvedAt);
            }

            notificationRepository.saveAll(
                    existingNotifications.subList(1, existingNotifications.size())
            );
        }

        String severity;
        String title;
        String message;

        switch (type) {
            case "OUT_OF_STOCK":
                severity = "CRITICAL";
                title = "Out of Stock: " + medicineName;
                message = "Out of stock: " + medicineName + " — Batch " + batchNo + " has 0 units remaining.";
                break;
            case "LOW_STOCK":
                severity = "WARNING";
                title = "Low Stock: " + medicineName;
                message = "Low stock: " + medicineName + " — Batch " + batchNo + " has " + quantity +
                        " units remaining, below the reorder threshold of " + minStock + ".";
                break;
            case "EXPIRED":
                severity = "CRITICAL";
                title = "Expired Medicine: " + medicineName;
                message = "Expired medicine: " + medicineName + " — Batch " + batchNo + " expired on " + expiryDate + ".";
                break;
            case "EXPIRING_SOON":
                severity = "WARNING";
                title = "Expiring Soon: " + medicineName;
                message = "Expiring soon: " + medicineName + " — Batch " + batchNo + " expires on " + expiryDate + ".";
                break;
            default:
                severity = "INFO";
                title = type + ": " + medicineName;
                message = "Notice for batch " + batchNo;
                break;
        }

        if (existing != null) {
            existing.setSeverity(severity);
            existing.setTitle(title);
            existing.setMessage(message);
            notificationRepository.save(existing);
        } else {
            Notification newNotif = Notification.builder()
                    .inventory(item)
                    .type(type)
                    .severity(severity)
                    .title(title)
                    .message(message)
                    .isRead(false)
                    .isActive(true)
                    .build();
            notificationRepository.save(newNotif);
        }
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        List<Notification> activeNotifs = notificationRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        for (Notification n : activeNotifs) {
            if (!Boolean.TRUE.equals(n.getIsRead())) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }

    @Override
    @Transactional
    public void dismissNotification(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            n.setIsActive(false);
            n.setResolvedAt(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    private NotificationResponse mapToResponse(Notification n) {
        Inventory item = n.getInventory();
        String medicineName = (item != null && item.getMedicine() != null && item.getMedicine().getName() != null)
                ? item.getMedicine().getName()
                : "Medicine";
        String batchNo = (item != null && item.getBatchNumber() != null) ? item.getBatchNumber() : "N/A";
        Integer qty = item != null ? item.getQuantity() : null;
        Integer minStock = item != null ? item.getMinimumStock() : null;
        LocalDate expiry = item != null ? item.getExpiryDate() : null;

        boolean read = Boolean.TRUE.equals(n.getIsRead());

        return NotificationResponse.builder()
                .id(String.valueOf(n.getId()))
                .type(n.getType())
                .severity(n.getSeverity())
                .title(n.getTitle())
                .message(n.getMessage())
                .inventoryId(item != null ? item.getId() : null)
                .medicineName(medicineName)
                .batchNumber(batchNo)
                .quantity(qty)
                .minimumStock(minStock)
                .expiryDate(expiry)
                .isRead(read)
                .read(read)
                .isActive(n.getIsActive())
                .generatedAt(n.getCreatedAt())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .resolvedAt(n.getResolvedAt())
                .build();
    }
}