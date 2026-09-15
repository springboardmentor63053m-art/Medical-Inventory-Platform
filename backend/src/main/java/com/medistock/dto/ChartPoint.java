package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Generic labeled value, e.g. {label: "Q1", value: 50000} — used by every quarterly/distribution chart. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartPoint {
    private String label;
    private BigDecimal value;
}
