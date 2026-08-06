package com.medistock.controller;

import com.medistock.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Report Download Center. Every endpoint streams a CSV file.
 * Access is restricted per the feature spec:
 *  - inventory + stock-movements: ADMIN only
 *  - purchases: ADMIN + STAFF
 *  - expiry: ADMIN + PHARMACIST
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/inventory")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> inventoryReport() {
        return csvResponse(reportService.inventoryReportCsv(), "inventory-report");
    }

    @GetMapping("/expiry")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<byte[]> expiryReport() {
        return csvResponse(reportService.expiryReportCsv(), "expiry-report");
    }

    @GetMapping("/purchases")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','PHARMACIST')")
    public ResponseEntity<byte[]> purchaseReport() {
        return csvResponse(reportService.purchaseHistoryReportCsv(), "purchase-history-report");
    }

    @GetMapping("/stock-movements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> stockMovementReport() {
        return csvResponse(reportService.stockMovementReportCsv(), "stock-movement-report");
    }

    private ResponseEntity<byte[]> csvResponse(byte[] data, String baseName) {
        String filename = baseName + "-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }
}
