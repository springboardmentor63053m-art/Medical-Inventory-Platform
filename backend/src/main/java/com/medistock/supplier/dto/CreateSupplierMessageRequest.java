package com.medistock.supplier.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupplierMessageRequest {
    @NotBlank(message = "Message content cannot be blank")
    private String content;

    private String messageType = "SUPPLIER_MESSAGE"; // SUPPLIER_MESSAGE, INTERNAL_NOTE, SYSTEM_EVENT

    private Long purchaseOrderId;
}
