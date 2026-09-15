package com.medistock.repository;

import com.medistock.model.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
}
