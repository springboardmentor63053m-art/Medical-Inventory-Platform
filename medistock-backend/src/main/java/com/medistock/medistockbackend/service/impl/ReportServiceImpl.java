package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.Report;
import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.entity.Inventory;
import com.medistock.medistockbackend.repository.ReportRepository;
import com.medistock.medistockbackend.repository.MedicineRepository;
import com.medistock.medistockbackend.service.ReportService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportServiceImpl implements ReportService {
    private final ReportRepository repository;
    private final MedicineRepository medicineRepository;

    public ReportServiceImpl(ReportRepository repository, MedicineRepository medicineRepository) {
        this.repository = repository;
        this.medicineRepository = medicineRepository;
    }

    private void populateCalculatedStock(Medicine medicine) {
        if (medicine == null) return;
        int qty = 0;
        if (medicine.getInventories() != null && !medicine.getInventories().isEmpty()) {
            Map<String, Inventory> distinctBatches = new LinkedHashMap<>();
            for (Inventory inv : medicine.getInventories()) {
                if (inv != null) {
                    String batchKey = inv.getBatchNumber() != null && !inv.getBatchNumber().trim().isEmpty()
                            ? inv.getBatchNumber().trim()
                            : ("inv_" + inv.getId());
                    if (!distinctBatches.containsKey(batchKey)) {
                        distinctBatches.put(batchKey, inv);
                    }
                }
            }
            qty = distinctBatches.values().stream()
                    .mapToInt(inv -> inv.getQuantity() != null ? inv.getQuantity() : 0)
                    .sum();
        } else if (medicine.getStockQuantity() != null) {
            qty = medicine.getStockQuantity();
        }
        medicine.setStockQuantity(qty);
    }

    @Override
    public List<Report> findAll() {
        return repository.findAll();
    }

    @Override
    public Report findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));
    }

    @Override
    public Report save(Report entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Report generateReport(String type) {
        String reportType = type != null ? type.toUpperCase() : "INVENTORY";
        Report report = new Report();
        report.setType(reportType);
        report.setGeneratedDate(LocalDateTime.now());
        report.setFileUrl("report_" + reportType.toLowerCase() + "_" + System.currentTimeMillis() + ".csv");
        return repository.save(report);
    }

    @Override
    public List<Medicine> getReportData() {
        List<Medicine> list = medicineRepository.findAll();
        list.forEach(this::populateCalculatedStock);
        return list;
    }
}
