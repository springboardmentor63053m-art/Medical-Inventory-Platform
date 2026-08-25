package com.medistock.supplier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierMessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderUserId;
    private String senderName;
    private String senderRole;
    private String messageType; // SUPPLIER_MESSAGE, INTERNAL_NOTE, SYSTEM_EVENT
    private String content;
    private Long purchaseOrderId;
    private String purchaseOrderNumber;
    private BigDecimal purchaseOrderTotal;
    private String purchaseOrderStatus;
    private Boolean isReadByAdmin;
    private Boolean isReadBySupplier;
    private LocalDateTime createdAt;
    private List<SupplierMessageAttachmentDTO> attachments;
}
