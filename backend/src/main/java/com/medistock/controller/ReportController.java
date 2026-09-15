package com.medistock.controller;

import com.medistock.service.ReportService;
import com.medistock.service.ReportService.Format;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Locale;

/**
 * Report Download Center. Every endpoint accepts ?format=csv|xlsx|pdf
 * (csv is the default, for backward compatibility) and streams the file.
 * Access is restricted per the feature spec:
 *  - inventory + stock-movements: ADMIN only
 *  - purchases: ADMIN + PHARMACIST
 *  - sales: ADMIN + PHARMACIST
 *  - expiry: ADMIN + PHARMACIST
 *  - analytics (advanced report): ADMIN + PHARMACIST
 * STAFF is deliberately excluded from purchases/sales here even though they
 * can view their own bills in-app (/sales/mine) — these endpoints return the
 * full, unscoped history for every user, and there is no "my report" variant,
 * so granting STAFF access would let them download everyone else's sales and
 * customer data, not just their own.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/inventory")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> inventoryReport(@RequestParam(defaultValue = "csv") String format) {
        Format f = parse(format);
        return fileResponse(reportService.inventoryReport(f), "inventory-report", f);
    }

    @GetMapping("/expiry")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<byte[]> expiryReport(@RequestParam(defaultValue = "csv") String format) {
        Format f = parse(format);
        return fileResponse(reportService.expiryReport(f), "expiry-report", f);
    }

    @GetMapping("/purchases")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<byte[]> purchaseReport(@RequestParam(defaultValue = "csv") String format) {
        Format f = parse(format);
        return fileResponse(reportService.purchaseHistoryReport(f), "purchase-history-report", f);
    }

    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<byte[]> salesReport(@RequestParam(defaultValue = "csv") String format) {
        Format f = parse(format);
        return fileResponse(reportService.salesReport(f), "sales-report", f);
    }

    @GetMapping("/stock-movements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> stockMovementReport(@RequestParam(defaultValue = "csv") String format) {
        Format f = parse(format);
        return fileResponse(reportService.stockMovementReport(f), "stock-movement-report", f);
    }

    /** Advanced report: KPI summary + category valuation + low-stock/expiry watchlists + top suppliers. */
    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<byte[]> analyticsReport(@RequestParam(defaultValue = "pdf") String format) {
        Format f = parse(format);
        return fileResponse(reportService.analyticsReport(f), "advanced-analytics-report", f);
    }

    private Format parse(String format) {
        try {
            return Format.valueOf(format.toUpperCase(Locale.ROOT));
        } catch (Exception e) {
            return Format.CSV;
        }
    }

    private ResponseEntity<byte[]> fileResponse(byte[] data, String baseName, Format format) {
        String extension = switch (format) {
            case XLSX -> "xlsx";
            case PDF -> "pdf";
            default -> "csv";
        };
        MediaType mediaType = switch (format) {
            case XLSX -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case PDF -> MediaType.APPLICATION_PDF;
            default -> MediaType.parseMediaType("text/csv");
        };
        String filename = baseName + "-" + LocalDate.now() + "." + extension;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(data);
    }
}
