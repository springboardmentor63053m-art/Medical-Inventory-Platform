package com.medistock.customer.service;

import com.medistock.customer.dto.CreateCustomerRequest;
import com.medistock.customer.dto.CustomerDTO;
import com.medistock.customer.entity.Customer;
import com.medistock.prescription.dto.response.StorePurchaseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface CustomerService {
    String normalizePhone(String rawPhone);
    CustomerDTO lookupByPhone(String rawPhone);
    CustomerDTO createOrGetCustomer(CreateCustomerRequest request);
    Customer getCustomerEntityById(Long id);
    Page<CustomerDTO> getAllCustomers(String search, String status, Pageable pageable);
    CustomerDTO getCustomerDetails(Long id);
    List<StorePurchaseResponse> getCustomerPurchases(Long customerId);
    CustomerDTO updateCustomerStatus(Long id, String status);
    CustomerDTO patchCustomer(Long id, Map<String, Object> patchFields);
    Customer recordCustomerSale(String name, String phone, BigDecimal saleAmount);
}
