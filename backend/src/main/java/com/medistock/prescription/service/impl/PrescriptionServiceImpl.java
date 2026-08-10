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
import org.springframework.web.multipart.MultipartFile;

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
        return createPrescriptionOrder(userId, request, null);
    }

    @Override
    @Transactional
    public PrescriptionOrderResponse createPrescriptionOrder(Long userId, CreatePrescriptionOrderRequest request, MultipartFile prescriptionFile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order items list cannot be empty");
        }

        // Validate customer details
        if (request.getPatientName() == null || request.getPatientName().trim().length() < 2) {
            throw new IllegalArgumentException("Patient Name must be at least 2 characters");
        }
        if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().length() < 5) {
            throw new IllegalArgumentException("Delivery Address must be at least 5 characters");
        }
        if (request.getContactPhone() == null || !request.getContactPhone().trim().matches("^[+]?[0-9\\s\\-\\(\\)]{7,20}$")) {
            throw new IllegalArgumentException("A valid Contact Phone number is required");
        }

        // Verify items and check prescription requirement policy
        List<PrescriptionOrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean hasRxItem = false;
        List<String> rxItemNames = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Item quantity must be greater than 0");
            }

            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemReq.getMedicineId()));

            Boolean rxRequired = medicine.getPrescriptionRequired() != null ? medicine.getPrescriptionRequired() : true;
            if (rxRequired) {
                hasRxItem = true;
                rxItemNames.add(medicine.getName());
            }

            long availableQuantity = Optional.ofNullable(inventoryRepository.sumQuantityByMedicineId(medicine.getId())).orElse(0L);
            if (itemReq.getQuantity() > availableQuantity) {
                throw new IllegalArgumentException("Insufficient stock for '" + medicine.getName()
                        + "'. Requested: " + itemReq.getQuantity() + ", Available: " + availableQuantity);
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

        if (prescriptionFile != null) {
            validatePrescriptionFile(prescriptionFile);
        }

        boolean hasPrescriptionDoc = (prescriptionFile != null && !prescriptionFile.isEmpty() && prescriptionFile.getSize() > 0)
                || (request.getPrescriptionFileUrl() != null && !request.getPrescriptionFileUrl().trim().isEmpty());

        if (hasRxItem) {
            if (!hasPrescriptionDoc) {
                throw new IllegalArgumentException("A valid prescription file is required for the selected prescription medicines: " + String.join(", ", rxItemNames));
            }
            if (request.getDoctorName() == null || request.getDoctorName().trim().isEmpty()) {
                throw new IllegalArgumentException("Doctor Name is required when ordering prescription medicines (" + String.join(", ", rxItemNames) + ")");
            }
        }

        // Create Prescription Record if file provided
        Prescription prescription = null;
        if ((prescriptionFile != null && !prescriptionFile.isEmpty() && prescriptionFile.getSize() > 0)
                || (request.getPrescriptionFileUrl() != null && !request.getPrescriptionFileUrl().trim().isEmpty())) {
            byte[] fileBytes = null;
            String fileName = null;
            String contentType = null;
            if (prescriptionFile != null && !prescriptionFile.isEmpty()) {
                try {
                    fileBytes = prescriptionFile.getBytes();
                } catch (java.io.IOException ex) {
                    throw new IllegalArgumentException("Unable to read prescription file");
                }
                fileName = prescriptionFile.getOriginalFilename();
                contentType = prescriptionFile.getContentType();
            }
            prescription = Prescription.builder()
                    .user(user)
                    .doctorName(request.getDoctorName())
                    .patientName(request.getPatientName())
                    .prescriptionFileUrl(request.getPrescriptionFileUrl())
                    .prescriptionFile(fileBytes)
                    .prescriptionFileName(fileName)
                    .prescriptionContentType(contentType)
                    .notes(request.getNotes())
                    .status("PENDING_REVIEW")
                    .build();

            prescription = prescriptionRepository.save(prescription);
        }

        String orderPrefix = hasRxItem ? "RX-ORD-" : "OTC-ORD-";
        String orderNum = orderPrefix + System.currentTimeMillis() % 1000000;
        String initialStatus = hasRxItem ? "PENDING_REVIEW" : "COMPLETED";

        PrescriptionOrder order = PrescriptionOrder.builder()
                .orderNumber(orderNum)
                .user(user)
                .prescription(prescription)
                .totalAmount(totalAmount)
                .status(initialStatus)
                .deliveryAddress(request.getDeliveryAddress())
                .contactPhone(request.getContactPhone())
                .build();

        for (PrescriptionOrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        PrescriptionOrder savedOrder = prescriptionOrderRepository.save(order);
        log.info("Created online {} order {} for user {}", hasRxItem ? "prescription" : "OTC", savedOrder.getOrderNumber(), user.getEmail());

        return mapToOrderResponse(savedOrder);
    }

    private void validatePrescriptionFile(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() <= 0) {
            throw new IllegalArgumentException("Prescription file cannot be empty");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Prescription file must not exceed 10 MB.");
        }
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase().trim() : "";
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase().trim() : "";

        List<String> allowedTypes = List.of(
                "application/pdf",
                "image/jpeg",
                "image/jpg",
                "image/pjpeg",
                "image/png",
                "image/x-png"
        );

        boolean isValidMime = allowedTypes.contains(contentType);
        boolean isValidExt = originalFilename.endsWith(".pdf")
                || originalFilename.endsWith(".jpg")
                || originalFilename.endsWith(".jpeg")
                || originalFilename.endsWith(".png");

        if (!isValidMime && !isValidExt) {
            throw new IllegalArgumentException("Prescription file must be a valid PDF, JPG, JPEG, or PNG document");
        }
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
            String filterUpper = statusFilter.toUpperCase();
            if ("PENDING_REVIEW".equals(filterUpper) || "PENDING_VERIFICATION".equals(filterUpper)) {
                orders = prescriptionOrderRepository.findByStatusInOrderByCreatedAtDesc(List.of("PENDING_REVIEW", "PENDING_VERIFICATION"));
            } else {
                orders = prescriptionOrderRepository.findByStatusOrderByCreatedAtDesc(filterUpper);
            }
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
        if (!"APPROVED".equals(newStatus) && !"VERIFIED".equals(newStatus) && !"REJECTED".equals(newStatus) && !"DISPATCHED".equals(newStatus) && !"COMPLETED".equals(newStatus)) {
            throw new IllegalArgumentException("Invalid verification status: " + request.getStatus());
        }

        order.setStatus(newStatus);
        order.setPharmacistNotes(request.getPharmacistNotes());
        order.setVerifiedBy(pharmacistEmail);

        if (order.getPrescription() != null) {
            order.getPrescription().setStatus(newStatus);
            prescriptionRepository.save(order.getPrescription());
        }

        // Deduct inventory when approved, verified or dispatched
        if ("APPROVED".equals(newStatus) || "VERIFIED".equals(newStatus) || "DISPATCHED".equals(newStatus)) {
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
        List<Inventory> inventories = inventoryRepository.findByMedicineIdWithLock(medicine.getId());
        long totalAvailable = inventories.stream().mapToLong(Inventory::getQuantity).sum();

        if (quantityToDeduct > totalAvailable) {
            throw new IllegalArgumentException("Insufficient inventory stock for '" + medicine.getName()
                    + "'. Requested: " + quantityToDeduct + ", Available: " + totalAvailable);
        }

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

        if (remainingToDeduct > 0) {
            throw new IllegalArgumentException("Failed to fulfill requested stock for '" + medicine.getName() + "'");
        }
    }

    private PrescriptionOrderResponse mapToOrderResponse(PrescriptionOrder order) {
        List<PrescriptionOrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> {
                    long currentStock = Optional.ofNullable(inventoryRepository.sumQuantityByMedicineId(item.getMedicine().getId())).orElse(0L);
                    return PrescriptionOrderItemResponse.builder()
                            .id(item.getId())
                            .medicineId(item.getMedicine().getId())
                            .medicineCode(item.getMedicine().getMedicineCode())
                            .medicineName(item.getMedicine().getName())
                            .genericName(item.getMedicine().getGenericName())
                            .manufacturer(item.getMedicine().getManufacturer())
                            .prescriptionRequired(item.getMedicine().getPrescriptionRequired() != null ? item.getMedicine().getPrescriptionRequired() : true)
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotal(item.getSubtotal())
                            .currentStock(currentStock)
                            .build();
                })
                .collect(Collectors.toList());

        String userFullName = order.getUser() != null ? (order.getUser().getFirstName() + " " + (order.getUser().getLastName() != null ? order.getUser().getLastName() : "")).trim() : "Guest";
        String userPhone = order.getUser() != null ? order.getUser().getPhone() : null;
        String docName = order.getPrescription() != null ? order.getPrescription().getDoctorName() : null;
        String patName = (order.getPrescription() != null && order.getPrescription().getPatientName() != null && !order.getPrescription().getPatientName().trim().isEmpty())
                ? order.getPrescription().getPatientName().trim()
                : userFullName;
        String fileUrl = null;
        Long rxId = null;
        String fileName = null;
        String contentType = null;
        Long fileSize = null;
        LocalDateTime uploadDate = null;

        if (order.getPrescription() != null) {
            rxId = order.getPrescription().getId();
            fileName = order.getPrescription().getPrescriptionFileName();
            contentType = order.getPrescription().getPrescriptionContentType();
            uploadDate = order.getPrescription().getCreatedAt();
            if (order.getPrescription().getPrescriptionFile() != null) {
                fileSize = (long) order.getPrescription().getPrescriptionFile().length;
                fileUrl = "/api/prescriptions/orders/" + order.getId() + "/document";
            } else {
                fileUrl = order.getPrescription().getPrescriptionFileUrl();
            }
        }

        return PrescriptionOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .userFullName(userFullName)
                .userPhone(userPhone)
                .doctorName(docName)
                .patientName(patName)
                .prescriptionFileUrl(fileUrl)
                .prescriptionId(rxId)
                .prescriptionFileName(fileName)
                .prescriptionContentType(contentType)
                .prescriptionFileSize(fileSize)
                .uploadDate(uploadDate != null ? uploadDate : order.getCreatedAt())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .contactPhone(order.getContactPhone())
                .pharmacistNotes(order.getPharmacistNotes())
                .verifiedBy(order.getVerifiedBy())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
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
