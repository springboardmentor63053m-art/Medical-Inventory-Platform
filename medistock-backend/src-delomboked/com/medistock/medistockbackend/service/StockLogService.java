package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.StockLog;
import java.util.List;

public interface StockLogService {
    List<StockLog> findAll();
    StockLog findById(Long id);
    StockLog save(StockLog entity);
    void deleteById(Long id);
}
