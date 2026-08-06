package com.medistock.service;

import com.medistock.dto.NotificationResponse;
import com.medistock.model.Notification;
import com.medistock.model.NotificationType;
import com.medistock.model.Severity;
import com.medistock.repository.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification create(NotificationType type, Severity severity, String title, String message,
                                String targetRole, Long relatedMedicineId) {
        Notification n = Notification.builder()
                .type(type)
                .severity(severity)
                .title(title)
                .message(message)
                .targetRole(targetRole)
                .relatedMedicineId(relatedMedicineId)
                .build();
        return notificationRepository.save(n);
    }

    public List<NotificationResponse> getForRole(String role) {
        List<String> targets = List.of(role, "ALL");
        return notificationRepository.findByTargetRoleInOrderByCreatedAtDesc(targets)
                .stream().map(NotificationResponse::from).toList();
    }

    public long unreadCountForRole(String role) {
        return notificationRepository.countByTargetRoleInAndReadFalse(List.of(role, "ALL"));
    }

    @Transactional
    public void markRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllReadForRole(String role) {
        List<String> targets = List.of(role, "ALL");
        notificationRepository.findByTargetRoleInOrderByCreatedAtDesc(targets)
                .forEach(n -> n.setRead(true));
    }
}
