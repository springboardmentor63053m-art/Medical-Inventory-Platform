package com.medistock.reports.service;

import com.medistock.reports.dto.response.ExpirySummaryResponse;
import com.medistock.reports.dto.response.InventoryValuationSummaryResponse;
import com.medistock.reports.dto.response.SupplierPerformanceSummaryResponse;

public interface ReportService {

    InventoryValuationSummaryResponse
            getInventoryValuationSummary();

    ExpirySummaryResponse getExpirySummary(int days);

    SupplierPerformanceSummaryResponse
            getSupplierPerformanceSummary(int days);

    byte[] generateInventoryCsv();

    byte[] generateExpiryCsv(int days);
}