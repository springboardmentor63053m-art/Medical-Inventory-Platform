package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.SaleRequest;
import com.medistock.medistock_backend.dto.SaleResponse;

import java.util.List;

public interface SaleService {
    SaleResponse createSale(SaleRequest request, String currentUsername);
    List<SaleResponse> getAllSales();
    SaleResponse getSaleById(Long id);
}
