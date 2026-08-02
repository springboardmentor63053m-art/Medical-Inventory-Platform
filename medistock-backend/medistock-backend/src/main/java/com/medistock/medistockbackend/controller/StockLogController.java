package com.medistock.medistockbackend.controller;

import com.medistock.medistockbackend.entity.StockLog;
import com.medistock.medistockbackend.service.StockLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stocklogs")
@RequiredArgsConstructor
public class StockLogController {

    private final StockLogService service;

    @GetMapping
    public ResponseEntity<List<StockLog>> getAll() { return ResponseEntity.ok(service.findAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<StockLog> getById(@PathVariable Long id) { return ResponseEntity.ok(service.findById(id)); }

    @PostMapping
    public ResponseEntity<StockLog> create(@RequestBody StockLog entity) { return ResponseEntity.ok(service.save(entity)); }

    @PutMapping("/{id}")
    public ResponseEntity<StockLog> update(@PathVariable Long id, @RequestBody StockLog entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.deleteById(id); return ResponseEntity.ok().build(); }
}
