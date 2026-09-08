package com.medistock.unit;

import com.medistock.prescription.dto.request.PrescriptionOrderItemRequest;
import com.medistock.prescription.dto.request.StorePurchaseItemRequest;
import com.medistock.prescription.dto.response.PrescriptionOrderItemResponse;
import com.medistock.prescription.dto.response.StorePurchaseItemResponse;
import com.medistock.purchase.dto.request.PurchaseOrderItemRequest;
import com.medistock.purchase.dto.request.PurchaseOrderReceiptItemRequest;
import com.medistock.purchase.dto.response.PurchaseOrderItemResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

public class DtoSchemaNamingTest {

    @Test
    @DisplayName("Verify PrescriptionOrderItemRequest structure and contract")
    void testPrescriptionOrderItemRequest() {
        PrescriptionOrderItemRequest req = PrescriptionOrderItemRequest.builder()
                .medicineId(1L)
                .quantity(3)
                .build();
        assertEquals(1L, req.getMedicineId());
        assertEquals(3, req.getQuantity());
    }

    @Test
    @DisplayName("Verify StorePurchaseItemRequest structure and contract")
    void testStorePurchaseItemRequest() {
        StorePurchaseItemRequest req = StorePurchaseItemRequest.builder()
                .medicineId(2L)
                .quantity(5)
                .build();
        assertEquals(2L, req.getMedicineId());
        assertEquals(5, req.getQuantity());
    }

    @Test
    @DisplayName("Verify canonical PurchaseOrderItemRequest retained with correct fields")
    void testPurchaseOrderItemRequest() {
        PurchaseOrderItemRequest req = new PurchaseOrderItemRequest();
        req.setMedicineId(3L);
        req.setQuantity(100);
        req.setUnitPrice(new BigDecimal("12.50"));

        assertEquals(3L, req.getMedicineId());
        assertEquals(100, req.getQuantity());
        assertEquals(new BigDecimal("12.50"), req.getUnitPrice());
    }

    @Test
    @DisplayName("Verify PurchaseOrderReceiptItemRequest structure and contract")
    void testPurchaseOrderReceiptItemRequest() {
        PurchaseOrderReceiptItemRequest req = new PurchaseOrderReceiptItemRequest();
        req.setPurchaseOrderItemId(10L);
        req.setBatchNumber("BATCH-2026-X");
        req.setExpiryDate(LocalDate.now().plusMonths(6));
        req.setStorageLocation("Rack B2");
        req.setMinimumStock(10);

        assertEquals(10L, req.getPurchaseOrderItemId());
        assertEquals("BATCH-2026-X", req.getBatchNumber());
    }

    @Test
    @DisplayName("Verify PrescriptionOrderItemResponse, StorePurchaseItemResponse, and PurchaseOrderItemResponse")
    void testResponseDtos() {
        PrescriptionOrderItemResponse rxRes = PrescriptionOrderItemResponse.builder()
                .id(1L)
                .medicineId(2L)
                .medicineName("Amoxicillin")
                .quantity(2)
                .unitPrice(new BigDecimal("5.00"))
                .subtotal(new BigDecimal("10.00"))
                .build();
        assertNotNull(rxRes);

        StorePurchaseItemResponse storeRes = StorePurchaseItemResponse.builder()
                .id(1L)
                .medicineId(2L)
                .medicineName("Paracetamol")
                .quantity(1)
                .unitPrice(new BigDecimal("2.50"))
                .subtotal(new BigDecimal("2.50"))
                .build();
        assertNotNull(storeRes);

        PurchaseOrderItemResponse poRes = PurchaseOrderItemResponse.builder()
                .id(1L)
                .medicineId(3L)
                .medicineName("Ibuprofen")
                .quantity(50)
                .receivedQuantity(50)
                .build();
        assertNotNull(poRes);
    }

    @Test
    @DisplayName("Ambiguous generic OrderItemRequest is removed from classpath")
    void testGenericOrderItemRequestRemoved() {
        assertThrows(ClassNotFoundException.class, () -> {
            Class.forName("com.medistock.prescription.dto.request.OrderItemRequest");
        });
    }
}
