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
public class CreatePrescriptionOrderRequest {

    private String doctorName;

    @NotNull(message = "Patient name is required")
    private String patientName;

    private String prescriptionFileUrl;

    private String notes;

    @NotNull(message = "Delivery address is required")
    private String deliveryAddress;

    @NotNull(message = "Contact phone is required")
    private String contactPhone;

    @NotEmpty(message = "Order must contain at least one medicine item")
    private List<OrderItemRequest> items;
}
