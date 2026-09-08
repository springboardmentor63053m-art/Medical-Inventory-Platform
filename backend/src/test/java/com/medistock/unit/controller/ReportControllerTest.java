package com.medistock.unit.controller;

import com.medistock.reports.controller.ReportController;
import com.medistock.reports.dto.response.ExpirySummaryResponse;
import com.medistock.reports.dto.response.InventoryValuationSummaryResponse;
import com.medistock.reports.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ReportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reportController).build();
    }

    @Test
    @DisplayName("GET /api/reports/inventory defaults to JSON format")
    void testInventoryReportDefaultsToJson() throws Exception {
        InventoryValuationSummaryResponse response = InventoryValuationSummaryResponse.builder()
                .totalStockValue(new BigDecimal("15000.00"))
                .totalUnits(500L)
                .totalRecords(25)
                .categoryValuations(Collections.emptyList())
                .build();
        when(reportService.getInventoryValuationSummary()).thenReturn(response);

        mockMvc.perform(get("/api/reports/inventory"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalStockValue").value(15000.00))
                .andExpect(jsonPath("$.totalUnits").value(500));

        verify(reportService).getInventoryValuationSummary();
        verify(reportService, never()).generateInventoryCsv();
    }

    @Test
    @DisplayName("GET /api/reports/inventory?format=csv returns CSV file download")
    void testInventoryReportCsvFormat() throws Exception {
        byte[] csvData = "Inventory ID,Medicine Code,Medicine Name\n1,MED-1,Paracetamol".getBytes(StandardCharsets.UTF_8);
        when(reportService.generateInventoryCsv()).thenReturn(csvData);

        mockMvc.perform(get("/api/reports/inventory").param("format", "csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment; filename=\"medistock-inventory-")))
                .andExpect(content().contentType("text/csv;charset=UTF-8"))
                .andExpect(content().bytes(csvData));

        verify(reportService).generateInventoryCsv();
        verify(reportService, never()).getInventoryValuationSummary();
    }

    @Test
    @DisplayName("GET /api/reports/inventory with Accept: text/csv returns CSV")
    void testInventoryReportAcceptHeaderCsv() throws Exception {
        byte[] csvData = "Inventory ID,Medicine Code,Medicine Name\n1,MED-1,Paracetamol".getBytes(StandardCharsets.UTF_8);
        when(reportService.generateInventoryCsv()).thenReturn(csvData);

        mockMvc.perform(get("/api/reports/inventory").header("Accept", "text/csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv;charset=UTF-8"))
                .andExpect(content().bytes(csvData));

        verify(reportService).generateInventoryCsv();
    }

    @Test
    @DisplayName("GET /api/reports/expiry defaults to JSON format")
    void testExpiryReportDefaultsToJson() throws Exception {
        ExpirySummaryResponse response = ExpirySummaryResponse.builder()
                .reportDays(30)
                .totalInventoryRecords(100)
                .expiredCount(2)
                .criticalCount(5)
                .build();
        when(reportService.getExpirySummary(anyInt())).thenReturn(response);

        mockMvc.perform(get("/api/reports/expiry").param("days", "30"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.reportDays").value(30))
                .andExpect(jsonPath("$.expiredCount").value(2));

        verify(reportService).getExpirySummary(30);
        verify(reportService, never()).generateExpiryCsv(anyInt());
    }

    @Test
    @DisplayName("GET /api/reports/expiry?format=csv returns CSV file download")
    void testExpiryReportCsvFormat() throws Exception {
        byte[] csvData = "Inventory ID,Batch Number,Expiry Date\n1,BATCH01,2026-10-01".getBytes(StandardCharsets.UTF_8);
        when(reportService.generateExpiryCsv(45)).thenReturn(csvData);

        mockMvc.perform(get("/api/reports/expiry").param("days", "45").param("format", "csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment; filename=\"medistock-expiry-45-days-")))
                .andExpect(content().contentType("text/csv;charset=UTF-8"))
                .andExpect(content().bytes(csvData));

        verify(reportService).generateExpiryCsv(45);
        verify(reportService, never()).getExpirySummary(anyInt());
    }

    @Test
    @DisplayName("GET /api/reports/inventory.csv is removed and returns 404")
    void testInventoryCsvOldRouteRemoved() throws Exception {
        mockMvc.perform(get("/api/reports/inventory.csv"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/reports/expiry.csv is removed and returns 404")
    void testExpiryCsvOldRouteRemoved() throws Exception {
        mockMvc.perform(get("/api/reports/expiry.csv"))
                .andExpect(status().isNotFound());
    }
}
