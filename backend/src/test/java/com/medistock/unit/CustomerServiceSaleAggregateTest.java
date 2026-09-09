package com.medistock.unit;

import com.medistock.customer.entity.Customer;
import com.medistock.customer.entity.CustomerStatus;
import com.medistock.customer.repository.CustomerRepository;
import com.medistock.customer.service.impl.CustomerServiceImpl;
import com.medistock.prescription.repository.StorePurchaseRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CustomerServiceSaleAggregateTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private StorePurchaseRepository storePurchaseRepository;

    @InjectMocks
    private CustomerServiceImpl customerService;

    @Test
    @DisplayName("NEW CUSTOMER + FIRST POS SALE of ₹14.50 sets totalPurchases=1 and lifetimeSpend=₹14.50")
    void testNewCustomerFirstSaleAggregateIncrement() {
        String phone = "9123456789";
        String name = "Lakshmi Devi";
        BigDecimal saleAmount = new BigDecimal("14.50");

        // Customer does not exist initially
        when(customerRepository.findByNormalizedPhone(phone)).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Customer result = customerService.recordCustomerSale(name, phone, saleAmount);

        assertNotNull(result, "Recorded customer should not be null");
        assertEquals(1L, result.getTotalPurchases(), "New customer first sale must have exactly 1 total purchase");
        assertEquals(new BigDecimal("14.50"), result.getLifetimeSpend(), "New customer first sale must have lifetimeSpend equal to 14.50");
        assertEquals(name, result.getName());
        assertEquals(phone, result.getNormalizedPhone());
    }

    @Test
    @DisplayName("EXISTING CUSTOMER receiving another ₹14.50 sale increments aggregates exactly once")
    void testExistingCustomerSubsequentSaleAggregateIncrement() {
        String phone = "9123456789";
        String name = "Lakshmi Devi";
        BigDecimal saleAmount = new BigDecimal("14.50");

        Customer existing = Customer.builder()
                .id(12L)
                .name(name)
                .phone(phone)
                .normalizedPhone(phone)
                .totalPurchases(1L)
                .lifetimeSpend(new BigDecimal("14.50"))
                .lastPurchaseAt(LocalDateTime.now().minusDays(1))
                .status(CustomerStatus.ACTIVE)
                .build();

        when(customerRepository.findByNormalizedPhone(phone)).thenReturn(Optional.of(existing));
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Customer result = customerService.recordCustomerSale(name, phone, saleAmount);

        assertNotNull(result, "Recorded customer should not be null");
        assertEquals(2L, result.getTotalPurchases(), "Existing customer should increment total purchases from 1 to 2");
        assertEquals(new BigDecimal("29.00"), result.getLifetimeSpend(), "Existing customer should increment lifetime spend from 14.50 to 29.00");
    }
}
