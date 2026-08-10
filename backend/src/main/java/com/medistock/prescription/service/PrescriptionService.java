package com.medistock.prescription.service;

import com.medistock.prescription.dto.request.CreatePrescriptionOrderRequest;
import com.medistock.prescription.dto.request.CreateStorePurchaseRequest;
import com.medistock.prescription.dto.request.VerifyPrescriptionRequest;
import com.medistock.prescription.dto.response.PrescriptionOrderResponse;
import com.medistock.prescription.dto.response.StorePurchaseResponse;

import java.util.List;

public interface PrescriptionService {
    PrescriptionOrderResponse createPrescriptionOrder(Long userId, CreatePrescriptionOrderRequest request);
    List<PrescriptionOrderResponse> getUserOrders(Long userId);
    List<PrescriptionOrderResponse> getAllOrders(String statusFilter);
    PrescriptionOrderResponse getOrderById(Long orderId);
    PrescriptionOrderResponse verifyPrescriptionOrder(Long orderId, String pharmacistEmail, VerifyPrescriptionRequest request);

    StorePurchaseResponse createStorePurchase(String pharmacistEmail, CreateStorePurchaseRequest request);
    List<StorePurchaseResponse> getAllStorePurchases();
}
