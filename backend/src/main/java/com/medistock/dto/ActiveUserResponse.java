package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiveUserResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    /** "ONLINE" or "OFFLINE" — derived from sessionActive + an inactivity timeout, not trusted from the client. */
    private String status;
    private LocalDateTime lastLoginAt;
    private LocalDateTime lastActivityAt;
}
