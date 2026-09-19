package com.medistock.service;

import com.medistock.dto.AnalyticsDTO;

import java.time.LocalDateTime;

public interface AnalyticsService {
    AnalyticsDTO.DashboardAnalytics getDashboardAnalytics();
    AnalyticsDTO.InventoryAnalytics getInventoryAnalytics();
    AnalyticsDTO.ExpiryAnalytics getExpiryAnalytics();
    AnalyticsDTO.SupplierAnalytics getSupplierAnalytics();
    AnalyticsDTO.StockMovementAnalytics getStockMovementAnalytics(LocalDateTime from, LocalDateTime to);
    AnalyticsDTO.PurchaseAnalytics getPurchaseAnalytics(LocalDateTime from, LocalDateTime to);
}
