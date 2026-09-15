package com.medistock.service;

import com.medistock.dto.InventoryHealthResponse;
import com.medistock.dto.InventoryHealthResponse.DeadStockItem;
import com.medistock.model.Medicine;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SaleItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Comparator;

/**
 * Dead-stock detection + a single composite "inventory health" score for
 * the Admin dashboard — turns raw counts (low stock, expired, ...) into one
 * decision-oriented number, and surfaces stock that's tying up money
 * without moving (a gap neither the reorder-level nor expiry alerts catch).
 */
@Service
@RequiredArgsConstructor
public class InventoryHealthService {

    private final MedicineRepository medicineRepository;
    private final SaleItemRepository saleItemRepository;
    private final SystemSettingsService systemSettingsService;

    public InventoryHealthResponse getHealth() {
        int deadStockWindowDays = systemSettingsService.get().getDeadStockWindowDays();
        List<Medicine> active = medicineRepository.findByActiveTrue();

        Map<Long, LocalDateTime> lastSaleByMedicine = new HashMap<>();
        for (Object[] row : saleItemRepository.findLastSaleDatePerMedicine()) {
            lastSaleByMedicine.put((Long) row[0], (LocalDateTime) row[1]);
        }

        long outOfStock = active.stream().filter(m -> m.getQuantity() == 0).count();
        long lowStock = active.stream().filter(m -> m.getQuantity() > 0 && m.getQuantity() <= m.getReorderLevel()).count();
        LocalDate today = LocalDate.now();
        long expiryRisk = active.stream().filter(m -> m.getExpiryDate() != null
                && !m.getExpiryDate().isAfter(today.plusDays(deadStockWindowDays))).count();

        List<DeadStockItem> deadStockItems = active.stream()
                .filter(m -> m.getQuantity() > 0)
                .map(m -> {
                    LocalDateTime lastSale = lastSaleByMedicine.get(m.getId());
                    Integer daysSince = lastSale == null ? null
                            : (int) ChronoUnit.DAYS.between(lastSale.toLocalDate(), today);
                    boolean isDead = lastSale == null || daysSince >= deadStockWindowDays;
                    if (!isDead) return null;
                    return DeadStockItem.builder()
                            .medicineId(m.getId())
                            .medicineName(m.getName())
                            .quantity(m.getQuantity())
                            .value(m.getPrice() == null ? BigDecimal.ZERO
                                    : m.getPrice().multiply(BigDecimal.valueOf(m.getQuantity())))
                            .daysSinceLastSale(daysSince)
                            .neverSold(lastSale == null)
                            .build();
                })
                .filter(java.util.Objects::nonNull)
                // Worst offenders first: never-sold, then longest-idle.
                .sorted(Comparator.comparing((DeadStockItem d) -> d.getDaysSinceLastSale() == null ? Integer.MAX_VALUE : d.getDaysSinceLastSale())
                        .reversed())
                .limit(25)
                .toList();

        long totalActive = active.size();
        int healthScore = computeHealthScore(totalActive, outOfStock, lowStock, expiryRisk, deadStockItems.size());

        return InventoryHealthResponse.builder()
                .healthScore(healthScore)
                .healthLabel(label(healthScore))
                .totalActiveMedicines(totalActive)
                .outOfStockCount(outOfStock)
                .lowStockCount(lowStock)
                .expiryRiskCount(expiryRisk)
                .deadStockCount(deadStockItems.size())
                .deadStockWindowDays(deadStockWindowDays)
                .deadStockItems(deadStockItems)
                .build();
    }

    /**
     * Four equally-weighted components, each 0-100: stock availability
     * (not out of stock), reorder compliance (not below reorder level),
     * expiry risk (not expiring soon/expired), and dead-stock (actively
     * selling). Defaults to a neutral 100 when there's no inventory yet
     * (nothing to be unhealthy about) rather than dividing by zero.
     */
    private int computeHealthScore(long total, long outOfStock, long lowStock, long expiryRisk, long deadStock) {
        if (total == 0) return 100;
        double availability = 100.0 * (total - outOfStock) / total;
        double reorderCompliance = 100.0 * (total - lowStock) / total;
        double expirySafety = 100.0 * (total - expiryRisk) / total;
        double deadStockHealth = 100.0 * (total - deadStock) / total;
        return (int) Math.round((availability + reorderCompliance + expirySafety + deadStockHealth) / 4.0);
    }

    private String label(int score) {
        if (score >= 90) return "Excellent";
        if (score >= 75) return "Healthy";
        if (score >= 50) return "Needs attention";
        return "Critical";
    }
}
