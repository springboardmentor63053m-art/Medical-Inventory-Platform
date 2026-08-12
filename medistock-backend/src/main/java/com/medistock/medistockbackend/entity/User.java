package com.medistock.medistockbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus accountStatus = AccountStatus.APPROVED;

    /*
     * Admin who approved this account.
     * JsonIgnore prevents infinite JSON recursion because
     * approvedBy is also a User.
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private LocalDateTime approvedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<StockLog> stockLogs;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Notification> notifications;


    // ==========================
    // GETTERS
    // ==========================

    public Long getId() {
        return this.id;
    }

    public String getUsername() {
        return this.username;
    }

    public String getPassword() {
        return this.password;
    }

    public String getEmail() {
        return this.email;
    }

    public String getPhone() {
        return this.phone;
    }

    public Role getRole() {
        return this.role;
    }

    public AccountStatus getAccountStatus() {
        return this.accountStatus;
    }

    public User getApprovedBy() {
        return this.approvedBy;
    }

    public LocalDateTime getApprovedAt() {
        return this.approvedAt;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public List<StockLog> getStockLogs() {
        return this.stockLogs;
    }

    public List<Notification> getNotifications() {
        return this.notifications;
    }


    // ==========================
    // SETTERS
    // ==========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }

    public void setApprovedBy(User approvedBy) {
        this.approvedBy = approvedBy;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setStockLogs(List<StockLog> stockLogs) {
        this.stockLogs = stockLogs;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }


    // ==========================
    // CONSTRUCTORS
    // ==========================

    public User() {
    }

    public User(
            Long id,
            String username,
            String password,
            String email,
            String phone,
            Role role,
            AccountStatus accountStatus,
            User approvedBy,
            LocalDateTime approvedAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<StockLog> stockLogs,
            List<Notification> notifications) {

        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.accountStatus = accountStatus;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.stockLogs = stockLogs;
        this.notifications = notifications;
    }


    // ==========================
    // AUTOMATIC TIMESTAMPS
    // ==========================

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (accountStatus == null) {
            accountStatus = AccountStatus.APPROVED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}