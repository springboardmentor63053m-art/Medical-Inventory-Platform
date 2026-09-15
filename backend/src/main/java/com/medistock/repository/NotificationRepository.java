package com.medistock.repository;

import com.medistock.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTargetRoleInOrderByCreatedAtDesc(List<String> roles);

    /** Ids only, for computing per-user unread counts against NotificationRead without loading full entities. */
    @Query("SELECT n.id FROM Notification n WHERE n.targetRole IN :roles")
    List<Long> findIdsByTargetRoleIn(@Param("roles") List<String> roles);

    long countByTargetRoleInAndReadFalse(List<String> roles);
}
