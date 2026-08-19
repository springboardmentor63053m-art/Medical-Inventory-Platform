package com.medistock.notification.service.impl;

import com.medistock.inventory.dto.response.InventoryResponse;
import com.medistock.inventory.service.InventoryService;
import com.medistock.notification.dto.response.NotificationResponse;
import com.medistock.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private static final int EXPIRING_SOON_DAYS = 30;

    private final InventoryService inventoryService;

    @Override
    public List<NotificationResponse> getActiveNotifications() {
        List<NotificationResponse> notifications =
                new ArrayList<>();

        List<InventoryResponse> stockAlerts =
                inventoryService.getLowStockInventory();

        stockAlerts.stream()
                .filter(item ->
                        "OUT_OF_STOCK".equals(item.getStockStatus())
                )
                .map(this::createOutOfStockNotification)
                .forEach(notifications::add);

        stockAlerts.stream()
                .filter(item ->
                        "LOW_STOCK".equals(item.getStockStatus())
                )
                .map(this::createLowStockNotification)
                .forEach(notifications::add);

        inventoryService.getExpiredInventory().stream()
                .map(this::createExpiredNotification)
                .forEach(notifications::add);

        inventoryService
                .getExpiringInventory(EXPIRING_SOON_DAYS)
                .stream()
                .map(this::createExpiringSoonNotification)
                .forEach(notifications::add);

        return notifications;
    }

    private NotificationResponse createOutOfStockNotification(
            InventoryResponse item
    ) {
        String medicineName = getMedicineName(item);

        return baseNotification(item)
                .id("OUT_OF_STOCK-" + item.getId())
                .type("OUT_OF_STOCK")
                .severity("CRITICAL")
                .title("Out of Stock: " + medicineName)
                .message(
                        "Batch " + getBatchNumber(item) +
                        " has no available units. Immediate restocking is required."
                )
                .build();
    }

    private NotificationResponse createLowStockNotification(
            InventoryResponse item
    ) {
        String medicineName = getMedicineName(item);

        return baseNotification(item)
                .id("LOW_STOCK-" + item.getId())
                .type("LOW_STOCK")
                .severity("WARNING")
                .title("Low Stock: " + medicineName)
                .message(
                        "Current quantity is " + item.getQuantity() +
                        " units, at or below the minimum stock level of " +
                        item.getMinimumStock() + " units."
                )
                .build();
    }

    private NotificationResponse createExpiredNotification(
            InventoryResponse item
    ) {
        String medicineName = getMedicineName(item);

        return baseNotification(item)
                .id("EXPIRED-" + item.getId())
                .type("EXPIRED")
                .severity("CRITICAL")
                .title("Expired Medicine: " + medicineName)
                .message(
                        "Batch " + getBatchNumber(item) +
                        " expired on " + item.getExpiryDate() +
                        " and must not be issued."
                )
                .build();
    }

    private NotificationResponse createExpiringSoonNotification(
            InventoryResponse item
    ) {
        String medicineName = getMedicineName(item);

        return baseNotification(item)
                .id("EXPIRING_SOON-" + item.getId())
                .type("EXPIRING_SOON")
                .severity("WARNING")
                .title("Expiring Soon: " + medicineName)
                .message(
                        "Batch " + getBatchNumber(item) +
                        " expires on " + item.getExpiryDate() +
                        " within the next 30 days."
                )
                .build();
    }

    private NotificationResponse.NotificationResponseBuilder
            baseNotification(InventoryResponse item) {
        return NotificationResponse.builder()
                .inventoryId(item.getId())
                .medicineName(getMedicineName(item))
                .batchNumber(item.getBatchNumber())
                .quantity(item.getQuantity())
                .minimumStock(item.getMinimumStock())
                .expiryDate(item.getExpiryDate())
                .generatedAt(LocalDateTime.now());
    }

    private String getMedicineName(InventoryResponse item) {
        if (item.getMedicine() == null ||
                item.getMedicine().getName() == null) {
            return "Medicine";
        }

        return item.getMedicine().getName();
    }

    private String getBatchNumber(InventoryResponse item) {
        return item.getBatchNumber() == null
                ? "N/A"
                : item.getBatchNumber();
    }
}