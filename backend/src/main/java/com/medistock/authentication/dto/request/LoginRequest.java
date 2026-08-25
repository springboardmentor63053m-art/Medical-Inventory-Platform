package com.medistock.authentication.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Employee ID or Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
