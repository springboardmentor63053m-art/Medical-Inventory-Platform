package com.medistock.prescription.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyPrescriptionRequest {
    @NotNull(message = "Status is required (VERIFIED or REJECTED)")
    private String status;

    private String pharmacistNotes;
}
