package com.medistock.repository;

import com.medistock.entity.Notification;
import com.medistock.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByStatus(String status, Pageable pageable);
    Page<Notification> findByNotificationType(NotificationType type, Pageable pageable);
    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);
    boolean existsByNotificationTypeAndRelatedMedicineIdAndStatus(NotificationType type, Long relatedMedicineId, String status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Notification n SET n.status = 'READ', n.readAt = CURRENT_TIMESTAMP WHERE n.status = 'UNREAD'")
    void markAllUnreadAsRead();

}
