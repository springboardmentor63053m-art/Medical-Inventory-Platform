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


import com.medistock.purchase.dto.response.PurchaseOrderResponse;
import com.medistock.purchase.service.PurchaseOrderService;
import com.medistock.reports.dto.response.ExpirySummaryResponse;
import com.medistock.reports.dto.response.InventoryValuationSummaryResponse;
import com.medistock.reports.dto.response.SupplierPerformanceSummaryResponse;

import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private static final int MAX_EXPIRY_DAYS = 365;
        
    private final PurchaseOrderService purchaseOrderService;
    private final InventoryService inventoryService;

    @Override
    public InventoryValuationSummaryResponse
            getInventoryValuationSummary() {
        List<InventoryResponse> inventoryItems =
                inventoryService.getAllInventory();

        long totalUnits = 0L;
        BigDecimal totalValue = BigDecimal.ZERO;

        Map<String, Long> categoryUnits =
                new LinkedHashMap<>();

        Map<String, Integer> categoryRecords =
                new LinkedHashMap<>();

        Map<String, BigDecimal> categoryValues =
                new LinkedHashMap<>();

        for (InventoryResponse item : inventoryItems) {
            MedicineResponse medicine = item.getMedicine();

            long quantity =
                    item.getQuantity() == null
                            ? 0L
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

            String categoryName =
                    getCategoryName(medicine);

            if (categoryName == null ||
                    categoryName.isBlank()) {
                categoryName = "Uncategorised";
            }

            totalUnits += quantity;
            totalValue = totalValue.add(stockValue);

            categoryUnits.merge(
                    categoryName,
                    quantity,
                    Long::sum
            );

            categoryRecords.merge(
                    categoryName,
                    1,
                    Integer::sum
            );

            categoryValues.merge(
                    categoryName,
                    stockValue,
                    BigDecimal::add
            );
        }

        BigDecimal finalTotalValue = totalValue;

        List<InventoryValuationSummaryResponse
                .CategoryValuation> categories =
                categoryValues.entrySet()
                        .stream()
                        .map(entry -> {
                            BigDecimal percentage =
                                    finalTotalValue
                                            .compareTo(
                                                    BigDecimal.ZERO
                                            ) > 0
                                            ? entry.getValue()
                                                .multiply(
                                                    BigDecimal.valueOf(
                                                            100
                                                    )
                                                )
                                                .divide(
                                                    finalTotalValue,
                                                    2,
                                                    RoundingMode.HALF_UP
                                                )
                                            : BigDecimal.ZERO;

                            return InventoryValuationSummaryResponse
                                    .CategoryValuation
                                    .builder()
                                    .categoryName(
                                            entry.getKey()
                                    )
                                    .totalUnits(
                                            categoryUnits.getOrDefault(
                                                    entry.getKey(),
                                                    0L
                                            )
                                    )
                                    .inventoryRecords(
                                            categoryRecords
                                                    .getOrDefault(
                                                            entry.getKey(),
                                                            0
                                                    )
                                    )
                                    .stockValue(
                                            entry.getValue()
                                                    .setScale(
                                                            2,
                                                            RoundingMode.HALF_UP
                                                    )
                                    )
                                    .percentageOfTotal(
                                            percentage
                                    )
                                    .build();
                        })
                        .sorted(
                                Comparator.comparing(
                                        InventoryValuationSummaryResponse
                                                .CategoryValuation
                                                ::getStockValue
                                ).reversed()
                        )
                        .toList();

        BigDecimal averageUnitValue =
                totalUnits > 0
                        ? totalValue.divide(
                                BigDecimal.valueOf(totalUnits),
                                2,
                                RoundingMode.HALF_UP
                        )
                        : BigDecimal.ZERO;

        return InventoryValuationSummaryResponse
                .builder()
                .totalStockValue(
                        totalValue.setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                )
                .totalUnits(totalUnits)
                .totalRecords(inventoryItems.size())
                .averageUnitValue(averageUnitValue)
                .categoryValuations(categories)
                .build();
    }

   @Override
    public ExpirySummaryResponse getExpirySummary(
            int days
    ) {
        int safeDays = Math.max(
                1,
                Math.min(days, MAX_EXPIRY_DAYS)
        );

        List<InventoryResponse> inventoryItems =
                inventoryService.getAllInventory();

        LocalDate today = LocalDate.now();

        int expiredCount = 0;
        int criticalCount = 0;
        int warningCount = 0;
        int upcomingCount = 0;
        int safeCount = 0;

        BigDecimal expiredValue = BigDecimal.ZERO;
        BigDecimal criticalValue = BigDecimal.ZERO;
        BigDecimal warningValue = BigDecimal.ZERO;
        BigDecimal upcomingValue = BigDecimal.ZERO;
        BigDecimal safeValue = BigDecimal.ZERO;


        for (InventoryResponse item : inventoryItems) {
            if (item.getExpiryDate() == null) {
                continue;
            }

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

            long daysRemaining =
                    ChronoUnit.DAYS.between(
                            today,
                            item.getExpiryDate()
                    );

            if (daysRemaining < 0 ||
                    "EXPIRED".equalsIgnoreCase(
                            item.getExpiryStatus()
                    )) {
                expiredCount++;
                expiredValue =
                        expiredValue.add(stockValue);
            } else if (daysRemaining <= 30) {
                criticalCount++;
                criticalValue =
                        criticalValue.add(stockValue);
            } else if (daysRemaining <= 90) {
                warningCount++;
                warningValue =
                        warningValue.add(stockValue);
            } else {
                safeCount++;
                safeValue =
                        safeValue.add(stockValue);

                if (daysRemaining <= safeDays) {
                        upcomingCount++;
                        upcomingValue =
                                upcomingValue.add(stockValue);
                }
                }
        }

        BigDecimal safePercentage =
                inventoryItems.isEmpty()
                        ? BigDecimal.ZERO
                        : BigDecimal.valueOf(safeCount)
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .divide(
                                    BigDecimal.valueOf(
                                            inventoryItems.size()
                                    ),
                                    2,
                                    RoundingMode.HALF_UP
                            );

        return ExpirySummaryResponse.builder()
                .reportDays(safeDays)
                .totalInventoryRecords(
                        inventoryItems.size()
                )
                .expiredCount(expiredCount)
                .expiredValue(
                        expiredValue.setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                )
                .criticalCount(criticalCount)
                .criticalValue(
                        criticalValue.setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                )
                .warningCount(warningCount)
                .warningValue(
                        warningValue.setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                )
                .upcomingCount(upcomingCount)
                .upcomingValue(
                        upcomingValue.setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                )
                .safeCount(safeCount)
                .safeValue(
                        safeValue.setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                )
                .safePercentage(safePercentage)
                .build();
    }

        @Override
    public SupplierPerformanceSummaryResponse
            getSupplierPerformanceSummary(int days) {
        int safeDays = Math.max(
                1,
                Math.min(days, MAX_EXPIRY_DAYS)
        );

        LocalDate rangeEnd = LocalDate.now();
        LocalDate rangeStart =
                rangeEnd.minusDays(safeDays - 1L);

        List<PurchaseOrderResponse> orders =
                purchaseOrderService
                        .getAllPurchaseOrders()
                        .stream()
                        .filter(order ->
                                order.getOrderDate() != null &&
                                !order.getOrderDate()
                                        .isBefore(rangeStart) &&
                                !order.getOrderDate()
                                        .isAfter(rangeEnd)
                        )
                        .toList();

        Map<String, SupplierPerformanceSummaryResponse
                .SupplierMetric> metrics =
                new LinkedHashMap<>();

        Map<String, Long> deliveryDayTotals =
                new LinkedHashMap<>();

        Map<String, Integer> timedDeliveryCounts =
                new LinkedHashMap<>();

        BigDecimal totalProcurementValue =
                BigDecimal.ZERO;

        int totalOrders = 0;
        int activeOrders = 0;
        int receivedOrders = 0;
        int totalLateDeliveries = 0;

        for (PurchaseOrderResponse order : orders) {
            String supplierName =
                    order.getSupplier() == null ||
                    order.getSupplier()
                            .getSupplierName() == null
                            ? "Unknown Supplier"
                            : order.getSupplier()
                                    .getSupplierName();

            SupplierPerformanceSummaryResponse
                    .SupplierMetric metric =
                    metrics.computeIfAbsent(
                            supplierName,
                            name ->
                                    SupplierPerformanceSummaryResponse
                                            .SupplierMetric
                                            .builder()
                                            .supplierName(name)
                                            .purchaseOrderCount(0)
                                            .procurementValue(
                                                    BigDecimal.ZERO
                                            )
                                            .averageOrderValue(
                                                    BigDecimal.ZERO
                                            )
                                            .pendingCount(0)
                                            .approvedCount(0)
                                            .processingCount(0)
                                            .shippedCount(0)
                                            .receivedCount(0)
                                            .cancelledCount(0)
                                            .lateDeliveries(0)
                                            .averageDeliveryDays(null)
                                            .procurementShare(
                                                    BigDecimal.ZERO
                                            )
                                            .build()
                    );

            String status =
                    order.getStatus() == null
                            ? "PENDING"
                            : order.getStatus()
                                    .toUpperCase();

            BigDecimal amount =
                    order.getTotalAmount() == null
                            ? BigDecimal.ZERO
                            : order.getTotalAmount();

            metric.setPurchaseOrderCount(
                    metric.getPurchaseOrderCount() + 1
            );

            totalOrders++;

            switch (status) {
                case "PENDING" -> {
                    metric.setPendingCount(
                            metric.getPendingCount() + 1
                    );
                    activeOrders++;
                }

                case "APPROVED" -> {
                    metric.setApprovedCount(
                            metric.getApprovedCount() + 1
                    );
                    activeOrders++;
                }

                case "PROCESSING" -> {
                    metric.setProcessingCount(
                            metric.getProcessingCount() + 1
                    );
                    activeOrders++;
                }

                case "SHIPPED" -> {
                    metric.setShippedCount(
                            metric.getShippedCount() + 1
                    );
                    activeOrders++;
                }

                case "RECEIVED", "DELIVERED" -> {
                    metric.setReceivedCount(
                            metric.getReceivedCount() + 1
                    );
                    receivedOrders++;
                }

                case "CANCELLED" ->
                        metric.setCancelledCount(
                                metric.getCancelledCount() + 1
                        );

                default -> {
                }
            }

            if (!"CANCELLED".equals(status)) {
                metric.setProcurementValue(
                        metric.getProcurementValue()
                                .add(amount)
                );

                totalProcurementValue =
                        totalProcurementValue.add(amount);
            }

            if (("RECEIVED".equals(status) ||
                    "DELIVERED".equals(status)) &&
                    order.getReceivedAt() != null &&
                    order.getOrderDate() != null) {
                LocalDate receivedDate =
                        order.getReceivedAt()
                                .toLocalDate();

                long deliveryDays = Math.max(
                        0L,
                        ChronoUnit.DAYS.between(
                                order.getOrderDate(),
                                receivedDate
                        )
                );

                deliveryDayTotals.merge(
                        supplierName,
                        deliveryDays,
                        Long::sum
                );

                timedDeliveryCounts.merge(
                        supplierName,
                        1,
                        Integer::sum
                );

                if (order.getExpectedDelivery() != null &&
                        receivedDate.isAfter(
                                order.getExpectedDelivery()
                        )) {
                    metric.setLateDeliveries(
                            metric.getLateDeliveries() + 1
                    );

                    totalLateDeliveries++;
                }
            }
        }

        BigDecimal finalTotalProcurementValue =
                totalProcurementValue;

        List<SupplierPerformanceSummaryResponse
                .SupplierMetric> supplierMetrics =
                metrics.values()
                        .stream()
                        .peek(metric -> {
                            int nonCancelledOrders =
                                    metric.getPurchaseOrderCount() -
                                    metric.getCancelledCount();

                            BigDecimal averageOrderValue =
                                    nonCancelledOrders > 0
                                            ? metric
                                                .getProcurementValue()
                                                .divide(
                                                    BigDecimal.valueOf(
                                                            nonCancelledOrders
                                                    ),
                                                    2,
                                                    RoundingMode.HALF_UP
                                                )
                                            : BigDecimal.ZERO;

                            metric.setAverageOrderValue(
                                    averageOrderValue
                            );

                            int timedDeliveries =
                                    timedDeliveryCounts
                                            .getOrDefault(
                                                    metric.getSupplierName(),
                                                    0
                                            );

                            if (timedDeliveries > 0) {
                                metric.setAverageDeliveryDays(
                                        BigDecimal.valueOf(
                                                deliveryDayTotals
                                                    .getOrDefault(
                                                            metric.getSupplierName(),
                                                            0L
                                                    )
                                        ).divide(
                                                BigDecimal.valueOf(
                                                        timedDeliveries
                                                ),
                                                1,
                                                RoundingMode.HALF_UP
                                        )
                                );
                            }

                            BigDecimal share =
                                    finalTotalProcurementValue
                                            .compareTo(
                                                    BigDecimal.ZERO
                                            ) > 0
                                            ? metric
                                                .getProcurementValue()
                                                .multiply(
                                                    BigDecimal.valueOf(
                                                            100
                                                    )
                                                )
                                                .divide(
                                                    finalTotalProcurementValue,
                                                    1,
                                                    RoundingMode.HALF_UP
                                                )
                                            : BigDecimal.ZERO;

                            metric.setProcurementShare(share);
                        })
                        .sorted(
                                Comparator.comparing(
                                        SupplierPerformanceSummaryResponse
                                                .SupplierMetric
                                                ::getProcurementValue
                                ).reversed()
                        )
                        .toList();

        return SupplierPerformanceSummaryResponse
                .builder()
                .reportDays(safeDays)
                .totalOrders(totalOrders)
                .totalProcurementValue(
                        totalProcurementValue.setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                )
                .activeOrders(activeOrders)
                .receivedOrders(receivedOrders)
                .lateDeliveries(totalLateDeliveries)
                .suppliers(supplierMetrics)
                .build();
    }


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