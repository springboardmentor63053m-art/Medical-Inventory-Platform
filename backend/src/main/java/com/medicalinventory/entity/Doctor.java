package com.medicalinventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", unique = true, nullable = false, length = 20)
    private String doctorId; // DOC-0001

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String specialty;

    @Column(name = "registration_number", length = 50)
    private String registrationNumber;

    @Column(length = 200)
    private String hospital;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(length = 150)
    private String email;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Doctor() {}

    public Doctor(Long id, String doctorId, String name, String specialty, String registrationNumber,
                  String hospital, String contactPhone, String email, Boolean isActive,
                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.doctorId = doctorId;
        this.name = name;
        this.specialty = specialty;
        this.registrationNumber = registrationNumber;
        this.hospital = hospital;
        this.contactPhone = contactPhone;
        this.email = email;
        this.isActive = isActive != null ? isActive : true;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static DoctorBuilder builder() { return new DoctorBuilder(); }

    public static class DoctorBuilder {
        private Long id;
        private String doctorId;
        private String name;
        private String specialty;
        private String registrationNumber;
        private String hospital;
        private String contactPhone;
        private String email;
        private Boolean isActive = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public DoctorBuilder id(Long id) { this.id = id; return this; }
        public DoctorBuilder doctorId(String doctorId) { this.doctorId = doctorId; return this; }
        public DoctorBuilder name(String name) { this.name = name; return this; }
        public DoctorBuilder specialty(String specialty) { this.specialty = specialty; return this; }
        public DoctorBuilder registrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; return this; }
        public DoctorBuilder hospital(String hospital) { this.hospital = hospital; return this; }
        public DoctorBuilder contactPhone(String contactPhone) { this.contactPhone = contactPhone; return this; }
        public DoctorBuilder email(String email) { this.email = email; return this; }
        public DoctorBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public DoctorBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public DoctorBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Doctor build() {
            return new Doctor(id, doctorId, name, specialty, registrationNumber, hospital,
                    contactPhone, email, isActive, createdAt, updatedAt);
        }
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
