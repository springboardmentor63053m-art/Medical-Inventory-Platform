package com.medistock.service;

import com.medistock.dto.PageResponse;
import com.medistock.dto.StockLogDTO;
import com.medistock.enums.ActionType;
import org.springframework.data.domain.Pageable;

public interface StockLogService {
    StockLogDTO createStockLog(StockLogDTO dto);
    PageResponse<StockLogDTO> getAllStockLogs(Pageable pageable);
    PageResponse<StockLogDTO> getStockLogsByMedicineId(Long medicineId, Pageable pageable);
    PageResponse<StockLogDTO> getStockLogsByActionType(ActionType actionType, Pageable pageable);
}
