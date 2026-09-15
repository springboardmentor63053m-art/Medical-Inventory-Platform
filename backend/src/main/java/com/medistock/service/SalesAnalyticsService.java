package com.medistock.service;

import com.medistock.dto.ChartPoint;
import com.medistock.dto.SalesOverviewResponse;
import com.medistock.dto.TopMedicineResponse;
import com.medistock.model.Purchase;
import com.medistock.model.Sale;
import com.medistock.model.SaleItem;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.util.*;

/**
 * All figures here are derived from actual Sale/Purchase rows at request
 * time — nothing is hardcoded, and quarters are computed from each record's
 * real date/timestamp (requirement 15).
 */
@Service
@RequiredArgsConstructor
public class SalesAnalyticsService {

    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;

    public SalesOverviewResponse getSalesOverview() {
        List<Sale> allSales = saleRepository.findAllByOrderBySaleDateDesc();
        LocalDate today = LocalDate.now();
        YearMonth thisMonth = YearMonth.from(today);

        BigDecimal salesToday = sumSales(allSales, s -> s.getSaleDate().toLocalDate().isEqual(today));
        BigDecimal salesThisMonth = sumSales(allSales, s -> YearMonth.from(s.getSaleDate()).equals(thisMonth));
        BigDecimal salesThisYear = sumSales(allSales, s -> s.getSaleDate().getYear() == today.getYear());

        long medicinesSoldThisMonth = allSales.stream()
                .filter(s -> YearMonth.from(s.getSaleDate()).equals(thisMonth))
                .flatMap(s -> s.getItems().stream())
                .mapToLong(SaleItem::getQuantity)
                .sum();

        long billsGeneratedThisMonth = allSales.stream()
                .filter(s -> YearMonth.from(s.getSaleDate()).equals(thisMonth))
                .count();

        List<com.medistock.dto.SaleResponse> recent = allSales.stream().limit(10).map(this::toSaleResponse).toList();

        return SalesOverviewResponse.builder()
                .salesToday(salesToday)
                .salesThisMonth(salesThisMonth)
                .salesThisYear(salesThisYear)
                .medicinesSoldThisMonth(medicinesSoldThisMonth)
                .billsGeneratedThisMonth(billsGeneratedThisMonth)
                .recentSales(recent)
                .topSellingMedicines(topSellingMedicines(allSales, 5))
                .quarterlySales(quarterlyFromSales(allSales, today.getYear()))
                .build();
    }

    public List<TopMedicineResponse> topSellingMedicines(List<Sale> sales, int limit) {
        Map<String, long[]> qtyByMedicine = new LinkedHashMap<>();
        Map<String, BigDecimal> revenueByMedicine = new LinkedHashMap<>();
        for (Sale sale : sales) {
            for (SaleItem item : sale.getItems()) {
                String name = item.getMedicine().getName();
                qtyByMedicine.computeIfAbsent(name, k -> new long[1])[0] += item.getQuantity();
                revenueByMedicine.merge(name, item.getSubtotal(), BigDecimal::add);
            }
        }
        return qtyByMedicine.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[0], a.getValue()[0]))
                .limit(limit)
                .map(e -> TopMedicineResponse.builder()
                        .medicineName(e.getKey())
                        .quantitySold(e.getValue()[0])
                        .revenue(revenueByMedicine.getOrDefault(e.getKey(), BigDecimal.ZERO))
                        .build())
                .toList();
    }

    /** Quarterly sales total for the given year, computed from each sale's own saleDate. */
    public List<ChartPoint> quarterlyFromSales(List<Sale> sales, int year) {
        BigDecimal[] totals = new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO};
        for (Sale sale : sales) {
            if (sale.getSaleDate().getYear() != year) continue;
            int q = quarterOf(sale.getSaleDate().getMonth());
            totals[q - 1] = totals[q - 1].add(sale.getTotalAmount());
        }
        return buildQuarterPoints(totals);
    }

    /** Quarterly purchase value for the given year, computed from each purchase's own purchaseDate. */
    public List<ChartPoint> quarterlyPurchaseValue(int year) {
        List<Purchase> purchases = purchaseRepository.findAllByOrderByPurchaseDateDesc();
        BigDecimal[] totals = new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO};
        for (Purchase p : purchases) {
            LocalDateTime date = p.getPurchaseDate();
            if (date.getYear() != year) continue;
            int q = quarterOf(date.getMonth());
            totals[q - 1] = totals[q - 1].add(p.getTotalAmount());
        }
        return buildQuarterPoints(totals);
    }

    private List<ChartPoint> buildQuarterPoints(BigDecimal[] totals) {
        List<ChartPoint> points = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            points.add(ChartPoint.builder().label("Q" + (i + 1)).value(totals[i]).build());
        }
        return points;
    }

    private int quarterOf(Month month) {
        return (month.getValue() - 1) / 3 + 1;
    }

    private BigDecimal sumSales(List<Sale> sales, java.util.function.Predicate<Sale> filter) {
        return sales.stream().filter(filter).map(Sale::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private com.medistock.dto.SaleResponse toSaleResponse(Sale sale) {
        List<com.medistock.dto.SaleResponse.SaleItemResponse> items = sale.getItems().stream()
                .map(i -> com.medistock.dto.SaleResponse.SaleItemResponse.builder()
                        .medicineId(i.getMedicine().getId())
                        .medicineName(i.getMedicine().getName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build())
                .toList();
        return com.medistock.dto.SaleResponse.builder()
                .id(sale.getId())
                .billNumber(sale.getBillNumber())
                .customerName(sale.getCustomerName())
                .soldByName(sale.getSoldBy() != null ? sale.getSoldBy().getFullName() : "—")
                .totalAmount(sale.getTotalAmount())
                .saleDate(sale.getSaleDate())
                .items(items)
                .build();
    }
}
