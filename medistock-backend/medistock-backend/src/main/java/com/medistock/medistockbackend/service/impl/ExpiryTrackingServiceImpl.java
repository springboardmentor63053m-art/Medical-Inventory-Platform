package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.ExpiryTracking;
import com.medistock.medistockbackend.repository.ExpiryTrackingRepository;
import com.medistock.medistockbackend.service.ExpiryTrackingService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpiryTrackingServiceImpl implements ExpiryTrackingService {

    private final ExpiryTrackingRepository repository;

    @Override
    public List<ExpiryTracking> findAll() { return repository.findAll(); }

    @Override
    public ExpiryTracking findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("ExpiryTracking not found with id: " + id));
    }

    @Override
    public ExpiryTracking save(ExpiryTracking entity) { return repository.save(entity); }

    @Override
    public void deleteById(Long id) { repository.deleteById(id); }

    @Override
    public List<ExpiryTracking> getUpcomingExpirys() {
        return repository.findByStatus("EXPIRING_SOON");
    }
}
