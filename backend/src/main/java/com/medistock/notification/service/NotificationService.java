package com.medistock.notification.service;

import com.medistock.notification.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getActiveNotifications();
}