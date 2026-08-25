package com.medistock.supplier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierConversationResponse {
    private Long id;
    private Long supplierId;
    private String supplierCode;
    private String supplierName;
    private String contactPerson;
    private String phone;
    private String email;
    private String status;
    private LocalDateTime lastMessageAt;
    private String lastMessageContent;
    private String lastMessageSender;
    private long unreadCount;
    private long activeOrdersCount;
    private String lastOrderNumber;
    private LocalDateTime createdAt;
}
