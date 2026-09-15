package com.medicalinventory.controller;

import com.medicalinventory.entity.Medicine;
import com.medicalinventory.service.MedicineService;
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
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class MedicineControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MedicineService medicineService;

    @InjectMocks
    private MedicineController medicineController;

    private Medicine testMedicine;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(medicineController).build();

        testMedicine = Medicine.builder()
                .id(1L)
                .name("Amoxicillin 500mg")
                .genericName("Amoxicillin Trihydrate")
                .unitPrice(new BigDecimal("12.50"))
                .mrp(new BigDecimal("15.00"))
                .status(Medicine.MedicineStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("GET /api/medicines should return list of medicines")
    void testGetAllMedicines() throws Exception {
        when(medicineService.getAllMedicines()).thenReturn(List.of(testMedicine));

        mockMvc.perform(get("/medicines")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Amoxicillin 500mg"))
                .andExpect(jsonPath("$[0].genericName").value("Amoxicillin Trihydrate"));
    }

    @Test
    @DisplayName("GET /api/medicines/{id} should return single medicine by ID")
    void testGetMedicineById() throws Exception {
        when(medicineService.getMedicineById(1L)).thenReturn(testMedicine);

        mockMvc.perform(get("/medicines/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Amoxicillin 500mg"));
    }

    @Test
    @DisplayName("GET /api/medicines with search parameter should filter medicines")
    void testSearchMedicines() throws Exception {
        when(medicineService.searchMedicines("Amox")).thenReturn(List.of(testMedicine));

        mockMvc.perform(get("/medicines")
                        .param("search", "Amox")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Amoxicillin 500mg"));
    }
}
