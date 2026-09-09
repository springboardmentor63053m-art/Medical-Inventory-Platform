package com.medistock.reports.controller;

import com.medistock.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
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
        "hasAnyRole('ADMIN', 'SUPPLIER')"
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


    /**
     * Architectural Rationale: Reports vs Analytics
     * - Reports Controller: Dedicated to exportable, document-oriented representations
     *   including multi-format summaries and downloadable files (JSON/CSV).
     * - Analytics Controller: Dedicated to computed, aggregated insights, KPI counters,
     *   and dashboard-oriented analytical metrics.
     */

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')")
    public ResponseEntity<?> getInventoryReport(
            @RequestParam(value = "format", defaultValue = "json") String format,
            @RequestHeader(value = HttpHeaders.ACCEPT, required = false) String acceptHeader
    ) {
        boolean isCsv = "csv".equalsIgnoreCase(format) ||
                (acceptHeader != null && acceptHeader.contains("text/csv"));

        if (isCsv) {
            String filename = "medistock-inventory-" + LocalDate.now() + ".csv";
            return createCsvResponse(filename, reportService.generateInventoryCsv());
        }

        return ResponseEntity.ok(reportService.getInventoryValuationSummary());
    }

    @GetMapping("/expiry")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')")
    public ResponseEntity<?> getExpiryReport(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(value = "format", defaultValue = "json") String format,
            @RequestHeader(value = HttpHeaders.ACCEPT, required = false) String acceptHeader
    ) {
        int safeDays = Math.max(1, Math.min(days, 365));
        boolean isCsv = "csv".equalsIgnoreCase(format) ||
                (acceptHeader != null && acceptHeader.contains("text/csv"));

        if (isCsv) {
            String filename = "medistock-expiry-" + safeDays + "-days-" + LocalDate.now() + ".csv";
            return createCsvResponse(filename, reportService.generateExpiryCsv(safeDays));
        }

        return ResponseEntity.ok(reportService.getExpirySummary(safeDays));
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