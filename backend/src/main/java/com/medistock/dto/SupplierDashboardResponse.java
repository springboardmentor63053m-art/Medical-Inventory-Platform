package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Supplier dashboard — matches the "Recommended Supplier Dashboard" layout
 * in the MediStock User Roles & Dashboard Guide (section 5): Supplier
 * Profile, Supplied Medicines, Purchase/Order Summary, and Supply Activity.
 * Every field here is scoped to the single supplier the logged-in user is
 * linked to — never other suppliers' data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDashboardResponse {

    // --- Supplier Profile
    private Long supplierId;
    private String supplierName;
    private String contactNumber;
    private String email;
    private String address;

    // --- Supplied Medicines
    private long suppliedMedicineCount;
    private long lowStockAmongSupplied;
    private List<com.medistock.model.Medicine> suppliedMedicines;

    // --- Purchase / Order Summary
    private long totalOrders;
    private BigDecimal totalOrderValue;

    // --- Supply Activity (most recent purchases/orders involving this supplier)
    private List<com.medistock.model.Purchase> recentActivity;
}
