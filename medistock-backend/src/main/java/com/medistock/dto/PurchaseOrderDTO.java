package com.medistock.dto;

import com.medistock.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrderDTO {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private String orderNumber;
    private LocalDate orderDate;
    private LocalDate expectedDelivery;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PurchaseOrderItemDTO> items;

    public PurchaseOrderDTO() {}

    public PurchaseOrderDTO(Long id, Long supplierId, String supplierName, String orderNumber, LocalDate orderDate, LocalDate expectedDelivery, OrderStatus status, BigDecimal totalAmount, LocalDateTime createdAt, LocalDateTime updatedAt, List<PurchaseOrderItemDTO> items) {
        this.id = id;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.orderNumber = orderNumber;
        this.orderDate = orderDate;
        this.expectedDelivery = expectedDelivery;
        this.status = status;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.items = items;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }

    public LocalDate getExpectedDelivery() { return expectedDelivery; }
    public void setExpectedDelivery(LocalDate expectedDelivery) { this.expectedDelivery = expectedDelivery; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<PurchaseOrderItemDTO> getItems() { return items; }
    public void setItems(List<PurchaseOrderItemDTO> items) { this.items = items; }

    public static PurchaseOrderDTOBuilder builder() { return new PurchaseOrderDTOBuilder(); }

    public static class PurchaseOrderDTOBuilder {
        private Long id;
        private Long supplierId;
        private String supplierName;
        private String orderNumber;
        private LocalDate orderDate;
        private LocalDate expectedDelivery;
        private OrderStatus status;
        private BigDecimal totalAmount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<PurchaseOrderItemDTO> items;

        public PurchaseOrderDTOBuilder id(Long id) { this.id = id; return this; }
        public PurchaseOrderDTOBuilder supplierId(Long supplierId) { this.supplierId = supplierId; return this; }
        public PurchaseOrderDTOBuilder supplierName(String supplierName) { this.supplierName = supplierName; return this; }
        public PurchaseOrderDTOBuilder orderNumber(String orderNumber) { this.orderNumber = orderNumber; return this; }
        public PurchaseOrderDTOBuilder orderDate(LocalDate orderDate) { this.orderDate = orderDate; return this; }
        public PurchaseOrderDTOBuilder expectedDelivery(LocalDate expectedDelivery) { this.expectedDelivery = expectedDelivery; return this; }
        public PurchaseOrderDTOBuilder status(OrderStatus status) { this.status = status; return this; }
        public PurchaseOrderDTOBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public PurchaseOrderDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PurchaseOrderDTOBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public PurchaseOrderDTOBuilder items(List<PurchaseOrderItemDTO> items) { this.items = items; return this; }

        public PurchaseOrderDTO build() {
            return new PurchaseOrderDTO(id, supplierId, supplierName, orderNumber, orderDate, expectedDelivery, status, totalAmount, createdAt, updatedAt, items);
        }
    }
}
