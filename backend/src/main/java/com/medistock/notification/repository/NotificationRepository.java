package com.medistock.notification.repository;

import com.medistock.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Notification> findByIsActiveTrueAndIsReadFalse();

    Optional<Notification> findByInventoryIdAndTypeAndIsActiveTrue(Long inventoryId, String type);

    List<Notification> findByInventoryIdAndIsActiveTrue(Long inventoryId);

    long countByIsActiveTrueAndIsReadFalse();

    long countByIsActiveTrue();
}
