package com.medistock.service;

import com.medistock.dto.DashboardSummaryDTO;
import com.medistock.dto.SupplierDashboardDTO;

public interface DashboardService {
    DashboardSummaryDTO getDashboardSummary();
    SupplierDashboardDTO getSupplierDashboardSummary(Long supplierId);
    SupplierDashboardDTO getSupplierDashboardSummaryForUser(String email);
}
