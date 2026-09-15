package com.medistock.service;

import com.medistock.dto.AdminDashboardResponse;
import com.medistock.model.Purchase;
import com.medistock.model.StockMovement;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class DashboardMapper {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public AdminDashboardResponse.PurchaseSummary toPurchaseSummary(Purchase p) {
        return AdminDashboardResponse.PurchaseSummary.builder()
                .id(p.getId())
                .medicineName(p.getMedicine() != null ? p.getMedicine().getName() : "—")
                .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : "—")
                .quantity(p.getQuantity())
                .totalAmount(p.getTotalAmount())
                .purchaseDate(p.getPurchaseDate().format(FMT))
                .recordedBy(p.getPurchasedBy() != null ? p.getPurchasedBy().getFullName() : "—")
                .orderStatus(p.getOrderStatus() != null ? p.getOrderStatus().name() : null)
                .build();
    }

    public AdminDashboardResponse.StockMovementSummary toMovementSummary(StockMovement m) {
        return AdminDashboardResponse.StockMovementSummary.builder()
                .medicineName(m.getMedicine() != null ? m.getMedicine().getName() : "—")
                .type(m.getType().name())
                .quantityChange(m.getQuantityChange())
                .newQuantity(m.getNewQuantity())
                .performedBy(m.getPerformedBy() != null ? m.getPerformedBy().getFullName() : "System")
                .timestamp(m.getTimestamp().format(FMT))
                .build();
    }
}
