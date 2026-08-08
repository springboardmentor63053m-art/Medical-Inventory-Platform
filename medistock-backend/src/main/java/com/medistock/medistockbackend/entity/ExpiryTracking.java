package com.medistock.medistockbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "expiry_trackings")
public class ExpiryTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String medicineName;
    private LocalDate expiryDate;
    private String status; // e.g., EXPIRED, EXPIRING_SOON, SAFE

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public ExpiryTracking() {
    }

    public ExpiryTracking(Long id, String medicineName, LocalDate expiryDate, String status) {
        this.id = id;
        this.medicineName = medicineName;
        this.expiryDate = expiryDate;
        this.status = status;
    }
}
