package com.medicalinventory.repository;

import com.medicalinventory.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByDoctorId(String doctorId);
    Optional<Doctor> findByRegistrationNumber(String registrationNumber);

    @Query("SELECT d FROM Doctor d WHERE " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(d.specialty) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(d.hospital) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Doctor> search(@Param("q") String query);

    List<Doctor> findByIsActiveTrue();
}
