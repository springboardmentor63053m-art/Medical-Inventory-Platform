package com.medistock.service;

import com.medistock.model.SystemSettings;
import com.medistock.repository.SystemSettingsRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {

    private static final Long SETTINGS_ID = 1L;

    private final SystemSettingsRepository repository;

    @Transactional
    public SystemSettings get() {
        return repository.findById(SETTINGS_ID)
                .orElseGet(() -> repository.save(SystemSettings.builder().id(SETTINGS_ID).build()));
    }

    @Transactional
    public SystemSettings update(Integer nearExpiryWindowDays, Integer deadStockWindowDays) {
        SystemSettings settings = get();
        if (nearExpiryWindowDays != null) {
            if (nearExpiryWindowDays < 1) {
                throw new IllegalArgumentException("Near-expiry window must be at least 1 day.");
            }
            settings.setNearExpiryWindowDays(nearExpiryWindowDays);
        }
        if (deadStockWindowDays != null) {
            if (deadStockWindowDays < 1) {
                throw new IllegalArgumentException("Dead-stock window must be at least 1 day.");
            }
            settings.setDeadStockWindowDays(deadStockWindowDays);
        }
        return repository.save(settings);
    }
}
