package com.medistock.service;

import com.medistock.dto.PurchaseRequest;
import com.medistock.model.*;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.CurrentUserProvider;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Covers requirement 13's purchase-order workflow: Admin creates an order
 * (no stock change) -> Supplier accepts/rejects -> Supplier dispatches ->
 * Admin receives (stock/movement/notification only happen here).
 */
@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @Mock private PurchaseRepository purchaseRepository;
    @Mock private MedicineRepository medicineRepository;
    @Mock private SupplierRepository supplierRepository;
    @Mock private StockMovementService stockMovementService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private PurchaseService purchaseService;

    private Medicine medicine(int quantity) {
        return Medicine.builder().id(1L).name("Paracetamol").batchNumber("B1")
                .quantity(quantity).reorderLevel(10).expiryDate(LocalDate.now().plusYears(1))
                .price(BigDecimal.valueOf(10)).active(true).build();
    }

    private PurchaseRequest requestFor(Long medicineId, Long supplierId, int quantity, double unitPrice) {
        PurchaseRequest r = new PurchaseRequest();
        r.setMedicineId(medicineId);
        r.setSupplierId(supplierId);
        r.setQuantity(quantity);
        r.setUnitPrice(BigDecimal.valueOf(unitPrice));
        r.setNote("Routine restock");
        return r;
    }

    private void stubSave() {
        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void createOrder_isPendingAndDoesNotTouchStock() {
        Medicine med = medicine(50);
        Supplier supplier = Supplier.builder().id(2L).name("ABC Pharma").build();
        User admin = User.builder().id(9L).fullName("Admin Pat").role(Role.ADMIN).build();

        when(medicineRepository.findById(1L)).thenReturn(Optional.of(med));
        when(supplierRepository.findById(2L)).thenReturn(Optional.of(supplier));
        when(currentUserProvider.getCurrentUser()).thenReturn(admin);
        stubSave();

        Purchase result = purchaseService.createOrder(requestFor(1L, 2L, 30, 12.5));

        assertThat(med.getQuantity()).isEqualTo(50); // unchanged
        verify(medicineRepository, never()).save(any());
        assertThat(result.getOrderStatus()).isEqualTo(PurchaseOrderStatus.PENDING);
        assertThat(result.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(375.0));
        verify(stockMovementService, never()).log(any(), any(), anyInt(), anyInt(), anyInt(), any(), anyString());
        verify(notificationService).create(eq(NotificationType.PURCHASE_ALERT), eq(Severity.INFO),
                anyString(), contains("ABC Pharma"), eq("ALL"), eq(1L));
    }

    @Test
    void createOrder_rejectsUnknownMedicine() {
        when(medicineRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> purchaseService.createOrder(requestFor(999L, null, 10, 5.0)))
                .isInstanceOf(EntityNotFoundException.class);
        verify(purchaseRepository, never()).save(any());
    }

    @Test
    void respondToOrder_supplierCanAcceptTheirOwnPendingOrder() {
        Supplier supplier = Supplier.builder().id(2L).name("ABC Pharma").build();
        Purchase purchase = Purchase.builder().id(500L).medicine(medicine(50)).supplier(supplier)
                .quantity(30).orderStatus(PurchaseOrderStatus.PENDING).build();
        User supplierUser = User.builder().id(3L).role(Role.SUPPLIER).supplierId(2L).build();

        when(purchaseRepository.findById(500L)).thenReturn(Optional.of(purchase));
        stubSave();

        Purchase result = purchaseService.respondToOrder(500L, true, "On it", supplierUser);

        assertThat(result.getOrderStatus()).isEqualTo(PurchaseOrderStatus.ACCEPTED);
        assertThat(result.getRespondedDate()).isNotNull();
    }

    @Test
    void respondToOrder_rejectsWhenOrderBelongsToAnotherSupplier() {
        Supplier supplier = Supplier.builder().id(2L).name("ABC Pharma").build();
        Purchase purchase = Purchase.builder().id(500L).medicine(medicine(50)).supplier(supplier)
                .quantity(30).orderStatus(PurchaseOrderStatus.PENDING).build();
        User otherSupplierUser = User.builder().id(4L).role(Role.SUPPLIER).supplierId(99L).build();

        when(purchaseRepository.findById(500L)).thenReturn(Optional.of(purchase));

        assertThatThrownBy(() -> purchaseService.respondToOrder(500L, true, null, otherSupplierUser))
                .isInstanceOf(AccessDeniedException.class);
        verify(purchaseRepository, never()).save(any());
    }

    @Test
    void receivePurchase_raisesStockLogsMovementAndNotifies() {
        Medicine med = medicine(50);
        Supplier supplier = Supplier.builder().id(2L).name("ABC Pharma").build();
        Purchase purchase = Purchase.builder().id(500L).medicine(med).supplier(supplier)
                .quantity(30).orderStatus(PurchaseOrderStatus.DISPATCHED).build();
        User admin = User.builder().id(9L).role(Role.ADMIN).build();

        when(purchaseRepository.findById(500L)).thenReturn(Optional.of(purchase));
        when(currentUserProvider.getCurrentUser()).thenReturn(admin);
        stubSave();

        Purchase result = purchaseService.receivePurchase(500L);

        assertThat(med.getQuantity()).isEqualTo(80);
        verify(medicineRepository).save(med);
        assertThat(result.getOrderStatus()).isEqualTo(PurchaseOrderStatus.RECEIVED);
        assertThat(result.getReceivedDate()).isNotNull();
        verify(stockMovementService).log(eq(med), eq(MovementType.PURCHASE_IN), eq(30),
                eq(50), eq(80), eq(admin), anyString());
        verify(notificationService).create(eq(NotificationType.PURCHASE_ALERT), eq(Severity.INFO),
                anyString(), contains("ABC Pharma"), eq("ALL"), eq(1L));
    }

    @Test
    void receivePurchase_rejectsAlreadyReceivedOrder() {
        Purchase purchase = Purchase.builder().id(500L).medicine(medicine(50))
                .quantity(30).orderStatus(PurchaseOrderStatus.RECEIVED).build();
        when(purchaseRepository.findById(500L)).thenReturn(Optional.of(purchase));

        assertThatThrownBy(() -> purchaseService.receivePurchase(500L))
                .isInstanceOf(IllegalStateException.class);
        verify(medicineRepository, never()).save(any());
    }

    private static String contains(String substring) {
        return org.mockito.ArgumentMatchers.argThat(s -> s != null && s.contains(substring));
    }
}
