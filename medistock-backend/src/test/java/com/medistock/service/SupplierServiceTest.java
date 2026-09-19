package com.medistock.service;

import com.medistock.dto.SupplierDTO;
import com.medistock.entity.Supplier;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.service.impl.SupplierServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private SupplierServiceImpl supplierService;

    private Supplier supplier;
    private SupplierDTO supplierDTO;

    @BeforeEach
    void setUp() {
        supplier = Supplier.builder()
                .id(1L)
                .supplierName("Apex Pharma")
                .contactPerson("Sarah Jenkins")
                .email("sarah@apex.com")
                .phone("+1 555-9012")
                .status("ACTIVE")
                .build();

        supplierDTO = SupplierDTO.builder()
                .supplierName("Apex Pharma")
                .contactPerson("Sarah Jenkins")
                .email("sarah@apex.com")
                .phone("+1 555-9012")
                .status("ACTIVE")
                .build();
    }

    @Test
    void createSupplier_Success() {
        when(supplierRepository.existsByEmail("sarah@apex.com")).thenReturn(false);
        when(supplierRepository.existsByPhone("+1 555-9012")).thenReturn(false);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(supplier);

        SupplierDTO result = supplierService.createSupplier(supplierDTO);

        assertNotNull(result);
        assertEquals("Apex Pharma", result.getSupplierName());
        assertEquals("sarah@apex.com", result.getEmail());
        verify(supplierRepository, times(1)).save(any(Supplier.class));
    }

    @Test
    void createSupplier_DuplicateEmail_ThrowsBadRequest() {
        when(supplierRepository.existsByEmail("sarah@apex.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> supplierService.createSupplier(supplierDTO));
        verify(supplierRepository, never()).save(any());
    }

    @Test
    void deleteSupplier_LinkedToMedicines_ThrowsBadRequest() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(medicineRepository.existsBySupplierId(1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> supplierService.deleteSupplier(1L));
        verify(supplierRepository, never()).delete(any());
    }

    @Test
    void deleteSupplier_Success() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(medicineRepository.existsBySupplierId(1L)).thenReturn(false);

        supplierService.deleteSupplier(1L);

        verify(supplierRepository, times(1)).delete(supplier);
    }
}
