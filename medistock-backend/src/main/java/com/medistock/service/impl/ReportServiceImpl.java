package com.medistock.service.impl;

import com.medistock.enums.ActionType;
import com.medistock.enums.ExpiryStatus;
import com.medistock.repository.*;
import com.medistock.service.ReportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Service
public class ReportServiceImpl implements ReportService {

    private final InventoryRepository inventoryRepository;
    private final ExpiryTrackingRepository expiryTrackingRepository;
    private final StockLogRepository stockLogRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public ReportServiceImpl(
            InventoryRepository inventoryRepository,
            ExpiryTrackingRepository expiryTrackingRepository,
            StockLogRepository stockLogRepository,
            SupplierRepository supplierRepository,
            MedicineRepository medicineRepository,
            PurchaseOrderRepository purchaseOrderRepository) {
        this.inventoryRepository = inventoryRepository;
        this.expiryTrackingRepository = expiryTrackingRepository;
        this.stockLogRepository = stockLogRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateInventoryReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Medicine Code,Medicine Name,Category,Manufacturer,Supplier,Batch Number,Quantity,Min Stock,Max Stock,Location,Last Updated\n");

        var items = inventoryRepository.findAll();
        for (var inv : items) {
            var med = inv.getMedicine();
            csv.append(escape(inv.getId())).append(",")
               .append(escape(med.getMedicineCode())).append(",")
               .append(escape(med.getMedicineName())).append(",")
               .append(escape(med.getCategory())).append(",")
               .append(escape(med.getManufacturer())).append(",")
               .append(escape(med.getSupplier() != null ? med.getSupplier().getSupplierName() : "N/A")).append(",")
               .append(escape(med.getBatchNumber())).append(",")
               .append(inv.getQuantity()).append(",")
               .append(inv.getMinimumStock()).append(",")
               .append(inv.getMaximumStock()).append(",")
               .append(escape(inv.getLocation())).append(",")
               .append(inv.getLastUpdated() != null ? inv.getLastUpdated().toString() : "").append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateLowStockReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Medicine Code,Medicine Name,Category,Supplier,Quantity,Min Stock,Deficit,Location\n");

        var items = inventoryRepository.findLowStockItems();
        for (var inv : items) {
            var med = inv.getMedicine();
            int deficit = inv.getMinimumStock() - inv.getQuantity();
            csv.append(escape(inv.getId())).append(",")
               .append(escape(med.getMedicineCode())).append(",")
               .append(escape(med.getMedicineName())).append(",")
               .append(escape(med.getCategory())).append(",")
               .append(escape(med.getSupplier() != null ? med.getSupplier().getSupplierName() : "N/A")).append(",")
               .append(inv.getQuantity()).append(",")
               .append(inv.getMinimumStock()).append(",")
               .append(deficit).append(",")
               .append(escape(inv.getLocation())).append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateOutOfStockReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Medicine Code,Medicine Name,Category,Supplier,Min Stock,Location,Status\n");

        var items = inventoryRepository.findOutOfStockItems();
        for (var inv : items) {
            var med = inv.getMedicine();
            csv.append(escape(inv.getId())).append(",")
               .append(escape(med.getMedicineCode())).append(",")
               .append(escape(med.getMedicineName())).append(",")
               .append(escape(med.getCategory())).append(",")
               .append(escape(med.getSupplier() != null ? med.getSupplier().getSupplierName() : "N/A")).append(",")
               .append(inv.getMinimumStock()).append(",")
               .append(escape(inv.getLocation())).append(",")
               .append("OUT_OF_STOCK\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateExpiredReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Medicine Code,Medicine Name,Batch Number,Quantity,Expiry Date,Status\n");

        var items = expiryTrackingRepository.findByStatus(ExpiryStatus.EXPIRED);
        for (var exp : items) {
            var med = exp.getMedicine();
            csv.append(escape(exp.getId())).append(",")
               .append(escape(med.getMedicineCode())).append(",")
               .append(escape(med.getMedicineName())).append(",")
               .append(escape(exp.getBatchNumber())).append(",")
               .append(exp.getQuantity()).append(",")
               .append(exp.getExpiryDate() != null ? exp.getExpiryDate().toString() : "").append(",")
               .append("EXPIRED\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateExpiringSoonReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Medicine Code,Medicine Name,Batch Number,Quantity,Expiry Date,Days Remaining,Status\n");

        var items = expiryTrackingRepository.findByStatus(ExpiryStatus.EXPIRING_SOON);
        for (var exp : items) {
            var med = exp.getMedicine();
            long daysRemaining = exp.getExpiryDate() != null ?
                    java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), exp.getExpiryDate()) : 0;

            csv.append(escape(exp.getId())).append(",")
               .append(escape(med.getMedicineCode())).append(",")
               .append(escape(med.getMedicineName())).append(",")
               .append(escape(exp.getBatchNumber())).append(",")
               .append(exp.getQuantity()).append(",")
               .append(exp.getExpiryDate() != null ? exp.getExpiryDate().toString() : "").append(",")
               .append(daysRemaining).append(",")
               .append("EXPIRING_SOON\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateStockMovementReport(LocalDateTime from, LocalDateTime to, Long medicineId, ActionType actionType) {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Medicine Code,Medicine Name,Action Type,Quantity,Previous Qty,New Qty,Performed By,Remarks,Timestamp\n");

        var logs = stockLogRepository.findStockLogsForReport(from, to, medicineId, actionType);
        for (var log : logs) {
            var med = log.getMedicine();
            csv.append(escape(log.getId())).append(",")
               .append(escape(med != null ? med.getMedicineCode() : "")).append(",")
               .append(escape(med != null ? med.getMedicineName() : "")).append(",")
               .append(log.getActionType()).append(",")
               .append(log.getQuantity()).append(",")
               .append(log.getPreviousQuantity()).append(",")
               .append(log.getNewQuantity()).append(",")
               .append(escape(log.getPerformedBy())).append(",")
               .append(escape(log.getRemarks())).append(",")
               .append(log.getCreatedAt() != null ? log.getCreatedAt().toString() : "").append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateSupplierReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Supplier Name,Contact Person,Email,Phone,City,State,Status,Medicines Count\n");

        var suppliers = supplierRepository.findAll();
        for (var sup : suppliers) {
            long medCount = medicineRepository.countBySupplierId(sup.getId());
            csv.append(escape(sup.getId())).append(",")
               .append(escape(sup.getSupplierName())).append(",")
               .append(escape(sup.getContactPerson())).append(",")
               .append(escape(sup.getEmail())).append(",")
               .append(escape(sup.getPhone())).append(",")
               .append(escape(sup.getCity())).append(",")
               .append(escape(sup.getState())).append(",")
               .append(escape(sup.getStatus())).append(",")
               .append(medCount).append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePurchaseReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Order Number,Supplier Name,Order Date,Expected Delivery,Status,Total Amount\n");

        var orders = purchaseOrderRepository.findAll();
        for (var po : orders) {
            csv.append(escape(po.getId())).append(",")
               .append(escape(po.getOrderNumber())).append(",")
               .append(escape(po.getSupplier() != null ? po.getSupplier().getSupplierName() : "N/A")).append(",")
               .append(po.getOrderDate() != null ? po.getOrderDate().toString() : "").append(",")
               .append(po.getExpectedDelivery() != null ? po.getExpectedDelivery().toString() : "").append(",")
               .append(po.getStatus()).append(",")
               .append(po.getTotalAmount()).append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escape(Object obj) {
        if (obj == null) return "";
        String str = obj.toString();
        if (str.contains(",") || str.contains("\"") || str.contains("\n")) {
            str = str.replace("\"", "\"\"");
            return "\"" + str + "\"";
        }
        return str;
    }
}
