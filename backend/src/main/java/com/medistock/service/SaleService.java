package com.medistock.service;

import com.medistock.dto.SaleRequest;
import com.medistock.dto.SaleResponse;
import com.medistock.model.Medicine;
import com.medistock.model.Sale;
import com.medistock.model.SaleItem;
import com.medistock.model.User;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SaleRepository;
import com.medistock.security.CurrentUserProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Staff/Pharmacist/Admin "New Sale" workflow: MediStock -> Customer.
 * Every medicine's availability is checked before anything is written, and
 * the whole operation runs in one transaction, so a failed sale never
 * partially reduces stock (see requirement 10/12 — sales validation).
 */
@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineService medicineService;
    private final CurrentUserProvider currentUserProvider;
    private final UserActivityService userActivityService;

    @Transactional
    public SaleResponse recordSale(SaleRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("You must be signed in to record a sale.");
        }

        // 1) Resolve + validate every line item BEFORE changing any stock,
        // so an insufficient-stock error on item #3 never leaves items #1-2 half-applied.
        Map<Long, Medicine> resolved = new HashMap<>();
        for (SaleRequest.SaleItemRequest item : request.getItems()) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero for every item");
            }
            Medicine medicine = medicineRepository.findById(item.getMedicineId())
                    .orElseThrow(() -> new EntityNotFoundException("Medicine not found with id: " + item.getMedicineId()));
            if (!Boolean.TRUE.equals(medicine.getActive())) {
                throw new IllegalArgumentException(
                        medicine.getName() + " has been removed from active inventory and can't be sold.");
            }
            if (medicine.getExpiryDate() != null && medicine.getExpiryDate().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException(
                        medicine.getName() + " expired on " + medicine.getExpiryDate()
                                + " and cannot be dispensed. Remove it from stock instead.");
            }
            if (medicine.getQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for " + medicine.getName() + ". Available quantity: " + medicine.getQuantity());
            }
            resolved.put(item.getMedicineId(), medicine);
        }

        // 2) Create the sale first so it has an id, then derive a human-friendly bill number from it.
        Sale sale = Sale.builder()
                .customerName(request.getCustomerName().trim())
                .soldBy(currentUser)
                .totalAmount(BigDecimal.ZERO)
                .customerPhone(request.getCustomerPhone())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .paymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "PAID")
                .build();
        sale = saleRepository.save(sale);
        sale.setBillNumber("INV-" + (1000 + sale.getId()));

        // 3) Build line items, dispense stock for each, and total the bill.
        List<SaleItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (SaleRequest.SaleItemRequest item : request.getItems()) {
            Medicine medicine = resolved.get(item.getMedicineId());
            BigDecimal subtotal = medicine.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(subtotal);

            items.add(SaleItem.builder()
                    .sale(sale)
                    .medicine(medicine)
                    .quantity(item.getQuantity())
                    .unitPrice(medicine.getPrice())
                    .subtotal(subtotal)
                    .build());

            medicineService.dispenseForSale(medicine.getId(), item.getQuantity(),
                    "Sold — Bill " + sale.getBillNumber() + " (" + sale.getCustomerName() + ")");
        }

        sale.setItems(items);
        sale.setTotalAmount(total);
        sale = saleRepository.save(sale);

        userActivityService.log(currentUser, "SALE_RECORDED",
                "Bill " + sale.getBillNumber() + " for " + sale.getCustomerName() + " — " + items.size() + " item(s), ₹" + total);

        return toResponse(sale);
    }

    public List<SaleResponse> getAll() {
        return saleRepository.findAllByOrderBySaleDateDesc().stream().map(this::toResponse).toList();
    }

    public List<SaleResponse> getMine() {
        User currentUser = currentUserProvider.getCurrentUser();
        if (currentUser == null) return List.of();
        return saleRepository.findBySoldBy_IdOrderBySaleDateDesc(currentUser.getId()).stream().map(this::toResponse).toList();
    }

    public SaleResponse getById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sale not found with id: " + id));

        User currentUser = currentUserProvider.getCurrentUser();
        boolean isStaffOnly = currentUser != null && currentUser.getRole() != null
                && currentUser.getRole().name().equals("STAFF");
        if (isStaffOnly && (sale.getSoldBy() == null || !sale.getSoldBy().getId().equals(currentUser.getId()))) {
            throw new AccessDeniedException("You can only view bills you recorded yourself.");
        }
        return toResponse(sale);
    }

    private SaleResponse toResponse(Sale sale) {
        List<SaleResponse.SaleItemResponse> items = sale.getItems().stream()
                .map(i -> SaleResponse.SaleItemResponse.builder()
                        .medicineId(i.getMedicine().getId())
                        .medicineName(i.getMedicine().getName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build())
                .toList();

        return SaleResponse.builder()
                .id(sale.getId())
                .billNumber(sale.getBillNumber())
                .customerName(sale.getCustomerName())
                .soldByName(sale.getSoldBy() != null ? sale.getSoldBy().getFullName() : "—")
                .totalAmount(sale.getTotalAmount())
                .saleDate(sale.getSaleDate())
                .items(items)
                .customerPhone(sale.getCustomerPhone())
                .paymentMethod(sale.getPaymentMethod())
                .paymentStatus(sale.getPaymentStatus())
                .build();
    }
}
