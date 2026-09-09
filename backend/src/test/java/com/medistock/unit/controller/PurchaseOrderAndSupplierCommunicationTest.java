package com.medistock.unit.controller;

import com.medistock.purchase.controller.PurchaseOrderController;
import com.medistock.purchase.dto.response.PurchaseOrderResponse;
import com.medistock.purchase.entity.PurchaseOrderStatus;
import com.medistock.purchase.service.PurchaseOrderService;
import com.medistock.supplier.controller.SupplierCommunicationController;
import com.medistock.supplier.service.SupplierCommunicationService;
import com.medistock.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class PurchaseOrderAndSupplierCommunicationTest {

    private MockMvc purchaseOrderMockMvc;
    private MockMvc supplierCommMockMvc;

    @Mock
    private PurchaseOrderService purchaseOrderService;

    @Mock
    private SupplierCommunicationService communicationService;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        purchaseOrderMockMvc = MockMvcBuilders.standaloneSetup(new PurchaseOrderController(purchaseOrderService)).build();
        supplierCommMockMvc = MockMvcBuilders.standaloneSetup(new SupplierCommunicationController(communicationService, userRepository)).build();
    }

    @Test
    @DisplayName("PATCH /api/purchase-orders/{id}/status succeeds with status and optional note")
    void testCanonicalPOStatusUpdate() throws Exception {
        PurchaseOrderResponse response = PurchaseOrderResponse.builder()
                .id(100L)
                .status("CONFIRMED")
                .orderNumber("PO-2026-001")
                .build();
        when(purchaseOrderService.updatePurchaseOrderStatus(100L, "CONFIRMED", "Confirmed via vendor portal"))
                .thenReturn(response);

        purchaseOrderMockMvc.perform(patch("/api/purchase-orders/100/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\",\"note\":\"Confirmed via vendor portal\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        verify(purchaseOrderService).updatePurchaseOrderStatus(100L, "CONFIRMED", "Confirmed via vendor portal");
    }

    @Test
    @DisplayName("POST /api/supplier-communications/purchase-orders/{poId}/update-status is removed and returns 404")
    void testSupplierCommPOStatusUpdateRemoved() throws Exception {
        supplierCommMockMvc.perform(post("/api/supplier-communications/purchase-orders/100/update-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isNotFound());
    }
}
