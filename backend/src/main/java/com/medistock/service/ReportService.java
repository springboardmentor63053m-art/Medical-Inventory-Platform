package com.medistock.service;

import com.medistock.model.Medicine;
import com.medistock.model.Purchase;
import com.medistock.model.StockMovement;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Generates downloadable CSV reports. CSV is used (rather than a binary
 * format) so reports open cleanly in Excel/Sheets with zero extra
 * dependencies, and are trivially diffable / scriptable.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final MedicineRepository medicineRepository;
    private final PurchaseRepository purchaseRepository;
    private final StockMovementRepository stockMovementRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] inventoryReportCsv() {
        StringBuilder sb = new StringBuilder("Name,Batch Number,Category,Supplier,Quantity,Reorder Level,Expiry Date,Price,Status\n");
        LocalDate today = LocalDate.now();
        for (Medicine m : medicineRepository.findAll()) {
            String status;
            if (m.getExpiryDate().isBefore(today)) status = "EXPIRED";
            else if (m.getExpiryDate().isBefore(today.plusDays(30))) status = "NEAR_EXPIRY";
            else if (m.getQuantity() == 0) status = "OUT_OF_STOCK";
            else if (m.getQuantity() <= m.getReorderLevel()) status = "LOW_STOCK";
            else status = "OK";

            sb.append(csv(m.getName())).append(",")
              .append(csv(m.getBatchNumber())).append(",")
              .append(csv(m.getCategory())).append(",")
              .append(csv(m.getSupplier() != null ? m.getSupplier().getName() : "")).append(",")
              .append(m.getQuantity()).append(",")
              .append(m.getReorderLevel()).append(",")
              .append(m.getExpiryDate()).append(",")
              .append(m.getPrice()).append(",")
              .append(status).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] expiryReportCsv() {
        StringBuilder sb = new StringBuilder("Name,Batch Number,Category,Expiry Date,Quantity,Status\n");
        LocalDate today = LocalDate.now();
        for (Medicine m : medicineRepository.findAll()) {
            if (m.getExpiryDate().isAfter(today.plusDays(30))) continue;
            String status = m.getExpiryDate().isBefore(today) ? "EXPIRED" : "NEAR_EXPIRY";
            sb.append(csv(m.getName())).append(",")
              .append(csv(m.getBatchNumber())).append(",")
              .append(csv(m.getCategory())).append(",")
              .append(m.getExpiryDate()).append(",")
              .append(m.getQuantity()).append(",")
              .append(status).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] purchaseHistoryReportCsv() {
        StringBuilder sb = new StringBuilder("Date,Medicine,Supplier,Quantity,Unit Price,Total,Purchased By\n");
        for (Purchase p : purchaseRepository.findAllByOrderByPurchaseDateDesc()) {
            sb.append(p.getPurchaseDate().format(FMT)).append(",")
              .append(csv(p.getMedicine().getName())).append(",")
              .append(csv(p.getSupplier() != null ? p.getSupplier().getName() : "")).append(",")
              .append(p.getQuantity()).append(",")
              .append(p.getUnitPrice()).append(",")
              .append(p.getTotalAmount()).append(",")
              .append(csv(p.getPurchasedBy() != null ? p.getPurchasedBy().getFullName() : "")).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] stockMovementReportCsv() {
        StringBuilder sb = new StringBuilder("Timestamp,Medicine,Type,Change,Previous Qty,New Qty,Performed By,Note\n");
        for (StockMovement m : stockMovementRepository.findAllByOrderByTimestampDesc()) {
            sb.append(m.getTimestamp().format(FMT)).append(",")
              .append(csv(m.getMedicine().getName())).append(",")
              .append(m.getType()).append(",")
              .append(m.getQuantityChange()).append(",")
              .append(m.getPreviousQuantity()).append(",")
              .append(m.getNewQuantity()).append(",")
              .append(csv(m.getPerformedBy() != null ? m.getPerformedBy().getFullName() : "System")).append(",")
              .append(csv(m.getNote())).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String csv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
