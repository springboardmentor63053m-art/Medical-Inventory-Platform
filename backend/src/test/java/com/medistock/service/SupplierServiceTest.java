package com.medistock.service;

import com.medistock.dto.SupplierRequest;
import com.medistock.dto.SupplierSummaryResponse;
import com.medistock.model.Medicine;
import com.medistock.model.Purchase;
import com.medistock.model.Supplier;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Uses plain Mockito.mock()/manual construction rather than
 * @Mock/@InjectMocks + MockitoExtension, since SupplierService takes all
 * four repositories through a single constructor and this keeps the test
 * simple without needing a JUnit extension.
 */
class SupplierServiceTest {

    private final SupplierRepository supplierRepository = mock(SupplierRepository.class);
    private final MedicineRepository medicineRepository = mock(MedicineRepository.class);
    private final PurchaseRepository purchaseRepository = mock(PurchaseRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final SupplierService supplierService =
            new SupplierService(supplierRepository, medicineRepository, purchaseRepository, userRepository);

    private Medicine medicineFor(Supplier s, int qty, int reorderLevel) {
        return Medicine.builder().id(1L).name("Paracetamol").batchNumber("B1").quantity(qty)
                .reorderLevel(reorderLevel).expiryDate(LocalDate.now().plusYears(1))
                .price(BigDecimal.TEN).active(true).supplier(s).build();
    }

    @Test
    void create_savesSupplierFromRequest() {
        SupplierRequest request = new SupplierRequest();
        request.setName("ABC Pharma");
        request.setContactNumber("9999999999");
        request.setEmail("contact@abcpharma.com");
        request.setAddress("123 Main St");
        when(supplierRepository.save(any(Supplier.class))).thenAnswer(inv -> inv.getArgument(0));

        Supplier result = supplierService.create(request);

        assertThat(result.getName()).isEqualTo("ABC Pharma");
        assertThat(result.getEmail()).isEqualTo("contact@abcpharma.com");
    }

    @Test
    void update_rejectsUnknownSupplier() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());
        SupplierRequest request = new SupplierRequest();
        request.setName("Doesn't matter");

        assertThatThrownBy(() -> supplierService.update(99L, request))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void update_overwritesExistingFields() {
        Supplier existing = Supplier.builder().id(1L).name("Old Name").contactNumber("111").build();
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(supplierRepository.save(any(Supplier.class))).thenAnswer(inv -> inv.getArgument(0));

        SupplierRequest request = new SupplierRequest();
        request.setName("New Name");
        request.setContactNumber("222");
        request.setEmail("new@supplier.com");
        request.setAddress("New Address");

        Supplier result = supplierService.update(1L, request);

        assertThat(result.getName()).isEqualTo("New Name");
        assertThat(result.getContactNumber()).isEqualTo("222");
        assertThat(result.getEmail()).isEqualTo("new@supplier.com");
    }

    @Test
    void delete_removesTheSupplier() {
        Supplier existing = Supplier.builder().id(1L).name("ABC Pharma").build();
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(existing));

        supplierService.delete(1L);

        verify(supplierRepository).delete(existing);
    }

    @Test
    void getSummaries_aggregatesStockHealthAndPurchaseValuePerSupplier() {
        Supplier supplier = Supplier.builder().id(1L).name("ABC Pharma").contactNumber("111")
                .email("x@y.com").address("addr").build();
        when(supplierRepository.findAll()).thenReturn(List.of(supplier));

        Medicine lowStockMed = medicineFor(supplier, 5, 10);   // 5 <= reorderLevel(10), >0 -> low stock
        Medicine outOfStockMed = medicineFor(supplier, 0, 10); // 0 -> out of stock
        Medicine healthyMed = medicineFor(supplier, 100, 10);  // healthy
        when(medicineRepository.findBySupplier_Id(1L)).thenReturn(List.of(lowStockMed, outOfStockMed, healthyMed));

        Purchase p1 = Purchase.builder().id(1L).supplier(supplier).totalAmount(BigDecimal.valueOf(500))
                .purchaseDate(LocalDateTime.now().minusDays(1)).build();
        Purchase p2 = Purchase.builder().id(2L).supplier(supplier).totalAmount(BigDecimal.valueOf(300))
                .purchaseDate(LocalDateTime.now().minusDays(10)).build();
        // findBySupplier_IdOrderByPurchaseDateDesc — most recent first, per the method name.
        when(purchaseRepository.findBySupplier_IdOrderByPurchaseDateDesc(1L)).thenReturn(List.of(p1, p2));

        when(userRepository.existsBySupplierId(1L)).thenReturn(true);

        List<SupplierSummaryResponse> summaries = supplierService.getSummaries();

        assertThat(summaries).hasSize(1);
        SupplierSummaryResponse summary = summaries.get(0);
        assertThat(summary.getMedicinesSuppliedCount()).isEqualTo(3);
        assertThat(summary.getLowStockAmongSupplied()).isEqualTo(1);
        assertThat(summary.getOutOfStockAmongSupplied()).isEqualTo(1);
        assertThat(summary.getTotalPurchaseCount()).isEqualTo(2);
        assertThat(summary.getTotalPurchaseValue()).isEqualByComparingTo(BigDecimal.valueOf(800));
        assertThat(summary.isHasLogin()).isTrue();
    }

    @Test
    void getSummaries_handlesSupplierWithNoPurchaseHistory() {
        Supplier supplier = Supplier.builder().id(2L).name("New Supplier").build();
        when(supplierRepository.findAll()).thenReturn(List.of(supplier));
        when(medicineRepository.findBySupplier_Id(2L)).thenReturn(List.of());
        when(purchaseRepository.findBySupplier_IdOrderByPurchaseDateDesc(2L)).thenReturn(List.of());
        when(userRepository.existsBySupplierId(2L)).thenReturn(false);

        SupplierSummaryResponse summary = supplierService.getSummaries().get(0);

        assertThat(summary.getTotalPurchaseValue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(summary.getLastPurchaseDate()).isNull();
        assertThat(summary.isHasLogin()).isFalse();
    }
}
