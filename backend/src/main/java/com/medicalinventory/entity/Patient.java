package com.medicalinventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", unique = true, nullable = false, length = 20)
    private String patientId; // PAT-2026-0001

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column
    private Integer age;

    @Column(length = 10)
    private String gender;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PatientStatus status = PatientStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "primary_doctor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Doctor primaryDoctor;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum PatientStatus {
        ACTIVE, FOLLOW_UP, ATTENTION_REQUIRED, ARCHIVED
    }

    public Patient() {}

    public Patient(Long id, String patientId, String firstName, String lastName, Integer age, String gender,
                   String phone, String email, String address, String bloodGroup, String allergies,
                   String medicalHistory, PatientStatus status, Doctor primaryDoctor,
                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.bloodGroup = bloodGroup;
        this.allergies = allergies;
        this.medicalHistory = medicalHistory;
        this.status = status != null ? status : PatientStatus.ACTIVE;
        this.primaryDoctor = primaryDoctor;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static PatientBuilder builder() { return new PatientBuilder(); }

    public static class PatientBuilder {
        private Long id;
        private String patientId;
        private String firstName;
        private String lastName;
        private Integer age;
        private String gender;
        private String phone;
        private String email;
        private String address;
        private String bloodGroup;
        private String allergies;
        private String medicalHistory;
        private PatientStatus status = PatientStatus.ACTIVE;
        private Doctor primaryDoctor;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public PatientBuilder id(Long id) { this.id = id; return this; }
        public PatientBuilder patientId(String patientId) { this.patientId = patientId; return this; }
        public PatientBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public PatientBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public PatientBuilder age(Integer age) { this.age = age; return this; }
        public PatientBuilder gender(String gender) { this.gender = gender; return this; }
        public PatientBuilder phone(String phone) { this.phone = phone; return this; }
        public PatientBuilder email(String email) { this.email = email; return this; }
        public PatientBuilder address(String address) { this.address = address; return this; }
        public PatientBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public PatientBuilder allergies(String allergies) { this.allergies = allergies; return this; }
        public PatientBuilder medicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; return this; }
        public PatientBuilder status(PatientStatus status) { this.status = status; return this; }
        public PatientBuilder primaryDoctor(Doctor primaryDoctor) { this.primaryDoctor = primaryDoctor; return this; }
        public PatientBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PatientBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Patient build() {
            return new Patient(id, patientId, firstName, lastName, age, gender, phone, email,
                    address, bloodGroup, allergies, medicalHistory, status, primaryDoctor, createdAt, updatedAt);
        }
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }
    public String getMedicalHistory() { return medicalHistory; }
    public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }
    public PatientStatus getStatus() { return status; }
    public void setStatus(PatientStatus status) { this.status = status; }
    public Doctor getPrimaryDoctor() { return primaryDoctor; }
    public void setPrimaryDoctor(Doctor primaryDoctor) { this.primaryDoctor = primaryDoctor; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
}
