package com.medicalinventory.service;

import com.medicalinventory.entity.Inventory;
import com.medicalinventory.entity.Medicine;
import com.medicalinventory.entity.StockMovement;
import com.medicalinventory.entity.User;
import com.medicalinventory.exception.BadRequestException;
import com.medicalinventory.exception.ResourceNotFoundException;
import com.medicalinventory.repository.InventoryRepository;
import com.medicalinventory.repository.MedicineRepository;
import com.medicalinventory.repository.StockMovementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private AlertService alertService;

    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private Medicine testMedicine;
    private Inventory testInventory;
    private User testUser;

    @BeforeEach
    void setUp() {
        testMedicine = Medicine.builder()
                .id(1L)
                .name("Amoxicillin 500mg")
                .reorderLevel(50)
                .build();

        testInventory = Inventory.builder()
                .id(10L)
                .medicine(testMedicine)
                .quantity(100)
                .minQuantity(50)
                .batchNumber("AMX-2026-001")
                .expiryDate(LocalDate.now().plusMonths(6))
                .build();

        testUser = User.builder()
                .id(1L)
                .username("admin")
                .build();
    }

    @Test
    @DisplayName("Should return inventory when medicine exists")
    void testGetInventoryByMedicineId_Success() {
        when(inventoryRepository.findByMedicineId(1L)).thenReturn(Optional.of(testInventory));

        Inventory result = inventoryService.getInventoryByMedicineId(1L);

        assertNotNull(result);
        assertEquals(100, result.getQuantity());
        assertEquals("Amoxicillin 500mg", result.getMedicine().getName());
        verify(inventoryRepository, times(1)).findByMedicineId(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when medicine inventory missing")
    void testGetInventoryByMedicineId_NotFound() {
        when(inventoryRepository.findByMedicineId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            inventoryService.getInventoryByMedicineId(999L);
        });
    }

    @Test
    @DisplayName("Should successfully increase stock and save audit movement")
    void testAdjustStock_IncreaseSuccess() {
        when(inventoryRepository.findByMedicineId(1L)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        Inventory adjusted = inventoryService.adjustStock(1L, 25, "Restock batch", testUser);

        assertEquals(125, adjusted.getQuantity());
        verify(inventoryRepository).save(testInventory);
        verify(stockMovementRepository).save(any(StockMovement.class));
        verify(alertService).checkAndGenerateAlerts(eq(testMedicine), any(Inventory.class));
    }

    @Test
    @DisplayName("Should successfully decrease stock when sufficient quantity available")
    void testAdjustStock_DecreaseSuccess() {
        when(inventoryRepository.findByMedicineId(1L)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        Inventory adjusted = inventoryService.adjustStock(1L, -30, "Damaged stock write-off", testUser);

        assertEquals(70, adjusted.getQuantity());
        verify(inventoryRepository).save(testInventory);
        verify(stockMovementRepository).save(any(StockMovement.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException if adjustment results in negative quantity")
    void testAdjustStock_NegativeResult() {
        when(inventoryRepository.findByMedicineId(1L)).thenReturn(Optional.of(testInventory));

        assertThrows(BadRequestException.class, () -> {
            inventoryService.adjustStock(1L, -150, "Excess reduction", testUser);
        });

        verify(inventoryRepository, never()).save(any(Inventory.class));
        verify(stockMovementRepository, never()).save(any(StockMovement.class));
    }

    @Test
    @DisplayName("Should return low stock items from repository")
    void testGetLowStockItems() {
        when(inventoryRepository.findLowStockItems()).thenReturn(List.of(testInventory));

        List<Inventory> lowStock = inventoryService.getLowStockItems();

        assertNotNull(lowStock);
        assertEquals(1, lowStock.size());
        verify(inventoryRepository).findLowStockItems();
    }
}
