package com.medistock.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {
    @NotBlank
    private String name;
    private String contactNumber;
    private String email;
    private String address;
}
