package com.medistock.repository;

import com.medistock.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTargetRoleInOrderByCreatedAtDesc(List<String> roles);

    long countByTargetRoleInAndReadFalse(List<String> roles);
}
