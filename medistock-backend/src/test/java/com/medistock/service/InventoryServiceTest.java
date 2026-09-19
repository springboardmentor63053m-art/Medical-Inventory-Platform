package com.medistock.service;

import com.medistock.dto.InventoryDTO;
import com.medistock.dto.StockLogDTO;
import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.enums.ActionType;
import com.medistock.enums.NotificationType;
import com.medistock.exception.BadRequestException;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.service.impl.InventoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private StockLogService stockLogService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private Medicine medicine;
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        medicine = Medicine.builder()
                .id(1L)
                .medicineCode("MED-100")
                .medicineName("Paracetamol")
                .unitPrice(BigDecimal.valueOf(2.00))
                .build();

        inventory = Inventory.builder()
                .id(100L)
                .medicine(medicine)
                .quantity(50)
                .minimumStock(10)
                .maximumStock(500)
                .build();
    }

    @Test
    void adjustStock_StockIn_Success() {
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(inventoryRepository.findByMedicineId(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        InventoryDTO result = inventoryService.adjustStock(1L, 20, ActionType.IN, "Tester", "Restock");

        assertNotNull(result);
        assertEquals(70, result.getQuantity());
        verify(stockLogService, times(1)).createStockLog(any(StockLogDTO.class));
    }

    @Test
    void adjustStock_StockOut_Insufficient_ThrowsBadRequest() {
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(inventoryRepository.findByMedicineId(1L)).thenReturn(Optional.of(inventory));

        assertThrows(BadRequestException.class, () ->
                inventoryService.adjustStock(1L, 100, ActionType.OUT, "Tester", "Overdraw"));
    }

    @Test
    void adjustStock_TriggersLowStockNotification() {
        inventory.setQuantity(5);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(inventoryRepository.findByMedicineId(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        inventoryService.adjustStock(1L, 2, ActionType.OUT, "Tester", "Dispensed");

        verify(notificationService, times(1)).createNotification(anyString(), anyString(), eq(NotificationType.LOW_STOCK));
    }
}
