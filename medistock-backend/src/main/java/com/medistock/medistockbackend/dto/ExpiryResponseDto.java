package com.medistock.medistockbackend.dto;

import java.time.LocalDate;

public class ExpiryResponseDto {
    private Long id;
    private String medicineName;
    private LocalDate expiryDate;
    private String status;

    public ExpiryResponseDto(Long id, String medicineName, LocalDate expiryDate, String status) {
        this.id = id;
        this.medicineName = medicineName;
        this.expiryDate = expiryDate;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
