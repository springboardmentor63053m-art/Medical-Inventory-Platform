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
    private List<PurchaseOrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
