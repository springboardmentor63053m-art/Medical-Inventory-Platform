package com.medistock.reports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpirySummaryResponse {

    private Integer reportDays;
    private Integer totalInventoryRecords;

    private Integer expiredCount;
    private BigDecimal expiredValue;

    private Integer criticalCount;
    private BigDecimal criticalValue;

    private Integer warningCount;
    private BigDecimal warningValue;

    private Integer upcomingCount;
    private BigDecimal upcomingValue;

    private Integer safeCount;
    private BigDecimal safeValue;

    private BigDecimal safePercentage;
}