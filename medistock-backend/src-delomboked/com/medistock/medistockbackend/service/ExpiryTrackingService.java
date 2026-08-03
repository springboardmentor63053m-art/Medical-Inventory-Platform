package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.ExpiryTracking;
import java.util.List;

public interface ExpiryTrackingService {
    List<ExpiryTracking> findAll();
    ExpiryTracking findById(Long id);
    ExpiryTracking save(ExpiryTracking entity);
    void deleteById(Long id);
    List<ExpiryTracking> getUpcomingExpirys();
}
