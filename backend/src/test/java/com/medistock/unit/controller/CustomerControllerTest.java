package com.medistock.unit.controller;

import com.medistock.customer.controller.CustomerController;
import com.medistock.customer.dto.CustomerDTO;
import com.medistock.customer.service.CustomerService;
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

import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class CustomerControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private CustomerController customerController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(customerController).build();
    }

    @Test
    @DisplayName("PUT /api/customers/{id}/status replaces customer status sub-resource")
    void testPutCustomerStatus() throws Exception {
        CustomerDTO dto = CustomerDTO.builder()
                .id(1L)
                .name("John Doe")
                .status("INACTIVE")
                .build();
        when(customerService.updateCustomerStatus(1L, "INACTIVE")).thenReturn(dto);

        mockMvc.perform(put("/api/customers/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"INACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        verify(customerService).updateCustomerStatus(1L, "INACTIVE");
    }

    @Test
    @DisplayName("PATCH /api/customers/{id} performs partial modification across customer fields")
    void testPatchCustomer() throws Exception {
        CustomerDTO dto = CustomerDTO.builder()
                .id(1L)
                .name("Jane Updated")
                .phone("9876543210")
                .email("jane@example.com")
                .address("New Address 123")
                .status("ACTIVE")
                .build();
        when(customerService.patchCustomer(eq(1L), anyMap())).thenReturn(dto);

        mockMvc.perform(patch("/api/customers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Jane Updated\",\"email\":\"jane@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Jane Updated"))
                .andExpect(jsonPath("$.email").value("jane@example.com"));

        verify(customerService).patchCustomer(eq(1L), argThat(map ->
                "Jane Updated".equals(map.get("name")) && "jane@example.com".equals(map.get("email"))
        ));
    }
}
