package com.medistock.service;

import com.medistock.dto.SaleRequest;
import com.medistock.dto.SaleResponse;
import com.medistock.model.Medicine;
import com.medistock.model.Role;
import com.medistock.model.Sale;
import com.medistock.model.User;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SaleRepository;
import com.medistock.security.CurrentUserProvider;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Covers requirement 14 (a sale must validate stock for every line item
 * BEFORE writing anything, so a failure on item #2 never leaves item #1
 * half-applied) and requirement 15/42 (Staff can only view bills they
 * personally recorded; Admin/Pharmacist can view any bill).
 */
@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock private SaleRepository saleRepository;
    @Mock private MedicineRepository medicineRepository;
    @Mock private MedicineService medicineService;
    @Mock private CurrentUserProvider currentUserProvider;
    @Mock private UserActivityService userActivityService;

    @InjectMocks
    private SaleService saleService;

    private Medicine medicine(Long id, String name, int quantity, double price) {
        return Medicine.builder().id(id).name(name).batchNumber("B1").quantity(quantity)
                .reorderLevel(10).expiryDate(LocalDate.now().plusYears(1))
                .price(BigDecimal.valueOf(price)).active(true).build();
    }

    private SaleRequest.SaleItemRequest item(Long medicineId, int qty) {
        SaleRequest.SaleItemRequest i = new SaleRequest.SaleItemRequest();
        i.setMedicineId(medicineId);
        i.setQuantity(qty);
        return i;
    }

    @Test
    void recordSale_rejectsWhenNotSignedIn() {
        when(currentUserProvider.getCurrentUser()).thenReturn(null);
        SaleRequest request = new SaleRequest();
        request.setCustomerName("Walk-in");
        request.setItems(List.of(item(1L, 1)));

        assertThatThrownBy(() -> saleService.recordSale(request))
                .isInstanceOf(AccessDeniedException.class);
        verify(saleRepository, never()).save(any());
    }

    @Test
    void recordSale_rejectsInsufficientStockBeforeWritingAnything() {
        User seller = User.builder().id(3L).fullName("Staff Sam").role(Role.STAFF).build();
        when(currentUserProvider.getCurrentUser()).thenReturn(seller);

        Medicine plentiful = medicine(1L, "Paracetamol", 100, 10);
        Medicine scarce = medicine(2L, "Ibuprofen", 2, 20); // only 2 in stock
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(plentiful));
        when(medicineRepository.findById(2L)).thenReturn(Optional.of(scarce));

        SaleRequest request = new SaleRequest();
        request.setCustomerName("Ravi Kumar");
        // Item 1 is fine on its own; item 2 asks for more than is available.
        request.setItems(List.of(item(1L, 5), item(2L, 10)));

        assertThatThrownBy(() -> saleService.recordSale(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient stock for Ibuprofen");

        // Nothing was written at all — not even the sale row for item 1's medicine,
        // because validation happens for every item before any stock/sale mutation.
        verify(saleRepository, never()).save(any());
        verifyNoInteractions(medicineService);
    }

    @Test
    void recordSale_rejectsExpiredMedicineBeforeWritingAnything() {
        User seller = User.builder().id(3L).fullName("Staff Sam").role(Role.STAFF).build();
        when(currentUserProvider.getCurrentUser()).thenReturn(seller);

        Medicine fresh = medicine(1L, "Paracetamol", 100, 10);
        Medicine expired = medicine(2L, "Ibuprofen", 50, 20);
        expired.setExpiryDate(LocalDate.now().minusDays(1));
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(fresh));
        when(medicineRepository.findById(2L)).thenReturn(Optional.of(expired));

        SaleRequest request = new SaleRequest();
        request.setCustomerName("Ravi Kumar");
        request.setItems(List.of(item(1L, 5), item(2L, 1)));

        assertThatThrownBy(() -> saleService.recordSale(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ibuprofen")
                .hasMessageContaining("expired");

        verify(saleRepository, never()).save(any());
        verifyNoInteractions(medicineService);
    }

    @Test
    void recordSale_rejectsNonPositiveQuantity() {
        User seller = User.builder().id(3L).fullName("Staff Sam").role(Role.STAFF).build();
        when(currentUserProvider.getCurrentUser()).thenReturn(seller);

        SaleRequest request = new SaleRequest();
        request.setCustomerName("Ravi Kumar");
        request.setItems(List.of(item(1L, 0)));

        assertThatThrownBy(() -> saleService.recordSale(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("greater than zero");
        verifyNoInteractions(medicineRepository, saleRepository);
    }

    @Test
    void recordSale_rejectsUnknownMedicine() {
        User seller = User.builder().id(3L).fullName("Staff Sam").role(Role.STAFF).build();
        when(currentUserProvider.getCurrentUser()).thenReturn(seller);
        when(medicineRepository.findById(999L)).thenReturn(Optional.empty());

        SaleRequest request = new SaleRequest();
        request.setCustomerName("Ravi Kumar");
        request.setItems(List.of(item(999L, 1)));

        assertThatThrownBy(() -> saleService.recordSale(request))
                .isInstanceOf(EntityNotFoundException.class);
        verify(saleRepository, never()).save(any());
    }

    @Test
    void recordSale_happyPathDispensesEachItemAndTotalsCorrectly() {
        User seller = User.builder().id(3L).fullName("Staff Sam").role(Role.STAFF).build();
        when(currentUserProvider.getCurrentUser()).thenReturn(seller);

        Medicine med1 = medicine(1L, "Paracetamol", 100, 10.0);
        Medicine med2 = medicine(2L, "Ibuprofen", 50, 20.0);
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(med1));
        when(medicineRepository.findById(2L)).thenReturn(Optional.of(med2));
        when(medicineService.dispenseForSale(anyLong(), anyInt(), anyString())).thenReturn(null);

        when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> {
            Sale s = inv.getArgument(0);
            if (s.getId() == null) s.setId(777L);
            return s;
        });

        SaleRequest request = new SaleRequest();
        request.setCustomerName("Ravi Kumar");
        request.setItems(List.of(item(1L, 2), item(2L, 3))); // 2*10 + 3*20 = 80

        SaleResponse response = saleService.recordSale(request);

        assertThat(response.getBillNumber()).isEqualTo("INV-1777");
        assertThat(response.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(80.0));
        assertThat(response.getItems()).hasSize(2);

        verify(medicineService).dispenseForSale(eq(1L), eq(2), anyString());
        verify(medicineService).dispenseForSale(eq(2L), eq(3), anyString());
        verify(userActivityService).log(eq(seller), eq("SALE_RECORDED"), anyString());
    }

    @Test
    void getById_staffCanViewTheirOwnBill() {
        User staff = User.builder().id(3L).fullName("Staff Sam").role(Role.STAFF).build();
        when(currentUserProvider.getCurrentUser()).thenReturn(staff);

        Sale sale = Sale.builder().id(1L).billNumber("INV-1001").customerName("Ravi")
                .soldBy(staff).totalAmount(BigDecimal.TEN).items(List.of()).build();
        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));

        SaleResponse response = saleService.getById(1L);
        assertThat(response.getBillNumber()).isEqualTo("INV-1001");
    }

    @Test
    void getById_staffCannotViewSomeoneElsesBill() {
        User staff = User.builder().id(3L).fullName("Staff Sam").role(Role.STAFF).build();
        User otherStaff = User.builder().id(4L).fullName("Staff Alex").role(Role.STAFF).build();
        when(currentUserProvider.getCurrentUser()).thenReturn(staff);

        Sale sale = Sale.builder().id(1L).billNumber("INV-1001").customerName("Ravi")
                .soldBy(otherStaff).totalAmount(BigDecimal.TEN).items(List.of()).build();
        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));

        assertThatThrownBy(() -> saleService.getById(1L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void getById_adminCanViewAnyBill() {
        User admin = User.builder().id(9L).fullName("Boss Admin").role(Role.ADMIN).build();
        User staff = User.builder().id(3L).fullName("Staff Sam").role(Role.STAFF).build();
        when(currentUserProvider.getCurrentUser()).thenReturn(admin);

        Sale sale = Sale.builder().id(1L).billNumber("INV-1001").customerName("Ravi")
                .soldBy(staff).totalAmount(BigDecimal.TEN).items(List.of()).build();
        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));

        SaleResponse response = saleService.getById(1L);
        assertThat(response.getBillNumber()).isEqualTo("INV-1001");
    }
}
