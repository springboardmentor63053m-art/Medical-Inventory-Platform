package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Supplier directory row, enriched with real activity data so the
 * Suppliers page shows complete, useful information per supplier
 * rather than just contact details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierSummaryResponse {
    private Long id;
    private String name;
    private String contactNumber;
    private String email;
    private String address;

    private long medicinesSuppliedCount;
    private long lowStockAmongSupplied;
    private long outOfStockAmongSupplied;

    private long totalPurchaseCount;
    private BigDecimal totalPurchaseValue;
    private String lastPurchaseDate;

    private boolean hasLogin;

    // --- Supplier performance (requirement: "supplier performance tracking") ---
    /** accepted / (accepted + rejected) as a 0-100 percentage; null if the supplier hasn't responded to any order yet. */
    private Double acceptanceRatePercent;
    private long acceptedCount;
    private long rejectedCount;
    private long pendingResponseCount;
    /** Average hours between order placement and supplier accept/reject; null if no data yet. */
    private Double avgResponseHours;
    /** Average hours between supplier acceptance and dispatch; null if no data yet. */
    private Double avgDispatchHours;
    /** Average hours between dispatch and Admin marking the order received; null if no data yet. */
    private Double avgFulfillmentHours;
    /** Composite 0-100 score blending acceptance rate and response/fulfillment speed; null until there's at least one responded order. */
    private Integer performanceScore;
}
