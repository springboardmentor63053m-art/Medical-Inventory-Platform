package com.medistock.prescription.service;

import com.medistock.prescription.dto.request.CreatePrescriptionOrderRequest;
import com.medistock.prescription.dto.request.CreateStorePurchaseRequest;
import com.medistock.prescription.dto.request.VerifyPrescriptionRequest;
import com.medistock.prescription.dto.response.PrescriptionDocument;
import com.medistock.prescription.dto.response.PrescriptionOrderResponse;
import com.medistock.prescription.dto.response.StorePurchaseResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PrescriptionService {
    PrescriptionOrderResponse createPrescriptionOrder(Long userId, CreatePrescriptionOrderRequest request);
    PrescriptionOrderResponse createPrescriptionOrder(Long userId, CreatePrescriptionOrderRequest request, MultipartFile prescriptionFile);
    PrescriptionOrderResponse createPrescriptionOrderForEmail(String userEmail, CreatePrescriptionOrderRequest request, MultipartFile prescriptionFile);
    List<PrescriptionOrderResponse> getUserOrders(Long userId);
    List<PrescriptionOrderResponse> getUserOrdersByEmail(String userEmail);
    List<PrescriptionOrderResponse> getAllOrders(String statusFilter);
    PrescriptionOrderResponse getOrderById(Long orderId);
    PrescriptionOrderResponse getOrderByIdForUser(Long orderId, String userEmail, boolean isStaff);
    PrescriptionDocument getPrescriptionDocument(Long orderId, String userEmail, boolean isStaff);
    PrescriptionOrderResponse verifyPrescriptionOrder(Long orderId, String pharmacistEmail, VerifyPrescriptionRequest request);

    StorePurchaseResponse createStorePurchase(String pharmacistEmail, CreateStorePurchaseRequest request);
    List<StorePurchaseResponse> getAllStorePurchases();
}
