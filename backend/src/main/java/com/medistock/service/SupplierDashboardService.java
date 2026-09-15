package com.medistock.service;

import com.medistock.dto.SupplierDashboardResponse;
import com.medistock.model.Medicine;
import com.medistock.model.Purchase;
import com.medistock.model.Supplier;
import com.medistock.model.User;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.CurrentUserProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Builds the Supplier dashboard for the currently logged-in SUPPLIER user.
 * Everything here is filtered by that user's linked supplierId — a
 * supplier can never see another supplier's medicines, orders, or profile
 * (see the "Access principle" in the User Roles & Dashboard Guide, section 5).
 */
@Service
@RequiredArgsConstructor
public class SupplierDashboardService {

    private final CurrentUserProvider currentUserProvider;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final PurchaseRepository purchaseRepository;

    public SupplierDashboardResponse getStats() {
        User current = currentUserProvider.getCurrentUser();
        if (current == null || current.getSupplierId() == null) {
            throw new AccessDeniedException("This account is not linked to a supplier profile.");
        }

        Long supplierId = current.getSupplierId();
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new EntityNotFoundException("Linked supplier not found"));

        List<Medicine> supplied = medicineRepository.findBySupplier_Id(supplierId);
        long lowStock = supplied.stream().filter(m -> m.getQuantity() <= m.getReorderLevel()).count();

        List<Purchase> activity = purchaseRepository.findBySupplier_IdOrderByPurchaseDateDesc(supplierId);
        BigDecimal totalOrderValue = purchaseRepository.totalSpendForSupplier(supplierId);

        return SupplierDashboardResponse.builder()
                .supplierId(supplier.getId())
                .supplierName(supplier.getName())
                .contactNumber(supplier.getContactNumber())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .suppliedMedicineCount(supplied.size())
                .lowStockAmongSupplied(lowStock)
                .suppliedMedicines(supplied)
                .totalOrders(activity.size())
                .totalOrderValue(totalOrderValue == null ? BigDecimal.ZERO : totalOrderValue)
                .recentActivity(activity.stream().limit(20).toList())
                .build();
    }
}
