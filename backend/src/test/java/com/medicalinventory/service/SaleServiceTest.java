package com.medicalinventory.service;

import com.medicalinventory.entity.Medicine;
import com.medicalinventory.entity.Sale;
import com.medicalinventory.entity.SaleItem;
import com.medicalinventory.entity.User;
import com.medicalinventory.exception.BadRequestException;
import com.medicalinventory.exception.ResourceNotFoundException;
import com.medicalinventory.repository.MedicineRepository;
import com.medicalinventory.repository.SaleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private SaleService saleService;

    private User testUser;
    private Medicine testMedicine;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("pharmacist")
                .build();

        testMedicine = Medicine.builder()
                .id(10L)
                .name("Paracetamol 650mg")
                .unitPrice(new BigDecimal("15.00"))
                .mrp(new BigDecimal("20.00"))
                .build();
    }

    @Test
    @DisplayName("Should create sale, calculate totals accurately, and trigger inventory decrement")
    void testCreateSale_Success() {
        SaleItem item = SaleItem.builder()
                .medicine(testMedicine)
                .quantity(3)
                .build();

        List<SaleItem> items = new ArrayList<>();
        items.add(item);

        Sale sale = Sale.builder()
                .customerName("John Doe")
                .customerPhone("9876543210")
                .paymentMethod(Sale.PaymentMethod.CASH)
                .discount(new BigDecimal("5.00"))
                .taxAmount(new BigDecimal("2.50"))
                .items(items)
                .build();

        when(medicineRepository.findById(10L)).thenReturn(Optional.of(testMedicine));
        when(saleRepository.save(any(Sale.class))).thenAnswer(i -> {
            Sale s = i.getArgument(0);
            s.setId(100L);
            return s;
        });

        Sale result = saleService.createSale(sale, testUser);

        assertNotNull(result);
        assertEquals(Sale.SaleStatus.COMPLETED, result.getStatus());
        assertEquals("John Doe", result.getCustomerName());
        assertNotNull(result.getSaleNumber());
        assertTrue(result.getSaleNumber().startsWith("SALE-"));

        // 3 items * 15.00 = 45.00 total
        assertEquals(new BigDecimal("45.00"), result.getTotalAmount());
        // 45.00 - 5.00 (discount) + 2.50 (tax) = 42.50 net
        assertEquals(new BigDecimal("42.50"), result.getNetAmount());

        // Verify inventory decrease called
        verify(inventoryService).decreaseStock(eq(testMedicine), eq(3), eq(100L), eq(testUser));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when sale item medicine does not exist")
    void testCreateSale_MedicineNotFound() {
        SaleItem item = SaleItem.builder()
                .medicine(Medicine.builder().id(999L).build())
                .quantity(1)
                .build();

        Sale sale = Sale.builder()
                .customerName("Jane Doe")
                .items(List.of(item))
                .build();

        when(medicineRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            saleService.createSale(sale, testUser);
        });

        verify(saleRepository, never()).save(any(Sale.class));
    }

    @Test
    @DisplayName("Should cancel sale and restore stock to inventory")
    void testCancelSale_Success() {
        SaleItem item = SaleItem.builder()
                .medicine(testMedicine)
                .quantity(2)
                .build();

        Sale existingSale = Sale.builder()
                .id(50L)
                .saleNumber("SALE-2026-0001")
                .status(Sale.SaleStatus.COMPLETED)
                .items(List.of(item))
                .build();

        when(saleRepository.findById(50L)).thenReturn(Optional.of(existingSale));
        when(saleRepository.save(any(Sale.class))).thenAnswer(i -> i.getArgument(0));

        Sale cancelled = saleService.cancelSale(50L, testUser);

        assertEquals(Sale.SaleStatus.CANCELLED, cancelled.getStatus());
        verify(inventoryService).increaseStock(eq(testMedicine), eq(2), eq(50L), eq(testUser), isNull(), isNull());
    }

    @Test
    @DisplayName("Should throw BadRequestException when trying to cancel already cancelled sale")
    void testCancelSale_AlreadyCancelled() {
        Sale alreadyCancelled = Sale.builder()
                .id(50L)
                .status(Sale.SaleStatus.CANCELLED)
                .build();

        when(saleRepository.findById(50L)).thenReturn(Optional.of(alreadyCancelled));

        assertThrows(BadRequestException.class, () -> {
            saleService.cancelSale(50L, testUser);
        });

        verify(saleRepository, never()).save(any(Sale.class));
    }
}
