package com.medicalinventory.service;

import com.medicalinventory.entity.Doctor;
import com.medicalinventory.exception.ResourceNotFoundException;
import com.medicalinventory.repository.DoctorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getActive() {
        return doctorRepository.findByIsActiveTrue();
    }

    public Doctor getById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
    }

    public List<Doctor> search(String query) {
        if (query == null || query.isBlank()) return doctorRepository.findAll();
        return doctorRepository.search(query.trim());
    }

    @Transactional
    public Doctor create(Doctor doctor) {
        doctor.setDoctorId(generateDoctorId());
        Doctor saved = doctorRepository.save(doctor);
        log.info("Created doctor: {} - {}", saved.getDoctorId(), saved.getName());
        return saved;
    }

    @Transactional
    public Doctor update(Long id, Doctor updated) {
        Doctor doctor = getById(id);
        if (updated.getName() != null)               doctor.setName(updated.getName());
        if (updated.getSpecialty() != null)          doctor.setSpecialty(updated.getSpecialty());
        if (updated.getRegistrationNumber() != null) doctor.setRegistrationNumber(updated.getRegistrationNumber());
        if (updated.getHospital() != null)           doctor.setHospital(updated.getHospital());
        if (updated.getContactPhone() != null)       doctor.setContactPhone(updated.getContactPhone());
        if (updated.getEmail() != null)              doctor.setEmail(updated.getEmail());
        if (updated.getIsActive() != null)           doctor.setIsActive(updated.getIsActive());
        return doctorRepository.save(doctor);
    }

    @Transactional
    public void delete(Long id) {
        Doctor doctor = getById(id);
        doctorRepository.delete(doctor);
    }

    private String generateDoctorId() {
        long count = doctorRepository.count() + 1;
        return String.format("DOC-%04d", count);
    }
}
