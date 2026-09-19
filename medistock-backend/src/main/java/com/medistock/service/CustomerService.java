package com.medistock.service;

import com.medistock.dto.CustomerDTO;
import com.medistock.dto.PageResponse;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    CustomerDTO createCustomer(CustomerDTO dto);
    CustomerDTO getCustomerById(Long id);
    CustomerDTO getCustomerByPhone(String phone);
    PageResponse<CustomerDTO> getAllCustomers(String search, Pageable pageable);
    CustomerDTO updateCustomer(Long id, CustomerDTO dto);
}
