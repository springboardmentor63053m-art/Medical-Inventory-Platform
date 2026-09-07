package com.medicalinventory.repository;

import com.medicalinventory.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);

    List<Prescription> findByStatus(Prescription.PrescriptionStatus status);

    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId ORDER BY p.createdAt DESC")
    List<Prescription> findByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT p FROM Prescription p WHERE p.doctor.id = :doctorId ORDER BY p.createdAt DESC")
    List<Prescription> findByDoctorId(@Param("doctorId") Long doctorId);

    long countByStatus(Prescription.PrescriptionStatus status);

    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.prescriptionDate = :today")
    long countToday(@Param("today") LocalDate today);

    @Query("SELECT p FROM Prescription p ORDER BY p.createdAt DESC")
    List<Prescription> findAllOrderByCreatedAtDesc();
}
