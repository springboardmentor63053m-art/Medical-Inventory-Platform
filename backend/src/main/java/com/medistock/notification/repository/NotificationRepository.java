package com.medistock.notification.repository;

import com.medistock.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Notification> findByIsActiveTrueAndIsReadFalse();

    List<Notification> findByInventoryIdAndTypeAndIsActiveTrueOrderByCreatedAtDesc(
            Long inventoryId,
            String type
    );
    List<Notification> findByInventoryIdAndIsActiveTrue(Long inventoryId);

    long countByIsActiveTrueAndIsReadFalse();

    long countByIsActiveTrue();
}
