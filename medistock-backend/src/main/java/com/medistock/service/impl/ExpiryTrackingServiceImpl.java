package com.medistock.service.impl;

import com.medistock.dto.ExpiryTrackingDTO;
import com.medistock.dto.ExpiryTrackingSummaryDTO;
import com.medistock.dto.PageResponse;
import com.medistock.entity.ExpiryTracking;
import com.medistock.entity.Medicine;
import com.medistock.enums.ExpiryStatus;
import com.medistock.enums.NotificationSeverity;
import com.medistock.enums.NotificationType;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.ExpiryTrackingRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.service.ExpiryTrackingService;
import com.medistock.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpiryTrackingServiceImpl implements ExpiryTrackingService {

    private final ExpiryTrackingRepository expiryTrackingRepository;
    private final MedicineRepository medicineRepository;
    private final NotificationService notificationService;

    @Value("${medistock.expiry.threshold-days:30}")
    private int thresholdDays = 30;

    public ExpiryTrackingServiceImpl(ExpiryTrackingRepository expiryTrackingRepository, MedicineRepository medicineRepository, NotificationService notificationService) {
        this.expiryTrackingRepository = expiryTrackingRepository;
        this.medicineRepository = medicineRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public ExpiryTrackingDTO addExpiryRecord(ExpiryTrackingDTO dto) {
        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", dto.getMedicineId()));

        ExpiryStatus computedStatus = calculateStatus(dto.getExpiryDate());

        ExpiryTracking tracking = ExpiryTracking.builder()
                .medicine(medicine)
                .expiryDate(dto.getExpiryDate())
                .batchNumber(dto.getBatchNumber() != null ? dto.getBatchNumber() : medicine.getBatchNumber())
                .quantity(dto.getQuantity() != null ? dto.getQuantity() : 0)
                .status(computedStatus)
                .build();

        ExpiryTracking saved = expiryTrackingRepository.save(tracking);

        if (computedStatus == ExpiryStatus.EXPIRING_SOON || computedStatus == ExpiryStatus.EXPIRED) {
            NotificationSeverity severity = computedStatus == ExpiryStatus.EXPIRED ? NotificationSeverity.CRITICAL : NotificationSeverity.WARNING;
            NotificationType type = computedStatus == ExpiryStatus.EXPIRED ? NotificationType.EXPIRED_MEDICINE : NotificationType.EXPIRING_SOON;

            notificationService.createNotification(
                    "Expiry Alert: " + medicine.getMedicineName(),
                    "Batch " + saved.getBatchNumber() + " for " + medicine.getMedicineName() +
                            " is " + computedStatus.name() + " (Expiry Date: " + saved.getExpiryDate() + ")",
                    type,
                    severity,
                    medicine.getId()
            );
        }

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExpiryTrackingDTO> getAllExpiryRecords(ExpiryStatus status, Pageable pageable) {
        Page<ExpiryTracking> page;
        if (status != null) {
            page = expiryTrackingRepository.findByStatus(status, pageable);
        } else {
            page = expiryTrackingRepository.findAll(pageable);
        }

        List<ExpiryTrackingDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<ExpiryTrackingDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExpiryTrackingDTO> getExpiryRecordsByMedicineId(Long medicineId, Pageable pageable) {
        Page<ExpiryTracking> page = expiryTrackingRepository.findByMedicineId(medicineId, pageable);

        List<ExpiryTrackingDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<ExpiryTrackingDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpiryTrackingDTO> getExpiryRecordsByMedicineIdList(Long medicineId) {
        return expiryTrackingRepository.findByMedicineId(medicineId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpiryTrackingDTO> getExpiringSoon() {
        return expiryTrackingRepository.findByStatus(ExpiryStatus.EXPIRING_SOON).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpiryTrackingDTO> getExpired() {
        return expiryTrackingRepository.findByStatus(ExpiryStatus.EXPIRED).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ExpiryTrackingSummaryDTO getExpirySummary() {
        long total = expiryTrackingRepository.count();
        long expiredCount = expiryTrackingRepository.countByStatus(ExpiryStatus.EXPIRED);
        long expiringSoonCount = expiryTrackingRepository.countByStatus(ExpiryStatus.EXPIRING_SOON);
        long activeCount = expiryTrackingRepository.countByStatus(ExpiryStatus.ACTIVE);

        long expiredQty = expiryTrackingRepository.sumQuantityByStatus(ExpiryStatus.EXPIRED);
        long expiringSoonQty = expiryTrackingRepository.sumQuantityByStatus(ExpiryStatus.EXPIRING_SOON);

        return ExpiryTrackingSummaryDTO.builder()
                .totalRecords(total)
                .expiredCount(expiredCount)
                .expiringSoonCount(expiringSoonCount)
                .activeCount(activeCount)
                .expiredQuantity(expiredQty)
                .expiringSoonQuantity(expiringSoonQty)
                .build();
    }

    @Override
    @Scheduled(cron = "${medistock.scheduler.expiry-cron:0 0 1 * * ?}") // Configurable cron
    @Transactional
    public void updateExpiryStatuses() {
        List<ExpiryTracking> records = expiryTrackingRepository.findAll();

        for (ExpiryTracking record : records) {
            ExpiryStatus currentStatus = record.getStatus();
            ExpiryStatus updatedStatus = calculateStatus(record.getExpiryDate());

            if (currentStatus != updatedStatus) {
                record.setStatus(updatedStatus);
                expiryTrackingRepository.save(record);

                if (updatedStatus == ExpiryStatus.EXPIRED || updatedStatus == ExpiryStatus.EXPIRING_SOON) {
                    NotificationSeverity severity = updatedStatus == ExpiryStatus.EXPIRED ? NotificationSeverity.CRITICAL : NotificationSeverity.WARNING;
                    NotificationType type = updatedStatus == ExpiryStatus.EXPIRED ? NotificationType.EXPIRED_MEDICINE : NotificationType.EXPIRING_SOON;

                    notificationService.createNotification(
                            "Scheduled Expiry Alert: " + record.getMedicine().getMedicineName(),
                            "Medicine " + record.getMedicine().getMedicineName() + " (Batch: " +
                                    record.getBatchNumber() + ") marked as " + updatedStatus.name() + ".",
                            type,
                            severity,
                            record.getMedicine().getId()
                    );
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(ExpiryStatus status) {
        return expiryTrackingRepository.countByStatus(status);
    }

    private ExpiryStatus calculateStatus(LocalDate expiryDate) {
        LocalDate today = LocalDate.now();
        if (expiryDate == null) return ExpiryStatus.ACTIVE;

        if (expiryDate.isBefore(today) || expiryDate.isEqual(today)) {
            return ExpiryStatus.EXPIRED;
        } else if (expiryDate.isBefore(today.plusDays(thresholdDays))) {
            return ExpiryStatus.EXPIRING_SOON;
        } else {
            return ExpiryStatus.ACTIVE;
        }
    }

    private ExpiryTrackingDTO mapToDTO(ExpiryTracking tracking) {
        return ExpiryTrackingDTO.builder()
                .id(tracking.getId())
                .medicineId(tracking.getMedicine().getId())
                .medicineCode(tracking.getMedicine().getMedicineCode())
                .medicineName(tracking.getMedicine().getMedicineName())
                .expiryDate(tracking.getExpiryDate())
                .batchNumber(tracking.getBatchNumber())
                .quantity(tracking.getQuantity())
                .status(tracking.getStatus())
                .createdAt(tracking.getCreatedAt())
                .build();
    }
}

