package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.NotificationCountDto;
import com.medistock.medistock_backend.dto.NotificationDto;

import java.util.List;

public interface NotificationService {
    List<NotificationDto> getNotificationsForCurrentUser();
    NotificationCountDto getNotificationCountForCurrentUser();
}
