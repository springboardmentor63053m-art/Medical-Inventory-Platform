package com.medistock.service;

import com.medistock.dto.MedicineDTO;
import com.medistock.dto.PageResponse;
import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.service.impl.MedicineServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private MedicineServiceImpl medicineService;

    private Medicine medicine;
    private MedicineDTO medicineDTO;
    private Supplier supplier;

    @BeforeEach
    void setUp() {
        supplier = Supplier.builder()
                .id(1L)
                .supplierName("Apex Pharma")
                .email("apex@pharma.com")
                .status("ACTIVE")
                .build();

        medicine = Medicine.builder()
                .id(10L)
                .medicineCode("MED-1001")
                .medicineName("Amoxicillin 500mg")
                .category("Antibiotics")
                .unitPrice(BigDecimal.valueOf(5.00))
                .sellingPrice(BigDecimal.valueOf(10.00))
                .supplier(supplier)
                .build();

        medicineDTO = MedicineDTO.builder()
                .medicineCode("MED-1001")
                .medicineName("Amoxicillin 500mg")
                .category("Antibiotics")
                .unitPrice(BigDecimal.valueOf(5.00))
                .sellingPrice(BigDecimal.valueOf(10.00))
                .supplierId(1L)
                .build();
    }

    @Test
    void createMedicine_Success() {
        when(medicineRepository.existsByMedicineCode("MED-1001")).thenReturn(false);
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);
        when(inventoryRepository.findByMedicineId(10L)).thenReturn(Optional.empty());

        MedicineDTO result = medicineService.createMedicine(medicineDTO);

        assertNotNull(result);
        assertEquals("MED-1001", result.getMedicineCode());
        assertEquals("Amoxicillin 500mg", result.getMedicineName());
        assertEquals("Apex Pharma", result.getSupplierName());
        verify(medicineRepository, times(1)).save(any(Medicine.class));
        verify(inventoryRepository, times(1)).save(any(Inventory.class));
    }

    @Test
    void createMedicine_DuplicateCode_ThrowsBadRequest() {
        when(medicineRepository.existsByMedicineCode("MED-1001")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> medicineService.createMedicine(medicineDTO));
        verify(medicineRepository, never()).save(any());
    }

    @Test
    void getMedicineById_Success() {
        when(medicineRepository.findById(10L)).thenReturn(Optional.of(medicine));

        MedicineDTO result = medicineService.getMedicineById(10L);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("MED-1001", result.getMedicineCode());
    }

    @Test
    void getMedicineById_NotFound_ThrowsResourceNotFound() {
        when(medicineRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> medicineService.getMedicineById(99L));
    }

    @Test
    void deleteMedicine_Success() {
        when(medicineRepository.findById(10L)).thenReturn(Optional.of(medicine));
        when(inventoryRepository.findByMedicineId(10L)).thenReturn(Optional.empty());

        medicineService.deleteMedicine(10L);

        verify(medicineRepository, times(1)).delete(medicine);
    }
}
