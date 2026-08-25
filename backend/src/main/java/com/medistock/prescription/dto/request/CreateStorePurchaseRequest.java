package com.medistock.prescription.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStorePurchaseRequest {

    private Long customerId;

    private String customerName;

    private String customerPhone;

    @Builder.Default
    private String paymentMethod = "CASH";

    @NotEmpty(message = "Purchase must contain at least one medicine item")
    private List<OrderItemRequest> items;
}
