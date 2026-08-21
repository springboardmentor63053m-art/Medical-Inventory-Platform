package com.medistock.reports.controller;

import com.medistock.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.medistock.reports.dto.response.ExpirySummaryResponse;
import com.medistock.reports.dto.response.InventoryValuationSummaryResponse;
import com.medistock.reports.dto.response.SupplierPerformanceSummaryResponse;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private static final MediaType CSV_MEDIA_TYPE =
            MediaType.parseMediaType(
                    "text/csv;charset=UTF-8"
            );

    private final ReportService reportService;

        @GetMapping("/valuation-summary")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')"
    )
    public ResponseEntity<InventoryValuationSummaryResponse>
            getInventoryValuationSummary() {
        return ResponseEntity.ok(
                reportService
                        .getInventoryValuationSummary()
        );
    }

    @GetMapping("/expiry-summary")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')"
    )
    public ResponseEntity<ExpirySummaryResponse>
            getExpirySummary(
                    @RequestParam(defaultValue = "30")
                    int days
            ) {
        int safeDays = Math.max(
                1,
                Math.min(days, 365)
        );

        return ResponseEntity.ok(
                reportService.getExpirySummary(safeDays)
        );
    }

    @GetMapping("/supplier-performance")
    @PreAuthorize(
            "hasAnyRole(" +
            "'ADMIN', 'PHARMACIST', 'STAFF', 'SUPPLIER'" +
            ")"
    )
    public ResponseEntity<
            SupplierPerformanceSummaryResponse>
            getSupplierPerformance(
                    @RequestParam(defaultValue = "30")
                    int days
            ) {
        int safeDays = Math.max(
                1,
                Math.min(days, 365)
        );

        return ResponseEntity.ok(
                reportService
                        .getSupplierPerformanceSummary(
                                safeDays
                        )
        );
    }


    @GetMapping(
            value = "/inventory.csv",
            produces = "text/csv"
    )
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')"
    )
    public ResponseEntity<byte[]> downloadInventoryReport() {
        String filename =
                "medistock-inventory-" +
                LocalDate.now() +
                ".csv";

        return createCsvResponse(
                filename,
                reportService.generateInventoryCsv()
        );
    }

    @GetMapping(
            value = "/expiry.csv",
            produces = "text/csv"
    )
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')"
    )
    public ResponseEntity<byte[]> downloadExpiryReport(
            @RequestParam(defaultValue = "30") int days
    ) {
        int safeDays = Math.max(1, Math.min(days, 365));

        String filename =
                "medistock-expiry-" +
                safeDays +
                "-days-" +
                LocalDate.now() +
                ".csv";

        return createCsvResponse(
                filename,
                reportService.generateExpiryCsv(safeDays)
        );
    }

    private ResponseEntity<byte[]> createCsvResponse(
            String filename,
            byte[] content
    ) {
        return ResponseEntity.ok()
                .contentType(CSV_MEDIA_TYPE)
                .cacheControl(CacheControl.noStore())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                        filename +
                        "\""
                )
                .body(content);
    }
}