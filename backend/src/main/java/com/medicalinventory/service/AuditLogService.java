package com.medicalinventory.service;

import com.medicalinventory.entity.AuditLog;
import com.medicalinventory.entity.User;
import com.medicalinventory.exception.ResourceNotFoundException;
import com.medicalinventory.repository.AuditLogRepository;
import com.medicalinventory.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository      userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository      = userRepository;
    }

    public void log(String action, String entityType, Long entityId,
                    String oldValue, String newValue, String description, User performedBy) {
        AuditLog entry = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .description(description)
                .performedBy(performedBy)
                .build();
        auditLogRepository.save(entry);
    }

    @Transactional
    public AuditLog create(AuditLog log) {
        if (log.getPerformedBy() != null && log.getPerformedBy().getId() != null) {
            User user = userRepository.findById(log.getPerformedBy().getId()).orElse(null);
            log.setPerformedBy(user);
        }
        return auditLogRepository.save(log);
    }

    public List<AuditLog> getAll() {
        return auditLogRepository.findAll();
    }

    public List<AuditLog> getByUser(Long userId) {
        return auditLogRepository.findByPerformedByIdOrderByCreatedAtDesc(userId);
    }

    public List<AuditLog> getByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    @Transactional
    public void delete(Long id) {
        AuditLog log = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log entry not found: " + id));
        auditLogRepository.delete(log);
    }

    @Transactional
    public void deleteAll() {
        auditLogRepository.deleteAll();
    }
}
