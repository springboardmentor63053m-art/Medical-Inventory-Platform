package com.medistock.prescription.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionOrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String doctorName;
    private String patientName;
    private String prescriptionFileUrl;
    private BigDecimal totalAmount;
    private String status;
    private String deliveryAddress;
    private String contactPhone;
    private String pharmacistNotes;
    private String verifiedBy;
    private LocalDateTime createdAt;
    private List<PrescriptionOrderItemResponse> items;
}
