package com.medistock.service;

import com.medistock.dto.MedicineRequest;
import com.medistock.model.Medicine;
import com.medistock.model.MovementType;
import com.medistock.model.Role;
import com.medistock.model.User;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockMovementRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.CurrentUserProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Covers the stock-integrity guarantees this pass fixed:
 *  - creating a medicine with opening stock logs an INITIAL_STOCK movement
 *    (requirement 7)
 *  - quantity changes on the generic update endpoint are never silent —
 *    they're routed through the same audited path as manual adjustments
 *    (requirement 9)
 *  - stock can never go negative, whether via adjustStock, a sale, or an
 *    update-triggered correction (requirement 8)
 *  - delete() soft-deletes medicines with history and hard-deletes ones
 *    without (requirement 10)
 */
@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock private MedicineRepository medicineRepository;
    @Mock private SupplierRepository supplierRepository;
    @Mock private StockMovementRepository stockMovementRepository;
    @Mock private StockMovementService stockMovementService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private MedicineService medicineService;

    private MedicineRequest requestFor(String name, int quantity) {
        MedicineRequest r = new MedicineRequest();
        r.setName(name);
        r.setBatchNumber("BATCH-1");
        r.setCategory("Analgesic");
        r.setQuantity(quantity);
        r.setReorderLevel(10);
        r.setManufacturingDate(LocalDate.now().minusMonths(6));
        r.setExpiryDate(LocalDate.now().plusYears(1));
        r.setPrice(BigDecimal.valueOf(25.0));
        return r;
    }

    private Medicine existingMedicine(Long id, int quantity, int reorderLevel) {
        return Medicine.builder()
                .id(id).name("Paracetamol").batchNumber("BATCH-1").quantity(quantity)
                .reorderLevel(reorderLevel).expiryDate(LocalDate.now().plusYears(1))
                .price(BigDecimal.valueOf(25.0)).active(true).build();
    }

    // ------------------------------------------------------------- create()

    @Test
    void create_logsInitialStockMovementWhenOpeningQuantityPositive() {
        MedicineRequest request = requestFor("Paracetamol", 100);
        when(medicineRepository.save(any(Medicine.class))).thenAnswer(inv -> {
            Medicine m = inv.getArgument(0);
            m.setId(1L);
            return m;
        });

        medicineService.create(request);

        verify(stockMovementService).log(any(Medicine.class), eq(MovementType.INITIAL_STOCK),
                eq(100), eq(0), eq(100), isNull(), anyString());
    }

    @Test
    void create_doesNotLogMovementWhenOpeningQuantityIsZero() {
        MedicineRequest request = requestFor("Paracetamol", 0);
        when(medicineRepository.save(any(Medicine.class))).thenAnswer(inv -> inv.getArgument(0));

        medicineService.create(request);

        verifyNoInteractions(stockMovementService);
    }

    // ------------------------------------------------------------- update()

    @Test
    void update_routesQuantityChangeThroughAuditedAdjustment() {
        Medicine existing = existingMedicine(1L, 100, 10);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(medicineRepository.save(any(Medicine.class))).thenAnswer(inv -> inv.getArgument(0));
        when(currentUserProvider.getCurrentUser()).thenReturn(null);

        MedicineRequest request = requestFor("Paracetamol", 150); // +50 correction
        medicineService.update(1L, request);

        // The quantity change must be logged as a MANUAL_ADJUSTMENT with the correct before/after values —
        // never applied to medicine.quantity silently.
        verify(stockMovementService).log(any(Medicine.class), eq(MovementType.MANUAL_ADJUSTMENT),
                eq(50), eq(100), eq(150), isNull(), anyString());
        assertThat(existing.getQuantity()).isEqualTo(150);
    }

    @Test
    void update_doesNotTouchStockMovementsWhenQuantityUnchanged() {
        Medicine existing = existingMedicine(1L, 100, 10);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(medicineRepository.save(any(Medicine.class))).thenAnswer(inv -> inv.getArgument(0));

        MedicineRequest request = requestFor("Paracetamol", 100); // same quantity
        medicineService.update(1L, request);

        verifyNoInteractions(stockMovementService);
    }

    @Test
    void update_rejectsCorrectionThatWouldGoNegative() {
        Medicine existing = existingMedicine(1L, 10, 10);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(medicineRepository.save(any(Medicine.class))).thenAnswer(inv -> inv.getArgument(0));

        MedicineRequest request = requestFor("Paracetamol", -5); // would compute delta -15 -> negative
        // NOTE: MedicineRequest.quantity is validated @PositiveOrZero at the controller layer;
        // this test exercises the service-layer guard directly regardless of that.
        request.setQuantity(-5);

        assertThatThrownBy(() -> medicineService.update(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient stock");
    }

    // -------------------------------------------------------- adjustStock()

    @Test
    void adjustStock_rejectsWhenResultWouldBeNegative() {
        Medicine existing = existingMedicine(1L, 5, 10);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> medicineService.adjustStock(1L, -10, "oops"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient stock for Paracetamol");

        verify(medicineRepository, never()).save(any());
        verifyNoInteractions(stockMovementService);
    }

    @Test
    void adjustStock_allowsExactDepletionToZero() {
        Medicine existing = existingMedicine(1L, 10, 10);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(medicineRepository.save(any(Medicine.class))).thenAnswer(inv -> inv.getArgument(0));
        when(currentUserProvider.getCurrentUser()).thenReturn(null);

        Medicine result = medicineService.adjustStock(1L, -10, "sold out");

        assertThat(result.getQuantity()).isEqualTo(0);
        verify(notificationService).create(eq(com.medistock.model.NotificationType.OUT_OF_STOCK),
                any(), anyString(), anyString(), eq("ALL"), eq(1L));
    }

    @Test
    void dispenseForSale_rejectsWhenQuantityExceedsStock() {
        Medicine existing = existingMedicine(1L, 3, 10);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> medicineService.dispenseForSale(1L, 5, "sale"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient stock");

        verify(medicineRepository, never()).save(any());
    }

    // -------------------------------------------------------------- delete()

    @Test
    void delete_softDeletesMedicineWithStockMovementHistory() {
        Medicine existing = existingMedicine(1L, 100, 10);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(stockMovementRepository.existsByMedicine_Id(1L)).thenReturn(true);

        medicineService.delete(1L);

        assertThat(existing.getActive()).isFalse();
        verify(medicineRepository).save(existing);
        verify(medicineRepository, never()).delete(any());
    }

    @Test
    void delete_hardDeletesMedicineWithNoHistory() {
        Medicine existing = existingMedicine(2L, 0, 10);
        when(medicineRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(stockMovementRepository.existsByMedicine_Id(2L)).thenReturn(false);

        medicineService.delete(2L);

        verify(medicineRepository).delete(existing);
        verify(medicineRepository, never()).save(any());
    }
}
