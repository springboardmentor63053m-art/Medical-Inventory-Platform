package com.medistock.service;

import com.medistock.dto.NotificationDTO;
import com.medistock.dto.PageResponse;
import com.medistock.enums.NotificationSeverity;
import com.medistock.enums.NotificationType;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    NotificationDTO createNotification(String title, String message, NotificationType type);
    NotificationDTO createNotification(String title, String message, NotificationType type, NotificationSeverity severity, Long relatedMedicineId);
    PageResponse<NotificationDTO> getAllNotifications(Pageable pageable);
    PageResponse<NotificationDTO> getUnreadNotifications(Pageable pageable);
    NotificationDTO markAsRead(Long id);
    void markAllAsRead();
    void deleteNotification(Long id);
    long getUnreadCount();
}

