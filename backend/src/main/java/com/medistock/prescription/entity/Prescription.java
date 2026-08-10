package com.medistock.prescription.entity;

import com.medistock.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import lombok.*;

import java.time.LocalDateTime;
import java.sql.Types;

@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "doctor_name", length = 150)
    private String doctorName;

    @Column(name = "patient_name", nullable = false, length = 150)
    private String patientName;

    @Column(name = "prescription_file_url", columnDefinition = "TEXT")
    private String prescriptionFileUrl;

    @JdbcTypeCode(Types.VARBINARY)
    @Column(name = "prescription_file", columnDefinition = "bytea")
    private byte[] prescriptionFile;

    @Column(name = "prescription_file_name", length = 255)
    private String prescriptionFileName;

    @Column(name = "prescription_content_type", length = 100)
    private String prescriptionContentType;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "PENDING_REVIEW";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
