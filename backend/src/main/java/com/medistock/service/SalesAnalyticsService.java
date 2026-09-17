package com.medistock.service;

import com.medistock.dto.ChartPoint;
import com.medistock.dto.SalesOverviewResponse;
import com.medistock.dto.TopMedicineResponse;
import com.medistock.model.Purchase;
import com.medistock.model.Sale;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SaleItemRepository;
import com.medistock.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesAnalyticsService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final PurchaseRepository purchaseRepository;

    public SalesOverviewResponse getSalesOverview() {

        LocalDate today = LocalDate.now();
        YearMonth thisMonth = YearMonth.from(today);

        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfTomorrow = today.plusDays(1).atStartOfDay();

        LocalDateTime startOfMonth = thisMonth.atDay(1).atStartOfDay();
        LocalDateTime startOfNextMonth =
                thisMonth.plusMonths(1).atDay(1).atStartOfDay();

        LocalDateTime startOfYear =
                LocalDate.of(today.getYear(), 1, 1).atStartOfDay();
        LocalDateTime startOfNextYear =
                LocalDate.of(today.getYear() + 1, 1, 1).atStartOfDay();

        // Database calculates totals instead of loading every Sale entity.
        BigDecimal salesToday = saleRepository.sumSalesBetween(
                startOfToday,
                startOfTomorrow);

        BigDecimal salesThisMonth = saleRepository.sumSalesBetween(
                startOfMonth,
                startOfNextMonth);

        BigDecimal salesThisYear = saleRepository.sumSalesBetween(
                startOfYear,
                startOfNextYear);

        long medicinesSoldThisMonth =
                saleItemRepository.sumQuantitySoldBetween(
                        startOfMonth,
                        startOfNextMonth);

        long billsGeneratedThisMonth =
                saleRepository.countSalesBetween(
                        startOfMonth,
                        startOfNextMonth);

        // Only the latest 10 sales are required for the dashboard.
        List<Sale> recentSales =
                saleRepository.findTop10ByOrderBySaleDateDesc();

        List<com.medistock.dto.SaleResponse> recent =
                recentSales.stream()
                        .map(this::toSaleResponse)
                        .toList();

        return SalesOverviewResponse.builder()
                .salesToday(salesToday)
                .salesThisMonth(salesThisMonth)
                .salesThisYear(salesThisYear)
                .medicinesSoldThisMonth(medicinesSoldThisMonth)
                .billsGeneratedThisMonth(billsGeneratedThisMonth)
                .recentSales(recent)
                .topSellingMedicines(
                        topSellingMedicines(5))
                .quarterlySales(
                        quarterlyFromSales(
                                today.getYear()))
                .build();
    }

    /**
     * Gets the top-selling medicines directly from the database.
     */
    public List<TopMedicineResponse> topSellingMedicines(int limit) {

        return saleItemRepository.findTopSellingMedicines()
                .stream()
                .limit(limit)
                .map(row -> TopMedicineResponse.builder()
                        .medicineName((String) row[0])
                        .quantitySold(((Number) row[1]).longValue())
                        .revenue((BigDecimal) row[2])
                        .build())
                .toList();
    }

    /**
     * Kept for compatibility with any other service that may call
     * topSellingMedicines(List<Sale>, int).
     */
    public List<TopMedicineResponse> topSellingMedicines(
            List<Sale> sales,
            int limit) {

        return topSellingMedicines(limit);
    }

    /**
     * Quarterly sales total for the given year.
     *
     * This uses sales from the requested year rather than loading
     * the complete historical sales table.
     */
    public List<ChartPoint> quarterlyFromSales(int year) {

    LocalDateTime startOfYear =
            LocalDate.of(year, 1, 1).atStartOfDay();

    LocalDateTime startOfNextYear =
            LocalDate.of(year + 1, 1, 1).atStartOfDay();

    List<Object[]> sales =
            saleRepository.findSaleDatesAndAmountsBetween(
                    startOfYear,
                    startOfNextYear);

    BigDecimal[] totals = new BigDecimal[]{
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO
    };

    for (Object[] sale : sales) {

        LocalDateTime date =
                (LocalDateTime) sale[0];

        BigDecimal amount =
                (BigDecimal) sale[1];

        if (date == null || amount == null) {
            continue;
        }

        int q = quarterOf(date.getMonth());

        totals[q - 1] =
                totals[q - 1].add(amount);
    }

    return buildQuarterPoints(totals);
}
    /**
     * Compatibility method for existing callers.
     */
    public List<ChartPoint> quarterlyFromSales(
            List<Sale> sales,
            int year) {

        BigDecimal[] totals = new BigDecimal[]{
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        };

        for (Sale sale : sales) {

            if (sale.getSaleDate().getYear() != year) {
                continue;
            }

            int q = quarterOf(
                    sale.getSaleDate().getMonth());

            totals[q - 1] =
                    totals[q - 1].add(
                            sale.getTotalAmount());
        }

        return buildQuarterPoints(totals);
    }

    /**
     * Quarterly purchase value for the given year.
     *
     * Only purchaseDate and totalAmount are retrieved from the database.
     */
    public List<ChartPoint> quarterlyPurchaseValue(int year) {

        LocalDateTime startOfYear =
                LocalDate.of(year, 1, 1).atStartOfDay();

        LocalDateTime startOfNextYear =
                LocalDate.of(year + 1, 1, 1).atStartOfDay();

        List<Object[]> purchases =
                purchaseRepository.findPurchaseDatesAndAmountsBetween(
                        startOfYear,
                        startOfNextYear);

        BigDecimal[] totals = new BigDecimal[]{
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        };

        for (Object[] purchase : purchases) {

            LocalDateTime date =
                    (LocalDateTime) purchase[0];

            BigDecimal amount =
                    (BigDecimal) purchase[1];

            if (date == null || amount == null) {
                continue;
            }

            int q = quarterOf(date.getMonth());

            totals[q - 1] =
                    totals[q - 1].add(amount);
        }

        return buildQuarterPoints(totals);
    }

    private List<ChartPoint> buildQuarterPoints(
            BigDecimal[] totals) {

        List<ChartPoint> points =
                new ArrayList<>();

        for (int i = 0; i < 4; i++) {

            points.add(
                    ChartPoint.builder()
                            .label("Q" + (i + 1))
                            .value(totals[i])
                            .build());
        }

        return points;
    }

    private int quarterOf(Month month) {
        return (month.getValue() - 1) / 3 + 1;
    }

    private com.medistock.dto.SaleResponse toSaleResponse(
            Sale sale) {

        List<com.medistock.dto.SaleResponse.SaleItemResponse> items =
                sale.getItems()
                        .stream()
                        .map(i ->
                                com.medistock.dto.SaleResponse.SaleItemResponse
                                        .builder()
                                        .medicineId(
                                                i.getMedicine().getId())
                                        .medicineName(
                                                i.getMedicine().getName())
                                        .quantity(
                                                i.getQuantity())
                                        .unitPrice(
                                                i.getUnitPrice())
                                        .subtotal(
                                                i.getSubtotal())
                                        .build())
                        .toList();

        return com.medistock.dto.SaleResponse.builder()
                .id(sale.getId())
                .billNumber(sale.getBillNumber())
                .customerName(sale.getCustomerName())
                .soldByName(
                        sale.getSoldBy() != null
                                ? sale.getSoldBy().getFullName()
                                : "—")
                .totalAmount(sale.getTotalAmount())
                .saleDate(sale.getSaleDate())
                .items(items)
                .build();
    }
}