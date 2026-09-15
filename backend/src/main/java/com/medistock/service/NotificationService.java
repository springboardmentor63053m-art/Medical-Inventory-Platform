package com.medistock.service;

import com.medistock.dto.NotificationResponse;
import com.medistock.model.Notification;
import com.medistock.model.NotificationRead;
import com.medistock.model.NotificationType;
import com.medistock.model.Severity;
import com.medistock.model.User;
import com.medistock.repository.NotificationReadRepository;
import com.medistock.repository.NotificationRepository;
import com.medistock.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Notification read state is user-specific (requirement 17): the same
 * notification can be read for one user and unread for another. Read state
 * lives in NotificationRead (one row per notification+user that has read
 * it) rather than as a single shared boolean on Notification.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationReadRepository notificationReadRepository;
    private final UserRepository userRepository;

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

    public List<NotificationResponse> getForRole(String role, Long userId) {
        List<String> targets = List.of(role, "ALL");
        List<Notification> notifications = notificationRepository.findByTargetRoleInOrderByCreatedAtDesc(targets);
        Set<Long> readIds = userId == null
                ? Set.of()
                : notificationReadRepository.findReadNotificationIds(
                        notifications.stream().map(Notification::getId).toList(), userId);
        return notifications.stream()
                .map(n -> NotificationResponse.from(n, readIds.contains(n.getId())))
                .toList();
    }

    public long unreadCountForRole(String role, Long userId) {
        List<String> targets = List.of(role, "ALL");
        List<Long> ids = notificationRepository.findIdsByTargetRoleIn(targets);
        if (ids.isEmpty() || userId == null) return ids.size();
        long readCount = notificationReadRepository.countByUser_IdAndNotification_IdIn(userId, ids);
        return ids.size() - readCount;
    }

    /** Marks a single notification read for THIS user only — never affects any other user's read state for the same notification. */
    @Transactional
    public void markRead(Long id, Long userId) {
        if (userId == null) return;
        if (notificationReadRepository.existsByNotification_IdAndUser_Id(id, userId)) {
            return; // already read by this user — idempotent
        }
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        notificationReadRepository.save(NotificationRead.builder().notification(n).user(user).build());
    }

    /** Marks every notification targeted at this role (or ALL) as read for THIS user only. */
    @Transactional
    public void markAllReadForRole(String role, Long userId) {
        if (userId == null) return;
        List<String> targets = List.of(role, "ALL");
        List<Long> ids = notificationRepository.findIdsByTargetRoleIn(targets);
        if (ids.isEmpty()) return;
        Set<Long> alreadyRead = notificationReadRepository.findReadNotificationIds(ids, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        for (Long notificationId : ids) {
            if (alreadyRead.contains(notificationId)) continue;
            Notification n = notificationRepository.getReferenceById(notificationId);
            notificationReadRepository.save(NotificationRead.builder().notification(n).user(user).build());
        }
    }
}
