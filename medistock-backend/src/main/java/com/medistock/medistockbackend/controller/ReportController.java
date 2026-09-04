package com.medistock.medistockbackend.controller;

import com.medistock.medistockbackend.entity.Report;
import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService service;

    public ReportController(final ReportService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/data")
    public ResponseEntity<List<Medicine>> getReportData() {
        return ResponseEntity.ok(service.getReportData());
    }

    @PostMapping("/generate")
    public ResponseEntity<Report> generateReport(@RequestParam(defaultValue = "INVENTORY") String type) {
        return ResponseEntity.ok(service.generateReport(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Report> create(@RequestBody Report entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Report> update(@PathVariable Long id, @RequestBody Report entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
