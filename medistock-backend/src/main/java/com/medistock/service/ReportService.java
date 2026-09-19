package com.medistock.service;

import com.medistock.enums.ActionType;

import java.time.LocalDateTime;

public interface ReportService {
    byte[] generateInventoryReport();
    byte[] generateLowStockReport();
    byte[] generateOutOfStockReport();
    byte[] generateExpiredReport();
    byte[] generateExpiringSoonReport();
    byte[] generateStockMovementReport(LocalDateTime from, LocalDateTime to, Long medicineId, ActionType actionType);
    byte[] generateSupplierReport();
    byte[] generatePurchaseReport();
}
