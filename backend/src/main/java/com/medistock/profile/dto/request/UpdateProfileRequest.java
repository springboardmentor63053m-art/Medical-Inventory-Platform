package com.medistock.profile.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private String phone;
}
