package com.medistock.repository;

import com.medistock.model.NotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface NotificationReadRepository extends JpaRepository<NotificationRead, Long> {

    /** All notification ids this user has read, restricted to the given candidate set — used to compute per-user read/unread flags in one query. */
    @Query("SELECT nr.notification.id FROM NotificationRead nr WHERE nr.user.id = :userId AND nr.notification.id IN :notificationIds")
    Set<Long> findReadNotificationIds(@Param("notificationIds") Collection<Long> notificationIds, @Param("userId") Long userId);

    boolean existsByNotification_IdAndUser_Id(Long notificationId, Long userId);

    long countByUser_IdAndNotification_IdIn(Long userId, List<Long> notificationIds);
}
