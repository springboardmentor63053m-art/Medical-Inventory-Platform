package com.medistock.purchase.dto.response;

import com.medistock.supplier.dto.response.SupplierResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
    private Long id;
    private String orderNumber;
    private SupplierResponse supplier;
    private LocalDate orderDate;
    private LocalDate expectedDelivery;
    private String status;
    private BigDecimal totalAmount;
    
    private String createdBy;

    private String approvedBy;
    private LocalDateTime approvedAt;

    private String processedBy;
    private LocalDateTime processedAt;

    private String shippedBy;
    private LocalDateTime shippedAt;

    private String receivedBy;
    private LocalDateTime receivedAt;

    private String cancelledBy;
    private LocalDateTime cancelledAt;

    private String statusUpdatedBy;
    private LocalDateTime statusUpdatedAt;

    private List<PurchaseOrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
