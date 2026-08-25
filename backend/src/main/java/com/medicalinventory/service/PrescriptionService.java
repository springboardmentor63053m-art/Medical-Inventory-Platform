package com.medicalinventory.service;

import com.medicalinventory.entity.*;
import com.medicalinventory.exception.*;
import com.medicalinventory.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class PrescriptionService {

    private static final Logger log = LoggerFactory.getLogger(PrescriptionService.class);

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository      patientRepository;
    private final DoctorRepository       doctorRepository;
    private final MedicineRepository     medicineRepository;
    private final InventoryRepository    inventoryRepository;
    private final SaleRepository         saleRepository;
    private final InventoryService       inventoryService;
    private final AuditLogService        auditLogService;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               PatientRepository patientRepository,
                               DoctorRepository doctorRepository,
                               MedicineRepository medicineRepository,
                               InventoryRepository inventoryRepository,
                               SaleRepository saleRepository,
                               InventoryService inventoryService,
                               AuditLogService auditLogService) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository      = patientRepository;
        this.doctorRepository       = doctorRepository;
        this.medicineRepository     = medicineRepository;
        this.inventoryRepository    = inventoryRepository;
        this.saleRepository         = saleRepository;
        this.inventoryService       = inventoryService;
        this.auditLogService        = auditLogService;
    }

    public List<Prescription> getAll() {
        return prescriptionRepository.findAllOrderByCreatedAtDesc();
    }

    public List<Prescription> getByStatus(Prescription.PrescriptionStatus status) {
        return prescriptionRepository.findByStatus(status);
    }

    public Prescription getById(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));
    }

    public Map<String, Long> getStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("total",        prescriptionRepository.count());
        stats.put("pending",      prescriptionRepository.countByStatus(Prescription.PrescriptionStatus.PENDING));
        stats.put("underReview",  prescriptionRepository.countByStatus(Prescription.PrescriptionStatus.UNDER_REVIEW));
        stats.put("approved",     prescriptionRepository.countByStatus(Prescription.PrescriptionStatus.APPROVED));
        stats.put("rejected",     prescriptionRepository.countByStatus(Prescription.PrescriptionStatus.REJECTED));
        stats.put("dispensed",    prescriptionRepository.countByStatus(Prescription.PrescriptionStatus.DISPENSED));
        stats.put("today",        prescriptionRepository.countToday(LocalDate.now()));
        return stats;
    }

    @Transactional
    public Prescription create(Prescription prescription, User creator) {
        Patient patient = patientRepository.findById(prescription.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        Doctor doctor = doctorRepository.findById(prescription.getDoctor().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setCreatedBy(creator);
        prescription.setStatus(Prescription.PrescriptionStatus.PENDING);
        prescription.setPrescriptionNumber(generatePrescriptionNumber());
        if (prescription.getPrescriptionDate() == null) {
            prescription.setPrescriptionDate(LocalDate.now());
        }

        // Resolve medicine references for items
        for (PrescriptionItem item : prescription.getItems()) {
            Medicine medicine = medicineRepository.findById(item.getMedicine().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + item.getMedicine().getId()));
            item.setMedicine(medicine);
            item.setPrescription(prescription);
        }

        Prescription saved = prescriptionRepository.save(prescription);
        auditLogService.log("PRESCRIPTION_CREATED", "PRESCRIPTION", saved.getId(),
                null, saved.getPrescriptionNumber(),
                "New prescription created for " + patient.getFullName(), creator);
        log.info("Prescription created: {}", saved.getPrescriptionNumber());
        return saved;
    }

    @Transactional
    public Prescription approve(Long id, User approver) {
        Prescription prescription = getById(id);
        if (prescription.getStatus() != Prescription.PrescriptionStatus.PENDING &&
            prescription.getStatus() != Prescription.PrescriptionStatus.UNDER_REVIEW) {
            throw new BadRequestException("Only PENDING or UNDER_REVIEW prescriptions can be approved");
        }

        String oldStatus = prescription.getStatus().name();
        prescription.setStatus(Prescription.PrescriptionStatus.APPROVED);
        prescription.setVerifiedBy(approver);
        prescription.setVerifiedAt(LocalDateTime.now());

        Prescription saved = prescriptionRepository.save(prescription);
        auditLogService.log("PRESCRIPTION_APPROVED", "PRESCRIPTION", id,
                oldStatus, "APPROVED",
                "Prescription " + prescription.getPrescriptionNumber() + " approved by " + approver.getUsername(), approver);
        return saved;
    }

    @Transactional
    public Prescription reject(Long id, String reason, User rejector) {
        Prescription prescription = getById(id);
        if (prescription.getStatus() == Prescription.PrescriptionStatus.DISPENSED) {
            throw new BadRequestException("Cannot reject a dispensed prescription");
        }

        String oldStatus = prescription.getStatus().name();
        prescription.setStatus(Prescription.PrescriptionStatus.REJECTED);
        prescription.setRejectionReason(reason);
        prescription.setVerifiedBy(rejector);
        prescription.setVerifiedAt(LocalDateTime.now());

        Prescription saved = prescriptionRepository.save(prescription);
        auditLogService.log("PRESCRIPTION_REJECTED", "PRESCRIPTION", id,
                oldStatus, "REJECTED",
                "Prescription " + prescription.getPrescriptionNumber() + " rejected. Reason: " + reason, rejector);
        return saved;
    }

    @Transactional
    public Map<String, Object> dispense(Long id, User dispenser) {
        Prescription prescription = getById(id);
        if (prescription.getStatus() != Prescription.PrescriptionStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED prescriptions can be dispensed");
        }

        // Build a Sale from this prescription
        Sale sale = new Sale();
        sale.setCreatedBy(dispenser);
        sale.setSaleDate(LocalDate.now());
        sale.setStatus(Sale.SaleStatus.COMPLETED);
        sale.setCustomerName(prescription.getPatient().getFullName());
        sale.setCustomerPhone(prescription.getPatient().getPhone());
        sale.setNotes("Prescription " + prescription.getPrescriptionNumber());
        sale.setSaleNumber("SALE-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-" + String.format("%04d", (int)(Math.random() * 9000) + 1000));
        sale.setPaymentMethod(Sale.PaymentMethod.CASH);

        BigDecimal total = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();
        for (PrescriptionItem pItem : prescription.getItems()) {
            Medicine medicine = pItem.getMedicine();
            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .medicine(medicine)
                    .quantity(pItem.getQuantity())
                    .unitPrice(medicine.getMrp())
                    .totalPrice(medicine.getMrp().multiply(BigDecimal.valueOf(pItem.getQuantity())))
                    .build();
            saleItems.add(saleItem);
            total = total.add(saleItem.getTotalPrice());
        }
        sale.setItems(saleItems);
        sale.setTotalAmount(total);
        sale.setDiscount(BigDecimal.ZERO);
        BigDecimal tax = total.multiply(new BigDecimal("0.05"));
        sale.setTaxAmount(tax);
        sale.setNetAmount(total.add(tax));

        Sale savedSale = saleRepository.save(sale);

        // Decrease stock for each medicine
        for (SaleItem item : savedSale.getItems()) {
            inventoryService.decreaseStock(item.getMedicine(), item.getQuantity(), savedSale.getId(), dispenser);
        }

        // Update prescription status
        prescription.setStatus(Prescription.PrescriptionStatus.DISPENSED);
        prescription.setSaleId(savedSale.getId());
        prescriptionRepository.save(prescription);

        auditLogService.log("PRESCRIPTION_DISPENSED", "PRESCRIPTION", id,
                "APPROVED", "DISPENSED",
                "Prescription " + prescription.getPrescriptionNumber() + " dispensed. Sale: " + savedSale.getSaleNumber(), dispenser);

        Map<String, Object> result = new HashMap<>();
        result.put("prescription", prescription);
        result.put("saleId", savedSale.getId());
        result.put("saleNumber", savedSale.getSaleNumber());
        result.put("netAmount", savedSale.getNetAmount());
        return result;
    }

    public List<Map<String, Object>> checkAvailability(Long id) {
        Prescription prescription = getById(id);
        List<Map<String, Object>> availability = new ArrayList<>();
        for (PrescriptionItem item : prescription.getItems()) {
            Map<String, Object> check = new HashMap<>();
            check.put("medicineName", item.getMedicine().getName());
            check.put("medicineId",   item.getMedicine().getId());
            check.put("requested",    item.getQuantity());

            Optional<Inventory> inv = inventoryRepository.findByMedicineId(item.getMedicine().getId());
            int available = inv.map(Inventory::getQuantity).orElse(0);
            check.put("available",  available);
            check.put("sufficient", available >= item.getQuantity());
            check.put("shortage",   Math.max(0, item.getQuantity() - available));
            availability.add(check);
        }
        return availability;
    }

    private String generatePrescriptionNumber() {
        int year = Year.now().getValue();
        long count = prescriptionRepository.count() + 1;
        return String.format("RX-%d-%04d", year, count);
    }
}
