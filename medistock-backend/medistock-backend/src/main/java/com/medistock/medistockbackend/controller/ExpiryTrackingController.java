package com.medistock.medistockbackend.controller;

import com.medistock.medistockbackend.entity.ExpiryTracking;
import com.medistock.medistockbackend.service.ExpiryTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/expirys")
@RequiredArgsConstructor
public class ExpiryTrackingController {

    private final ExpiryTrackingService service;

    @GetMapping
    public ResponseEntity<List<ExpiryTracking>> getAll() { return ResponseEntity.ok(service.findAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<ExpiryTracking> getById(@PathVariable Long id) { return ResponseEntity.ok(service.findById(id)); }

    @PostMapping
    public ResponseEntity<ExpiryTracking> create(@RequestBody ExpiryTracking entity) { return ResponseEntity.ok(service.save(entity)); }

    @PutMapping("/{id}")
    public ResponseEntity<ExpiryTracking> update(@PathVariable Long id, @RequestBody ExpiryTracking entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.deleteById(id); return ResponseEntity.ok().build(); }

    @GetMapping("/upcoming")
    public ResponseEntity<List<ExpiryTracking>> getUpcoming() {
        return ResponseEntity.ok(service.getUpcomingExpirys());
    }
}
