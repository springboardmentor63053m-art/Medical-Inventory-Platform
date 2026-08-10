package com.medistock.prescription.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.inventory.entity.Inventory;
import com.medistock.inventory.repository.InventoryRepository;
import com.medistock.medicine.entity.Medicine;
import com.medistock.medicine.repository.MedicineRepository;
import com.medistock.prescription.dto.request.*;
import com.medistock.prescription.dto.response.*;
import com.medistock.prescription.entity.*;
import com.medistock.prescription.repository.*;
import com.medistock.prescription.service.PrescriptionService;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionOrderRepository prescriptionOrderRepository;
    private final StorePurchaseRepository storePurchaseRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public PrescriptionOrderResponse createPrescriptionOrder(Long userId, CreatePrescriptionOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order items list cannot be empty");
        }

        // Verify items and check prescription requirement policy
        List<PrescriptionOrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean hasRxItem = false;
        boolean hasNonRxItemWithoutPrescription = false;

        for (OrderItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemReq.getMedicineId()));

            Boolean rxRequired = medicine.getPrescriptionRequired() != null ? medicine.getPrescriptionRequired() : true;
            if (rxRequired) {
                hasRxItem = true;
            } else {
                hasNonRxItemWithoutPrescription = true;
            }

            BigDecimal unitPrice = medicine.getUnitPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            PrescriptionOrderItem item = PrescriptionOrderItem.builder()
                    .medicine(medicine)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            orderItems.add(item);
        }

        // Policy Enforcement: If non-Rx items requested online without prescription file attached
        if (hasNonRxItemWithoutPrescription && (request.getPrescriptionFileUrl() == null || request.getPrescriptionFileUrl().trim().isEmpty())) {
            // Check if ALL items are non-prescription without prescription upload
            if (!hasRxItem) {
                throw new IllegalArgumentException(
                        "Non-prescription medicines without a valid doctor prescription require visiting the nearest physical store to purchase directly through a Pharmacist."
                );
            }
        }

        // Create Prescription Record if file provided
        Prescription prescription = null;
        if (request.getPrescriptionFileUrl() != null && !request.getPrescriptionFileUrl().trim().isEmpty()) {
            prescription = Prescription.builder()
                    .user(user)
                    .doctorName(request.getDoctorName())
                    .patientName(request.getPatientName())
                    .prescriptionFileUrl(request.getPrescriptionFileUrl())
                    .notes(request.getNotes())
                    .status("PENDING_VERIFICATION")
                    .build();

            prescription = prescriptionRepository.save(prescription);
        }

        String orderNum = "RX-ORD-" + System.currentTimeMillis() % 1000000;

        PrescriptionOrder order = PrescriptionOrder.builder()
                .orderNumber(orderNum)
                .user(user)
                .prescription(prescription)
                .totalAmount(totalAmount)
                .status("PENDING_VERIFICATION")
                .deliveryAddress(request.getDeliveryAddress())
                .contactPhone(request.getContactPhone())
                .build();

        for (PrescriptionOrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        PrescriptionOrder savedOrder = prescriptionOrderRepository.save(order);
        log.info("Created online prescription order {} for user {}", savedOrder.getOrderNumber(), user.getEmail());

        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionOrderResponse> getUserOrders(Long userId) {
        return prescriptionOrderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionOrderResponse> getAllOrders(String statusFilter) {
        List<PrescriptionOrder> orders;
        if (statusFilter != null && !statusFilter.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusFilter)) {
            orders = prescriptionOrderRepository.findByStatusOrderByCreatedAtDesc(statusFilter.toUpperCase());
        } else {
            orders = prescriptionOrderRepository.findAllByOrderByCreatedAtDesc();
        }
        return orders.stream().map(this::mapToOrderResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionOrderResponse getOrderById(Long orderId) {
        PrescriptionOrder order = prescriptionOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription order not found with id: " + orderId));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional
    public PrescriptionOrderResponse verifyPrescriptionOrder(Long orderId, String pharmacistEmail, VerifyPrescriptionRequest request) {
        PrescriptionOrder order = prescriptionOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription order not found with id: " + orderId));

        String newStatus = request.getStatus().toUpperCase();
        if (!"VERIFIED".equals(newStatus) && !"REJECTED".equals(newStatus) && !"DISPATCHED".equals(newStatus) && !"COMPLETED".equals(newStatus)) {
            throw new IllegalArgumentException("Invalid verification status: " + request.getStatus());
        }

        order.setStatus(newStatus);
        order.setPharmacistNotes(request.getPharmacistNotes());
        order.setVerifiedBy(pharmacistEmail);

        if (order.getPrescription() != null) {
            order.getPrescription().setStatus(newStatus);
            prescriptionRepository.save(order.getPrescription());
        }

        // Deduct inventory when verified or dispatched
        if ("VERIFIED".equals(newStatus) || "DISPATCHED".equals(newStatus)) {
            for (PrescriptionOrderItem item : order.getItems()) {
                deductInventoryForMedicine(item.getMedicine(), item.getQuantity());
            }
        }

        PrescriptionOrder updated = prescriptionOrderRepository.save(order);
        log.info("Pharmacist {} updated prescription order {} status to {}", pharmacistEmail, order.getOrderNumber(), newStatus);
        return mapToOrderResponse(updated);
    }

    @Override
    @Transactional
    public StorePurchaseResponse createStorePurchase(String pharmacistEmail, CreateStorePurchaseRequest request) {
        User pharmacist = userRepository.findByEmail(pharmacistEmail).orElse(null);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Store purchase items list cannot be empty");
        }

        String receiptNum = "POS-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "-" + (new Random().nextInt(900) + 100);

        List<StorePurchaseItem> purchaseItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemReq.getMedicineId()));

            BigDecimal unitPrice = medicine.getUnitPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            StorePurchaseItem item = StorePurchaseItem.builder()
                    .medicine(medicine)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            // Deduct stock in store inventory immediately
            deductInventoryForMedicine(medicine, itemReq.getQuantity());
            purchaseItems.add(item);
        }

        StorePurchase purchase = StorePurchase.builder()
                .receiptNumber(receiptNum)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .pharmacist(pharmacist)
                .totalAmount(totalAmount)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "CASH")
                .build();

        for (StorePurchaseItem item : purchaseItems) {
            item.setPurchase(purchase);
        }
        purchase.setItems(purchaseItems);

        StorePurchase savedPurchase = storePurchaseRepository.save(purchase);
        log.info("Created store walk-in purchase receipt {} by Pharmacist {}", receiptNum, pharmacistEmail);

        return mapToStorePurchaseResponse(savedPurchase);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorePurchaseResponse> getAllStorePurchases() {
        return storePurchaseRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToStorePurchaseResponse)
                .collect(Collectors.toList());
    }

    private void deductInventoryForMedicine(Medicine medicine, int quantityToDeduct) {
        List<Inventory> inventories = inventoryRepository.findByMedicineId(medicine.getId());
        int remainingToDeduct = quantityToDeduct;

        for (Inventory inv : inventories) {
            if (remainingToDeduct <= 0) break;
            if (inv.getQuantity() > 0) {
                int deductAmount = Math.min(inv.getQuantity(), remainingToDeduct);
                inv.setQuantity(inv.getQuantity() - deductAmount);
                remainingToDeduct -= deductAmount;
                inventoryRepository.save(inv);
            }
        }
    }

    private PrescriptionOrderResponse mapToOrderResponse(PrescriptionOrder order) {
        List<PrescriptionOrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> PrescriptionOrderItemResponse.builder()
                        .id(item.getId())
                        .medicineId(item.getMedicine().getId())
                        .medicineCode(item.getMedicine().getMedicineCode())
                        .medicineName(item.getMedicine().getName())
                        .genericName(item.getMedicine().getGenericName())
                        .prescriptionRequired(item.getMedicine().getPrescriptionRequired() != null ? item.getMedicine().getPrescriptionRequired() : true)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        String docName = order.getPrescription() != null ? order.getPrescription().getDoctorName() : null;
        String patName = order.getPrescription() != null ? order.getPrescription().getPatientName() : null;
        String fileUrl = order.getPrescription() != null ? order.getPrescription().getPrescriptionFileUrl() : null;

        String userFullName = order.getUser() != null ? (order.getUser().getFirstName() + " " + (order.getUser().getLastName() != null ? order.getUser().getLastName() : "")).trim() : "Guest";

        return PrescriptionOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .userFullName(userFullName)
                .doctorName(docName)
                .patientName(patName)
                .prescriptionFileUrl(fileUrl)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .contactPhone(order.getContactPhone())
                .pharmacistNotes(order.getPharmacistNotes())
                .verifiedBy(order.getVerifiedBy())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }

    private StorePurchaseResponse mapToStorePurchaseResponse(StorePurchase purchase) {
        List<StorePurchaseItemResponse> itemResponses = purchase.getItems().stream()
                .map(item -> StorePurchaseItemResponse.builder()
                        .id(item.getId())
                        .medicineId(item.getMedicine().getId())
                        .medicineCode(item.getMedicine().getMedicineCode())
                        .medicineName(item.getMedicine().getName())
                        .genericName(item.getMedicine().getGenericName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        String pharmacistName = purchase.getPharmacist() != null ? purchase.getPharmacist().getFirstName() + " " + purchase.getPharmacist().getLastName() : "Store Pharmacist";

        return StorePurchaseResponse.builder()
                .id(purchase.getId())
                .receiptNumber(purchase.getReceiptNumber())
                .customerName(purchase.getCustomerName())
                .customerPhone(purchase.getCustomerPhone())
                .pharmacistName(pharmacistName)
                .totalAmount(purchase.getTotalAmount())
                .paymentMethod(purchase.getPaymentMethod())
                .createdAt(purchase.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
