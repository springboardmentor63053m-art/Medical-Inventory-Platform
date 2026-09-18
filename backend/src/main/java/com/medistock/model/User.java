package com.medistock.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /**
     * Email verification status.
     * Normal registration users must verify their email before login.
     * Google OAuth users are treated as verified automatically.
     */
    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    /**
     * Only set for users with role SUPPLIER — links this login to the
     * Supplier record it may view/manage. Null for every other role.
     * Kept as a plain id (not a JPA relationship) so the core User entity
     * doesn't take on a hard dependency on the Supplier module.
     */
    @Column(name = "supplier_id")
    private Long supplierId;

    // --- Active-user tracking (Admin "Active Users" panel) ---
    private LocalDateTime lastLoginAt;
    private LocalDateTime lastActivityAt;

    /**
     * Flipped true on login, false on explicit logout.
     * Combined with lastActivityAt's inactivity window to decide ONLINE/OFFLINE.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean sessionActive = false;
}