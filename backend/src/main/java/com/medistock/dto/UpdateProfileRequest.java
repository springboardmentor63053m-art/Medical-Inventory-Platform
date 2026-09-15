package com.medistock.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Profile fields a user may change about themselves. Role is deliberately absent — self-promotion is never allowed (requirement 22). */
@Data
public class UpdateProfileRequest {
    @NotBlank
    private String fullName;
}
