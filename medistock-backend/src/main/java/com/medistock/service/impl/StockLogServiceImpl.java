package com.medistock.service.impl;

import com.medistock.dto.PageResponse;
import com.medistock.dto.StockLogDTO;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockLog;
import com.medistock.enums.ActionType;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import com.medistock.service.StockLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockLogServiceImpl implements StockLogService {

    private final StockLogRepository stockLogRepository;
    private final MedicineRepository medicineRepository;

    public StockLogServiceImpl(StockLogRepository stockLogRepository, MedicineRepository medicineRepository) {
        this.stockLogRepository = stockLogRepository;
        this.medicineRepository = medicineRepository;
    }

    @Override
    @Transactional
    public StockLogDTO createStockLog(StockLogDTO dto) {
        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", dto.getMedicineId()));

        StockLog log = StockLog.builder()
                .medicine(medicine)
                .actionType(dto.getActionType())
                .quantity(dto.getQuantity())
                .previousQuantity(dto.getPreviousQuantity())
                .newQuantity(dto.getNewQuantity())
                .performedBy(dto.getPerformedBy())
                .remarks(dto.getRemarks())
                .build();

        StockLog savedLog = stockLogRepository.save(log);
        return mapToDTO(savedLog);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockLogDTO> getAllStockLogs(Pageable pageable) {
        Page<StockLog> page = stockLogRepository.findAll(pageable);
        return mapPageToResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockLogDTO> getStockLogsByMedicineId(Long medicineId, Pageable pageable) {
        Page<StockLog> page = stockLogRepository.findByMedicineId(medicineId, pageable);
        return mapPageToResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockLogDTO> getStockLogsByActionType(ActionType actionType, Pageable pageable) {
        Page<StockLog> page = stockLogRepository.findByActionType(actionType, pageable);
        return mapPageToResponse(page);
    }

    private PageResponse<StockLogDTO> mapPageToResponse(Page<StockLog> page) {
        List<StockLogDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<StockLogDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    private StockLogDTO mapToDTO(StockLog log) {
        return StockLogDTO.builder()
                .id(log.getId())
                .medicineId(log.getMedicine().getId())
                .medicineCode(log.getMedicine().getMedicineCode())
                .medicineName(log.getMedicine().getMedicineName())
                .actionType(log.getActionType())
                .quantity(log.getQuantity())
                .previousQuantity(log.getPreviousQuantity())
                .newQuantity(log.getNewQuantity())
                .performedBy(log.getPerformedBy())
                .remarks(log.getRemarks())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
