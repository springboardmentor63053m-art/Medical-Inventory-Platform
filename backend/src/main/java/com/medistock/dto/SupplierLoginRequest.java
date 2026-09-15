package com.medistock.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Admin-submitted request to provision a login for an existing supplier. */
@Data
public class SupplierLoginRequest {
    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
