package com.medistock.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
public class MediStockIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Verify generated OpenAPI /v3/api-docs specification")
    void testOpenApiSpecification() throws Exception {
        MvcResult result = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertNotNull(content);
        assertFalse(content.isBlank());

        JsonNode root = objectMapper.readTree(content);
        JsonNode paths = root.path("paths");
        assertNotNull(paths);

        // 1. Notification endpoints
        JsonNode notifRead = paths.path("/api/notifications/{id}/read");
        assertTrue(notifRead.has("patch"), "PATCH /api/notifications/{id}/read must exist in OpenAPI");
        assertFalse(notifRead.has("post"), "POST /api/notifications/{id}/read must NOT exist in OpenAPI");

        JsonNode notifReadAll = paths.path("/api/notifications/read-all");
        assertTrue(notifReadAll.has("patch"), "PATCH /api/notifications/read-all must exist in OpenAPI");
        assertFalse(notifReadAll.has("post"), "POST /api/notifications/read-all must NOT exist in OpenAPI");

        // 2. Report endpoints
        assertFalse(paths.has("/api/reports/inventory.csv"), "/api/reports/inventory.csv must NOT exist in OpenAPI");
        assertFalse(paths.has("/api/reports/expiry.csv"), "/api/reports/expiry.csv must NOT exist in OpenAPI");
        assertTrue(paths.has("/api/reports/inventory"), "/api/reports/inventory must exist in OpenAPI");
        assertTrue(paths.has("/api/reports/expiry"), "/api/reports/expiry must exist in OpenAPI");

        // 3. Supplier endpoints
        assertTrue(paths.has("/api/suppliers/{id}/medicines/{medicineId}"), "/api/suppliers/{id}/medicines/{medicineId} must exist");
        assertTrue(paths.has("/api/suppliers/{id}/medicines"), "/api/suppliers/{id}/medicines must exist");
        assertFalse(paths.has("/api/suppliers/me/medicines/{medicineId}"), "/api/suppliers/me/medicines/{medicineId} dedicated mapping must be removed");
        assertFalse(paths.has("/api/suppliers/me/medicines"), "/api/suppliers/me/medicines dedicated mapping must be removed");

        // 4. Supplier communications vs Purchase order
        assertFalse(paths.has("/api/supplier-communications/purchase-orders/{poId}/update-status"), "supplier-communications PO status must be removed");
        assertTrue(paths.has("/api/purchase-orders/{id}/status"), "/api/purchase-orders/{id}/status must exist in OpenAPI");
        assertTrue(paths.path("/api/purchase-orders/{id}/status").has("patch"), "PATCH /api/purchase-orders/{id}/status must exist");

        // 5. Customer endpoints
        assertTrue(paths.has("/api/customers/{id}/status"), "/api/customers/{id}/status must exist");
        assertTrue(paths.path("/api/customers/{id}/status").has("put"), "PUT /api/customers/{id}/status must exist");
        assertTrue(paths.has("/api/customers/{id}"), "/api/customers/{id} must exist");
        assertTrue(paths.path("/api/customers/{id}").has("patch"), "PATCH /api/customers/{id} must exist");

        // 6. DTO Schemas
        JsonNode schemas = root.path("components").path("schemas");
        assertNotNull(schemas);
        assertFalse(schemas.has("OrderItemRequest"), "Generic OrderItemRequest schema must NOT exist");
        assertTrue(schemas.has("PrescriptionOrderItemRequest"), "PrescriptionOrderItemRequest schema must exist");
        assertTrue(schemas.has("StorePurchaseItemRequest"), "StorePurchaseItemRequest schema must exist");
        assertTrue(schemas.has("PurchaseOrderItemRequest"), "PurchaseOrderItemRequest schema must exist");
        assertTrue(schemas.has("PurchaseOrderItemResponse"), "PurchaseOrderItemResponse schema must exist");
        assertTrue(schemas.has("PrescriptionOrderItemResponse"), "PrescriptionOrderItemResponse schema must exist");
        assertTrue(schemas.has("StorePurchaseItemResponse"), "StorePurchaseItemResponse schema must exist");
        assertTrue(schemas.has("PurchaseOrderReceiptItemRequest"), "PurchaseOrderReceiptItemRequest schema must exist");
    }
}
