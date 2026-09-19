package com.medistock.service;

import com.medistock.dto.CreateSaleRequest;
import com.medistock.dto.PageResponse;
import com.medistock.dto.SaleDTO;
import com.medistock.enums.SaleType;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SaleService {
    SaleDTO createSale(CreateSaleRequest request, Long soldById);
    PageResponse<SaleDTO> getAllSales(SaleType saleType, Pageable pageable);
    SaleDTO getSaleById(Long id);
    List<SaleDTO> getCustomerSales(Long customerId);
}
