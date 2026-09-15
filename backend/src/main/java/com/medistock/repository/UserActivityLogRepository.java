package com.medistock.repository;

import com.medistock.model.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
    List<UserActivityLog> findAllByOrderByTimestampDesc();
}
