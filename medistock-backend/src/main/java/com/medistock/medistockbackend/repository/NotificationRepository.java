package com.medistock.medistockbackend.repository;

import com.medistock.medistockbackend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByTimestampDesc(Long userId);
    List<Notification> findByUserRoleNameOrderByTimestampDesc(String roleName);
}
