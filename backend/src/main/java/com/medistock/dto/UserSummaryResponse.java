package com.medistock.dto;

import com.medistock.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Row shape for the Admin User Management table (requirement 23). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private boolean active;
    private LocalDateTime lastLoginAt;
    private boolean online;

    public static UserSummaryResponse from(User u, boolean online) {
        return UserSummaryResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .active(u.isActive())
                .lastLoginAt(u.getLastLoginAt())
                .online(online)
                .build();
    }
}
