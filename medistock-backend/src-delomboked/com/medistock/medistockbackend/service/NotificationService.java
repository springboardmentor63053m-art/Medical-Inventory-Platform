package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> findAll();
    Notification findById(Long id);
    Notification save(Notification entity);
    void deleteById(Long id);
    Notification markAsRead(Long id);
}
