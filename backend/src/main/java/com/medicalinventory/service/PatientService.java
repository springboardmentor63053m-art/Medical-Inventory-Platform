package com.medicalinventory.service;

import com.medicalinventory.entity.Doctor;
import com.medicalinventory.entity.Patient;
import com.medicalinventory.exception.ResourceAlreadyExistsException;
import com.medicalinventory.exception.ResourceNotFoundException;
import com.medicalinventory.repository.DoctorRepository;
import com.medicalinventory.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

@Service
public class PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientService.class);

    private final PatientRepository patientRepository;
    private final DoctorRepository  doctorRepository;

    public PatientService(PatientRepository patientRepository, DoctorRepository doctorRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository  = doctorRepository;
    }

    public List<Patient> getAll() {
        return patientRepository.findAll();
    }

    public Patient getById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + id));
    }

    public List<Patient> search(String query) {
        if (query == null || query.isBlank()) return patientRepository.findAll();
        return patientRepository.search(query.trim());
    }

    @Transactional
    public Patient create(Patient patient) {
        if (patient.getPhone() != null && patientRepository.existsByPhone(patient.getPhone())) {
            throw new ResourceAlreadyExistsException("A patient with phone " + patient.getPhone() + " already exists");
        }
        patient.setPatientId(generatePatientId());
        if (patient.getStatus() == null) {
            patient.setStatus(Patient.PatientStatus.ACTIVE);
        }
        if (patient.getPrimaryDoctor() != null && patient.getPrimaryDoctor().getId() != null) {
            Doctor doc = doctorRepository.findById(patient.getPrimaryDoctor().getId()).orElse(null);
            patient.setPrimaryDoctor(doc);
        }
        Patient saved = patientRepository.save(patient);
        log.info("Created patient: {} - {}", saved.getPatientId(), saved.getFullName());
        return saved;
    }

    @Transactional
    public Patient update(Long id, Patient updated) {
        Patient patient = getById(id);
        if (updated.getFirstName() != null) patient.setFirstName(updated.getFirstName());
        if (updated.getLastName() != null)  patient.setLastName(updated.getLastName());
        if (updated.getAge() != null)        patient.setAge(updated.getAge());
        if (updated.getGender() != null)     patient.setGender(updated.getGender());
        if (updated.getPhone() != null)      patient.setPhone(updated.getPhone());
        if (updated.getEmail() != null)      patient.setEmail(updated.getEmail());
        if (updated.getAddress() != null)    patient.setAddress(updated.getAddress());
        if (updated.getBloodGroup() != null) patient.setBloodGroup(updated.getBloodGroup());
        if (updated.getAllergies() != null)   patient.setAllergies(updated.getAllergies());
        if (updated.getMedicalHistory() != null) patient.setMedicalHistory(updated.getMedicalHistory());
        if (updated.getStatus() != null)     patient.setStatus(updated.getStatus());

        if (updated.getPrimaryDoctor() != null) {
            if (updated.getPrimaryDoctor().getId() != null) {
                Doctor doc = doctorRepository.findById(updated.getPrimaryDoctor().getId()).orElse(null);
                patient.setPrimaryDoctor(doc);
            } else {
                patient.setPrimaryDoctor(null);
            }
        }
        return patientRepository.save(patient);
    }

    @Transactional
    public void delete(Long id) {
        Patient patient = getById(id);
        patientRepository.delete(patient);
    }

    private String generatePatientId() {
        int year = Year.now().getValue();
        long count = patientRepository.count() + 1;
        return String.format("PAT-%d-%04d", year, count);
    }
}
