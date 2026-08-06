package com.medistock.dto;

import lombok.Data;

@Data
public class StockAdjustRequest {
    private int delta;
    private String reason;
}
