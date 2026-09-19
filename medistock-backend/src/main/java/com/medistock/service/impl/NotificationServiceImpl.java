package com.medistock.service.impl;

import com.medistock.dto.NotificationDTO;
import com.medistock.dto.PageResponse;
import com.medistock.entity.Notification;
import com.medistock.enums.NotificationSeverity;
import com.medistock.enums.NotificationType;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.NotificationRepository;
import com.medistock.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public NotificationDTO createNotification(String title, String message, NotificationType type) {
        return createNotification(title, message, type, NotificationSeverity.INFO, null);
    }

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public NotificationDTO createNotification(String title, String message, NotificationType type, NotificationSeverity severity, Long relatedMedicineId) {
        // Prevent duplicate UNREAD notifications for the same medicine and type
        if (relatedMedicineId != null && notificationRepository.existsByNotificationTypeAndRelatedMedicineIdAndStatus(type, relatedMedicineId, "UNREAD")) {
            return null;
        }

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .notificationType(type)
                .severity(severity != null ? severity : NotificationSeverity.INFO)
                .relatedMedicineId(relatedMedicineId)
                .status("UNREAD")
                .build();

        try {
            Notification saved = notificationRepository.save(notification);
            return mapToDTO(saved);
        } catch (Exception e) {
            return mapToDTO(notification);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationDTO> getAllNotifications(Pageable pageable) {
        Page<Notification> page = notificationRepository.findAllByOrderByCreatedAtDesc(pageable);
        return mapPageToResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationDTO> getUnreadNotifications(Pageable pageable) {
        Page<Notification> page = notificationRepository.findByStatus("UNREAD", pageable);
        return mapPageToResponse(page);
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        notification.setStatus("READ");
        notification.setReadAt(LocalDateTime.now());
        Notification updated = notificationRepository.save(notification);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllUnreadAsRead();
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification", "id", id);
        }
        notificationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByStatus("UNREAD");
    }

    private PageResponse<NotificationDTO> mapPageToResponse(Page<Notification> page) {
        List<NotificationDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<NotificationDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .notificationType(notification.getNotificationType())
                .severity(notification.getSeverity())
                .relatedMedicineId(notification.getRelatedMedicineId())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}

