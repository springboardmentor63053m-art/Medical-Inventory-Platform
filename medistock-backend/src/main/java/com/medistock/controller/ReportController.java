package com.medistock.controller;

import com.medistock.enums.ActionType;
import com.medistock.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Downloadable Report Generation APIs")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/inventory")
    @Operation(summary = "Download Inventory Report", description = "Export complete inventory catalogue in CSV format")
    public ResponseEntity<byte[]> getInventoryReport() {
        byte[] csv = reportService.generateInventoryReport();
        return createCsvResponse(csv, "medistock_inventory_report.csv");
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Download Low Stock Report", description = "Export low stock items in CSV format")
    public ResponseEntity<byte[]> getLowStockReport() {
        byte[] csv = reportService.generateLowStockReport();
        return createCsvResponse(csv, "medistock_low_stock_report.csv");
    }

    @GetMapping("/out-of-stock")
    @Operation(summary = "Download Out of Stock Report", description = "Export out-of-stock items in CSV format")
    public ResponseEntity<byte[]> getOutOfStockReport() {
        byte[] csv = reportService.generateOutOfStockReport();
        return createCsvResponse(csv, "medistock_out_of_stock_report.csv");
    }

    @GetMapping("/expired")
    @Operation(summary = "Download Expired Medicine Report", description = "Export expired medicine batches in CSV format")
    public ResponseEntity<byte[]> getExpiredReport() {
        byte[] csv = reportService.generateExpiredReport();
        return createCsvResponse(csv, "medistock_expired_report.csv");
    }

    @GetMapping("/expiring-soon")
    @Operation(summary = "Download Expiring Soon Report", description = "Export medicines expiring within 30 days in CSV format")
    public ResponseEntity<byte[]> getExpiringSoonReport() {
        byte[] csv = reportService.generateExpiringSoonReport();
        return createCsvResponse(csv, "medistock_expiring_soon_report.csv");
    }

    @GetMapping("/stock-movement")
    @Operation(summary = "Download Stock Movement Audit Report", description = "Export stock movements filtered by date range, medicine, and action type")
    public ResponseEntity<byte[]> getStockMovementReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long medicineId,
            @RequestParam(required = false) ActionType actionType
    ) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt = to != null ? to.atTime(LocalTime.MAX) : null;

        byte[] csv = reportService.generateStockMovementReport(fromDt, toDt, medicineId, actionType);
        return createCsvResponse(csv, "medistock_stock_movement_report.csv");
    }

    @GetMapping("/suppliers")
    @Operation(summary = "Download Supplier Report", description = "Export supplier directory and stock statistics in CSV format")
    public ResponseEntity<byte[]> getSupplierReport() {
        byte[] csv = reportService.generateSupplierReport();
        return createCsvResponse(csv, "medistock_supplier_report.csv");
    }

    @GetMapping("/purchases")
    @Operation(summary = "Download Purchase Order Report", description = "Export purchase orders in CSV format")
    public ResponseEntity<byte[]> getPurchaseReport() {
        byte[] csv = reportService.generatePurchaseReport();
        return createCsvResponse(csv, "medistock_purchase_report.csv");
    }

    private ResponseEntity<byte[]> createCsvResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }
}
