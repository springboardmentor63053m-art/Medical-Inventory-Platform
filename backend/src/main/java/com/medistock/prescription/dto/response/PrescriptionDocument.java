package com.medistock.prescription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDocument {
    private byte[] fileBytes;
    private String contentType;
    private String fileName;
}
