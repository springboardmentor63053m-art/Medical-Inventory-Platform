package com.medistock.notification.service;

import com.medistock.notification.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getActiveNotifications();

    List<NotificationResponse> getUnreadNotifications();

    long getUnreadCount();

    void syncInventoryNotifications();

    void syncNotificationForInventory(Long inventoryId);

    NotificationResponse markAsRead(Long notificationId);

    void markAllAsRead();

    void dismissNotification(Long notificationId);
}