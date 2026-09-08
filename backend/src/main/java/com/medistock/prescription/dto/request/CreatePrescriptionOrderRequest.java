package com.medistock.prescription.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePrescriptionOrderRequest {

    private String doctorName;

    @NotBlank(message = "Patient name is required")
    @Size(min = 2, max = 100, message = "Patient name must be between 2 and 100 characters")
    private String patientName;

    private String prescriptionFileUrl;

    private String notes;

    @NotBlank(message = "Delivery address is required")
    @Size(min = 5, max = 255, message = "Delivery address must be at least 5 characters")
    private String deliveryAddress;

    @NotBlank(message = "Contact phone is required")
    @Pattern(regexp = "^[+]?[0-9\\s\\-\\(\\)]{7,20}$", message = "Contact phone must be a valid phone number")
    private String contactPhone;

    @NotEmpty(message = "Order must contain at least one medicine item")
    private List<PrescriptionOrderItemRequest> items;
}
