package com.medistock.unit.controller;

import com.medistock.supplier.controller.SupplierController;
import com.medistock.supplier.dto.response.SupplierResponse;
import com.medistock.supplier.service.SupplierService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class SupplierControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SupplierService supplierService;

    @InjectMocks
    private SupplierController supplierController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(supplierController).build();
    }

    @Test
    @DisplayName("GET /api/suppliers/{id}/medicines with numeric ID by ADMIN returns medicine list")
    void testGetMedicinesBySupplierNumericId() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "admin@medistock.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        SupplierResponse.SuppliedMedicineDto medDto = SupplierResponse.SuppliedMedicineDto.builder()
                .id(101L)
                .name("Amoxicillin")
                .build();
        when(supplierService.getMedicinesBySupplier(5L)).thenReturn(List.of(medDto));

        mockMvc.perform(get("/api/suppliers/5/medicines").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101))
                .andExpect(jsonPath("$[0].name").value("Amoxicillin"));

        verify(supplierService).getMedicinesBySupplier(5L);
    }

    @Test
    @DisplayName("GET /api/suppliers/{id}/medicines with literal 'me' resolves to authenticated supplier")
    void testGetMedicinesBySupplierLiteralMe() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "supplier@acme.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_SUPPLIER"))
        );

        SupplierResponse supplier = SupplierResponse.builder().id(42L).email("supplier@acme.com").build();
        when(supplierService.getSupplierByEmail("supplier@acme.com")).thenReturn(supplier);
        when(supplierService.getMedicinesBySupplier(42L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/suppliers/me/medicines").principal(auth))
                .andExpect(status().isOk());

        verify(supplierService).getSupplierByEmail("supplier@acme.com");
        verify(supplierService).getMedicinesBySupplier(42L);
    }

    @Test
    @DisplayName("POST /api/suppliers/{id}/medicines/{medicineId} with literal 'me' links medicine")
    void testLinkMedicineLiteralMe() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "supplier@acme.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_SUPPLIER"))
        );

        SupplierResponse supplier = SupplierResponse.builder().id(42L).email("supplier@acme.com").build();
        when(supplierService.getSupplierByEmail("supplier@acme.com")).thenReturn(supplier);
        when(supplierService.linkMedicineToSupplier(42L, 99L)).thenReturn(supplier);

        mockMvc.perform(post("/api/suppliers/me/medicines/99").principal(auth))
                .andExpect(status().isOk());

        verify(supplierService).linkMedicineToSupplier(42L, 99L);
    }

    @Test
    @DisplayName("DELETE /api/suppliers/{id}/medicines/{medicineId} with literal 'me' unlinks medicine")
    void testUnlinkMedicineLiteralMe() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "supplier@acme.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_SUPPLIER"))
        );

        SupplierResponse supplier = SupplierResponse.builder().id(42L).email("supplier@acme.com").build();
        when(supplierService.getSupplierByEmail("supplier@acme.com")).thenReturn(supplier);
        when(supplierService.unlinkMedicineFromSupplier(42L, 99L)).thenReturn(supplier);

        mockMvc.perform(delete("/api/suppliers/me/medicines/99").principal(auth))
                .andExpect(status().isOk());

        verify(supplierService).unlinkMedicineFromSupplier(42L, 99L);
    }

    @Test
    @DisplayName("SUPPLIER attempting to modify another supplier's catalog via numeric ID is denied")
    void testSupplierForbiddenForOtherSupplierId() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "supplier@acme.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_SUPPLIER"))
        );

        SupplierResponse mySupplier = SupplierResponse.builder().id(42L).email("supplier@acme.com").build();
        when(supplierService.getSupplierByEmail("supplier@acme.com")).thenReturn(mySupplier);

        try {
            mockMvc.perform(post("/api/suppliers/999/medicines/10").principal(auth));
        } catch (Exception e) {
            // Nested AccessDeniedException expected
            org.junit.jupiter.api.Assertions.assertTrue(e.getCause() instanceof org.springframework.security.access.AccessDeniedException);
        }

        verify(supplierService, never()).linkMedicineToSupplier(eq(999L), anyLong());
    }
}
