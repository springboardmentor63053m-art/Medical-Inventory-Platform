package com.medicalinventory.controller;

import com.medicalinventory.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/forecast")
    public ResponseEntity<List<Map<String, Object>>> getDemandForecast() {
        return ResponseEntity.ok(aiService.getDemandForecast());
    }

    @GetMapping("/stock-risk")
    public ResponseEntity<List<Map<String, Object>>> getStockRisk() {
        return ResponseEntity.ok(aiService.getStockRisk());
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<Map<String, Object>>> getReorderRecommendations() {
        return ResponseEntity.ok(aiService.getReorderRecommendations());
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<Map<String, Object>>> getAnomalies() {
        return ResponseEntity.ok(aiService.getAnomalies());
    }

    @GetMapping("/assistant")
    public ResponseEntity<Map<String, Object>> askAssistant(@RequestParam(defaultValue = "") String q) {
        return ResponseEntity.ok(aiService.askAssistant(q));
    }
}
