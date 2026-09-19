package com.medistock.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name", nullable = false, unique = true, length = 50)
    private String roleName;

    @Column(length = 255)
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Role() {}

    public Role(Long id, String roleName, String description, LocalDateTime createdAt) {
        this.id = id;
        this.roleName = roleName;
        this.description = description;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static RoleBuilder builder() { return new RoleBuilder(); }

    public static class RoleBuilder {
        private Long id;
        private String roleName;
        private String description;
        private LocalDateTime createdAt;

        public RoleBuilder id(Long id) { this.id = id; return this; }
        public RoleBuilder roleName(String roleName) { this.roleName = roleName; return this; }
        public RoleBuilder description(String description) { this.description = description; return this; }
        public RoleBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Role build() {
            return new Role(id, roleName, description, createdAt);
        }
    }
}
