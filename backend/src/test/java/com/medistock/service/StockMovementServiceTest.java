package com.medistock.service;

import com.medistock.model.Medicine;
import com.medistock.model.MovementType;
import com.medistock.model.Role;
import com.medistock.model.StockMovement;
import com.medistock.model.User;
import com.medistock.repository.StockMovementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * StockMovementService is the single write path every other service
 * (MedicineService, PurchaseService, SaleService) funnels through to
 * create an audit record (requirement 7). These tests confirm it writes
 * exactly what it's given, with no silent transformation, and that the
 * read methods return what the repository provides in the right order.
 */
@ExtendWith(MockitoExtension.class)
class StockMovementServiceTest {

    @Mock private StockMovementRepository stockMovementRepository;

    @InjectMocks
    private StockMovementService stockMovementService;

    private Medicine medicine() {
        return Medicine.builder().id(1L).name("Paracetamol").batchNumber("B1").quantity(100)
                .reorderLevel(10).expiryDate(LocalDate.now().plusYears(1)).price(BigDecimal.TEN).active(true).build();
    }

    @Test
    void log_persistsAllFieldsExactlyAsGiven() {
        Medicine med = medicine();
        User performer = User.builder().id(5L).fullName("Pharmacist Pat").role(Role.PHARMACIST).build();
        when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        StockMovement result = stockMovementService.log(
                med, MovementType.PURCHASE_IN, 50, 100, 150, performer, "Purchase #42");

        ArgumentCaptor<StockMovement> captor = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository).save(captor.capture());
        StockMovement saved = captor.getValue();

        assertThat(saved.getMedicine()).isEqualTo(med);
        assertThat(saved.getType()).isEqualTo(MovementType.PURCHASE_IN);
        assertThat(saved.getQuantityChange()).isEqualTo(50);
        assertThat(saved.getPreviousQuantity()).isEqualTo(100);
        assertThat(saved.getNewQuantity()).isEqualTo(150);
        assertThat(saved.getPerformedBy()).isEqualTo(performer);
        assertThat(saved.getNote()).isEqualTo("Purchase #42");
        assertThat(result).isSameAs(saved);
    }

    @Test
    void log_acceptsNullPerformer() {
        // System-generated movements (e.g. seed-data backfill) have no human performer.
        Medicine med = medicine();
        when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        StockMovement result = stockMovementService.log(
                med, MovementType.INITIAL_STOCK, 100, 0, 100, null, "Initial stock from seed.sql");

        assertThat(result.getPerformedBy()).isNull();
        assertThat(result.getType()).isEqualTo(MovementType.INITIAL_STOCK);
    }

    @Test
    void getAll_delegatesToRepositoryOrderedByTimestampDesc() {
        List<StockMovement> movements = List.of(
                StockMovement.builder().id(2L).build(), StockMovement.builder().id(1L).build());
        when(stockMovementRepository.findAllByOrderByTimestampDesc()).thenReturn(movements);

        assertThat(stockMovementService.getAll()).containsExactlyElementsOf(movements);
    }

    @Test
    void getForMedicine_delegatesToRepositoryFilteredByMedicine() {
        List<StockMovement> movements = List.of(StockMovement.builder().id(3L).build());
        when(stockMovementRepository.findByMedicine_IdOrderByTimestampDesc(1L)).thenReturn(movements);

        assertThat(stockMovementService.getForMedicine(1L)).containsExactlyElementsOf(movements);
    }
}
