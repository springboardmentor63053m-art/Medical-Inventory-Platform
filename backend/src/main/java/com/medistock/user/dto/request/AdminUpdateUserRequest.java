package com.medistock.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUpdateUserRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private String phone;

    private Boolean enabled;

    private Boolean accountNonLocked;

    private Set<String> roles;
}
