package com.medistock.reports.service.impl;

import com.medistock.inventory.dto.response.InventoryResponse;
import com.medistock.inventory.service.InventoryService;
import com.medistock.medicine.dto.response.MedicineResponse;
import com.medistock.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private static final int MAX_EXPIRY_DAYS = 365;

    private final InventoryService inventoryService;

    @Override
    public byte[] generateInventoryCsv() {
        StringBuilder csv = new StringBuilder();

        // UTF-8 BOM helps Excel display text correctly.
        csv.append('\uFEFF');

        appendRow(
                csv,
                "Inventory ID",
                "Medicine Code",
                "Medicine Name",
                "Brand Name",
                "Category",
                "Batch Number",
                "Quantity",
                "Minimum Stock",
                "Stock Status",
                "Expiry Date",
                "Expiry Status",
                "Storage Location",
                "Unit Price",
                "Stock Value"
        );

        inventoryService.getAllInventory().stream()
                .sorted(
                        Comparator.comparing(
                                InventoryResponse::getId,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
                )
                .forEach(item ->
                        appendInventoryRow(csv, item)
                );

        return csv.toString()
                .getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] generateExpiryCsv(int days) {
        int safeDays = Math.max(
                1,
                Math.min(days, MAX_EXPIRY_DAYS)
        );

        List<InventoryResponse> expiryItems =
                new ArrayList<>();

        expiryItems.addAll(
                inventoryService.getExpiredInventory()
        );

        expiryItems.addAll(
                inventoryService.getExpiringInventory(safeDays)
        );

        expiryItems.sort(
                Comparator.comparing(
                        InventoryResponse::getExpiryDate,
                        Comparator.nullsLast(
                                Comparator.naturalOrder()
                        )
                )
        );

        StringBuilder csv = new StringBuilder();
        csv.append('\uFEFF');

        appendRow(
                csv,
                "Inventory ID",
                "Medicine Code",
                "Medicine Name",
                "Category",
                "Batch Number",
                "Quantity",
                "Minimum Stock",
                "Stock Status",
                "Expiry Date",
                "Expiry Status",
                "Days Remaining",
                "Storage Location"
        );

        LocalDate today = LocalDate.now();

        for (InventoryResponse item : expiryItems) {
            MedicineResponse medicine = item.getMedicine();

            Long daysRemaining =
                    item.getExpiryDate() == null
                            ? null
                            : ChronoUnit.DAYS.between(
                                    today,
                                    item.getExpiryDate()
                            );

            appendRow(
                    csv,
                    item.getId(),
                    medicine == null
                            ? null
                            : medicine.getMedicineCode(),
                    medicine == null
                            ? null
                            : medicine.getName(),
                    getCategoryName(medicine),
                    item.getBatchNumber(),
                    item.getQuantity(),
                    item.getMinimumStock(),
                    item.getStockStatus(),
                    item.getExpiryDate(),
                    item.getExpiryStatus(),
                    daysRemaining,
                    item.getStorageLocation()
            );
        }

        return csv.toString()
                .getBytes(StandardCharsets.UTF_8);
    }

    private void appendInventoryRow(
            StringBuilder csv,
            InventoryResponse item
    ) {
        MedicineResponse medicine = item.getMedicine();

        int quantity =
                item.getQuantity() == null
                        ? 0
                        : item.getQuantity();

        BigDecimal unitPrice =
                medicine == null ||
                medicine.getUnitPrice() == null
                        ? BigDecimal.ZERO
                        : medicine.getUnitPrice();

        BigDecimal stockValue =
                unitPrice.multiply(
                        BigDecimal.valueOf(quantity)
                );

        appendRow(
                csv,
                item.getId(),
                medicine == null
                        ? null
                        : medicine.getMedicineCode(),
                medicine == null
                        ? null
                        : medicine.getName(),
                medicine == null
                        ? null
                        : medicine.getBrandName(),
                getCategoryName(medicine),
                item.getBatchNumber(),
                item.getQuantity(),
                item.getMinimumStock(),
                item.getStockStatus(),
                item.getExpiryDate(),
                item.getExpiryStatus(),
                item.getStorageLocation(),
                unitPrice,
                stockValue
        );
    }

    private String getCategoryName(
            MedicineResponse medicine
    ) {
        if (medicine == null ||
                medicine.getCategory() == null) {
            return null;
        }

        return medicine.getCategory().getName();
    }

    private void appendRow(
            StringBuilder csv,
            Object... values
    ) {
        for (int index = 0; index < values.length; index++) {
            if (index > 0) {
                csv.append(',');
            }

            csv.append(escapeCsv(values[index]));
        }

        csv.append("\r\n");
    }

    private String escapeCsv(Object value) {
        if (value == null) {
            return "\"\"";
        }

        String text = String.valueOf(value);

        // Prevent spreadsheet formula execution from text fields.
        if (text.startsWith("=") ||
                text.startsWith("+") ||
                text.startsWith("@")) {
            text = "'" + text;
        }

        text = text.replace("\"", "\"\"");

        return "\"" + text + "\"";
    }
}