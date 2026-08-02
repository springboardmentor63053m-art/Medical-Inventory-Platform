package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.StockLog;
import com.medistock.medistockbackend.repository.StockLogRepository;
import com.medistock.medistockbackend.service.StockLogService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockLogServiceImpl implements StockLogService {

    private final StockLogRepository repository;

    @Override
    public List<StockLog> findAll() { return repository.findAll(); }

    @Override
    public StockLog findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("StockLog not found with id: " + id));
    }

    @Override
    public StockLog save(StockLog entity) { return repository.save(entity); }

    @Override
    public void deleteById(Long id) { repository.deleteById(id); }
}
