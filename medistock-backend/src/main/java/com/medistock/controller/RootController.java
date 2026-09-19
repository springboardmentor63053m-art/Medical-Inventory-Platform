package com.medistock.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@Tag(name = "System", description = "System health and status endpoints")
public class RootController {

    @GetMapping("/")
    @Operation(summary = "API Root Status", description = "Returns system status and API documentation link")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("application", "MediStock Backend API");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("documentation", "/swagger-ui/index.html");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/health")
    @Operation(summary = "Health Check", description = "Returns service health status")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
