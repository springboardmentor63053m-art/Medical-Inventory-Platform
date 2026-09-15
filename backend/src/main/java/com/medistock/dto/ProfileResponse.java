package com.medistock.dto;

import com.medistock.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private boolean active;
    private Long supplierId;

    public static ProfileResponse from(User u) {
        return ProfileResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .active(u.isActive())
                .supplierId(u.getSupplierId())
                .build();
    }
}
