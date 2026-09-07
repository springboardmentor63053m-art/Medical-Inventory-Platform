package com.medicalinventory.controller;

import com.medicalinventory.entity.AuditLog;
import com.medicalinventory.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAll() {
        return ResponseEntity.ok(auditLogService.getAll());
    }

    @PostMapping
    public ResponseEntity<AuditLog> create(@RequestBody AuditLog log) {
        return ResponseEntity.ok(auditLogService.create(log));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(auditLogService.getByUser(userId));
    }

    @GetMapping("/entity")
    public ResponseEntity<List<AuditLog>> getByEntity(
            @RequestParam String type,
            @RequestParam Long id) {
        return ResponseEntity.ok(auditLogService.getByEntity(type, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        auditLogService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Audit log record deleted successfully", "id", String.valueOf(id)));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearAll() {
        auditLogService.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All audit log records purged successfully"));
    }
}
