package com.medistock.purchase.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.medicine.entity.Medicine;
import com.medistock.medicine.repository.MedicineRepository;
import com.medistock.purchase.dto.request.PurchaseOrderItemRequest;
import com.medistock.purchase.dto.request.PurchaseOrderRequest;
import com.medistock.purchase.dto.response.PurchaseOrderItemResponse;
import com.medistock.purchase.dto.response.PurchaseOrderResponse;
import com.medistock.purchase.entity.PurchaseOrder;
import com.medistock.purchase.entity.PurchaseOrderItem;
import com.medistock.purchase.repository.PurchaseOrderRepository;
import com.medistock.purchase.service.PurchaseOrderService;
import com.medistock.supplier.dto.response.SupplierResponse;
import com.medistock.supplier.entity.Supplier;
import com.medistock.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.medistock.inventory.service.InventoryService;
import com.medistock.purchase.dto.request.PurchaseOrderReceiptItemRequest;
import com.medistock.purchase.dto.request.PurchaseOrderReceiptRequest;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.function.Function;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryService inventoryService;
    private Authentication requireAuthentication() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                "anonymousUser".equals(
                        authentication.getPrincipal()
                )) {
            throw new AccessDeniedException(
                    "Authentication is required"
            );
        }

        return authentication;
    }

    private String currentActor() {
        return requireAuthentication().getName();
    }

    private boolean hasRole(String role) {
        String requiredAuthority = "ROLE_" + role;

        return requireAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(authority ->
                        requiredAuthority.equals(
                                authority.getAuthority()
                        ) ||
                        role.equals(authority.getAuthority())
                );
    }

    private Supplier resolveAuthenticatedSupplier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        boolean isSupplier = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPPLIER") || a.getAuthority().equals("SUPPLIER"));
        if (!isSupplier) {
            return null;
        }
        String email = auth.getName();
        return supplierRepository.findByEmailIgnoreCase(email).orElse(null);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        String orderNumber = "PO-2026-" + String.format("%03d", (purchaseOrderRepository.count() + 1));

        PurchaseOrder order = PurchaseOrder.builder()
                .supplier(supplier)
                .orderNumber(orderNumber)
                .orderDate(LocalDate.now())
                .expectedDelivery(request.getExpectedDelivery() != null ? request.getExpectedDelivery() : LocalDate.now().plusDays(7))
                .status("PENDING")
                .totalAmount(BigDecimal.ZERO)
                .createdBy(currentActor())
                .statusUpdatedBy(currentActor())
                .statusUpdatedAt(LocalDateTime.now())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<PurchaseOrderItem> items = new ArrayList<>();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (PurchaseOrderItemRequest itemReq : request.getItems()) {
                Medicine med = medicineRepository.findById(itemReq.getMedicineId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemReq.getMedicineId()));

                if (!supplierRepository.existsApprovedMedicineRelationship(supplier.getId(), med.getId())) {
                    throw new IllegalArgumentException("Medicine '" + med.getName()
                        + "' is not approved for supplier '" + supplier.getSupplierName() + "'");
                }

                BigDecimal unitPrice = (med.getUnitPrice() != null && med.getUnitPrice().compareTo(BigDecimal.ZERO) > 0)
                        ? med.getUnitPrice()
                        : (itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO);
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                total = total.add(subtotal);

                items.add(PurchaseOrderItem.builder()
                        .purchaseOrder(order)
                        .medicine(med)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(unitPrice)
                        .subtotal(subtotal)
                        .build());
            }
        }

        order.setTotalAmount(total);
        order.setItems(items);

        PurchaseOrder saved = purchaseOrderRepository.save(order);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllPurchaseOrders() {
        Supplier supplier = resolveAuthenticatedSupplier();
        if (supplier != null) {
            return purchaseOrderRepository.findBySupplierId(supplier.getId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return purchaseOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        Supplier supplier = resolveAuthenticatedSupplier();
        if (supplier != null) {
            if (order.getSupplier() == null || !order.getSupplier().getId().equals(supplier.getId())) {
                throw new ResourceNotFoundException("Purchase order not found with id: " + id);
            }
        }
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse updatePurchaseOrderStatus(
            Long id,
            String requestedStatus
    ) {
        PurchaseOrder order = purchaseOrderRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Purchase order not found with id: " +
                                id
                        )
                );

        if (requestedStatus == null ||
                requestedStatus.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Purchase order status is required"
            );
        }

        String currentStatus =
                order.getStatus().toUpperCase();

        String targetStatus =
                requestedStatus.trim().toUpperCase();

        String actor = currentActor();

        boolean isAdmin = hasRole("ADMIN");
        boolean isPharmacist = hasRole("PHARMACIST");
        boolean isSupplier = hasRole("SUPPLIER");

        Supplier authenticatedSupplier =
                resolveAuthenticatedSupplier();

        if (isSupplier) {
            if (authenticatedSupplier == null ||
                    order.getSupplier() == null ||
                    !order.getSupplier().getId().equals(
                            authenticatedSupplier.getId()
                    )) {
                throw new AccessDeniedException(
                        "Supplier cannot update another supplier's order"
                );
            }
        }

        boolean isCreator =
                order.getCreatedBy() != null &&
                order.getCreatedBy()
                        .equalsIgnoreCase(actor);

        if ("PENDING".equals(currentStatus) &&
                "APPROVED".equals(targetStatus)) {
            if (!isAdmin) {
                throw new AccessDeniedException(
                        "Only an Admin can approve a purchase order"
                );
            }

            if (isCreator) {
                throw new IllegalArgumentException(
                        "The creator cannot approve their own purchase order"
                );
            }

            order.setApprovedBy(actor);
            order.setApprovedAt(LocalDateTime.now());

        } else if ("PENDING".equals(currentStatus) &&
                "CANCELLED".equals(targetStatus)) {
            if (!isAdmin &&
                    !(isPharmacist && isCreator)) {
                throw new AccessDeniedException(
                        "Only an Admin or the creator can cancel a pending order"
                );
            }

            order.setCancelledBy(actor);
            order.setCancelledAt(LocalDateTime.now());

        } else if ("APPROVED".equals(currentStatus) &&
                "PROCESSING".equals(targetStatus)) {
            if (!isSupplier) {
                throw new AccessDeniedException(
                        "Only the assigned Supplier can process an approved order"
                );
            }

            order.setProcessedBy(actor);
            order.setProcessedAt(LocalDateTime.now());

        } else if ("APPROVED".equals(currentStatus) &&
                "CANCELLED".equals(targetStatus)) {
            if (!isAdmin) {
                throw new AccessDeniedException(
                        "Only an Admin can cancel an approved order"
                );
            }

            order.setCancelledBy(actor);
            order.setCancelledAt(LocalDateTime.now());

        } else if ("PROCESSING".equals(currentStatus) &&
                "SHIPPED".equals(targetStatus)) {
            if (!isSupplier) {
                throw new AccessDeniedException(
                        "Only the assigned Supplier can ship an order"
                );
            }

            order.setShippedBy(actor);
            order.setShippedAt(LocalDateTime.now());

        } else if ("PROCESSING".equals(currentStatus) &&
                "CANCELLED".equals(targetStatus)) {
            if (!isAdmin) {
                throw new AccessDeniedException(
                        "Only an Admin can cancel a processing order"
                );
            }

            order.setCancelledBy(actor);
            order.setCancelledAt(LocalDateTime.now());

        } else {
            throw new IllegalArgumentException(
                    "Invalid purchase order transition: " +
                    currentStatus +
                    " -> " +
                    targetStatus
            );
        }

        order.setStatus(targetStatus);
        order.setStatusUpdatedBy(actor);
        order.setStatusUpdatedAt(LocalDateTime.now());

        PurchaseOrder saved =
                purchaseOrderRepository.save(order);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse receivePurchaseOrder(
            Long id,
            PurchaseOrderReceiptRequest request
    ) {
        if (!hasRole("ADMIN") &&
                !hasRole("PHARMACIST")) {
            throw new AccessDeniedException(
                    "Only an Admin or Pharmacist can receive a shipment"
            );
        }

        PurchaseOrder order = purchaseOrderRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Purchase order not found with id: " +
                                id
                        )
                );

        if (!"SHIPPED".equalsIgnoreCase(
                order.getStatus()
        )) {
            throw new IllegalArgumentException(
                    "Only a shipped purchase order can be received"
            );
        }

        Map<Long, PurchaseOrderReceiptItemRequest>
                receiptByItemId =
                request.getItems()
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        PurchaseOrderReceiptItemRequest
                                                ::getPurchaseOrderItemId,
                                        Function.identity(),
                                        (first, duplicate) -> {
                                            throw new IllegalArgumentException(
                                                    "Duplicate receipt details for purchase order item: " +
                                                    first.getPurchaseOrderItemId()
                                            );
                                        }
                                )
                        );

        List<PurchaseOrderItem> orderItems =
                order.getItems() == null
                        ? List.of()
                        : order.getItems();

        if (receiptByItemId.size() !=
                orderItems.size()) {
            throw new IllegalArgumentException(
                    "Receipt details must be provided for every purchase order item"
            );
        }

        for (PurchaseOrderItem orderItem : orderItems) {
            PurchaseOrderReceiptItemRequest receipt =
                    receiptByItemId.get(orderItem.getId());

            if (receipt == null) {
                throw new IllegalArgumentException(
                        "Missing receipt details for purchase order item: " +
                        orderItem.getId()
                );
            }

            if (orderItem.getReceivedQuantity() != null) {
                throw new IllegalArgumentException(
                        "Purchase order item has already been received: " +
                        orderItem.getId()
                );
            }

            if (orderItem.getMedicine() == null) {
                throw new IllegalArgumentException(
                        "Medicine information is missing for purchase order item: " +
                        orderItem.getId()
                );
            }

            inventoryService.receivePurchaseOrderStock(
                    orderItem.getMedicine().getId(),
                    orderItem.getQuantity(),
                    receipt.getMinimumStock(),
                    receipt.getBatchNumber(),
                    receipt.getExpiryDate(),
                    receipt.getStorageLocation(),
                    order.getOrderNumber()
            );

            orderItem.setReceivedQuantity(
                    orderItem.getQuantity()
            );

            orderItem.setReceivedBatchNumber(
                    receipt.getBatchNumber().trim()
            );

            orderItem.setReceivedExpiryDate(
                    receipt.getExpiryDate()
            );

            orderItem.setReceivedStorageLocation(
                    receipt.getStorageLocation()
            );
        }

        String actor = currentActor();

        order.setStatus("RECEIVED");
        order.setReceivedBy(actor);
        order.setReceivedAt(LocalDateTime.now());
        order.setStatusUpdatedBy(actor);
        order.setStatusUpdatedAt(LocalDateTime.now());

        PurchaseOrder saved =
                purchaseOrderRepository.save(order);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deletePurchaseOrder(Long id) {
        if (!purchaseOrderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Purchase order not found with id: " + id);
        }
        purchaseOrderRepository.deleteById(id);
    }

    private PurchaseOrderResponse mapToResponse(PurchaseOrder order) {
        Supplier s = order.getSupplier();
        SupplierResponse supResp = s == null ? null : SupplierResponse.builder()
                .id(s.getId())
                .supplierCode(s.getSupplierCode())
                .supplierName(s.getSupplierName())
                .contactPerson(s.getContactPerson())
                .phone(s.getPhone())
                .email(s.getEmail())
                .address(s.getAddress())
                .city(s.getCity())
                .state(s.getState())
                .country(s.getCountry())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();

        List<PurchaseOrderItemResponse> itemResps = order.getItems() == null ? List.of() :
                order.getItems().stream().map(it -> PurchaseOrderItemResponse.builder()
                        .id(it.getId())
                        .medicineId(it.getMedicine() != null ? it.getMedicine().getId() : null)
                        .medicineName(it.getMedicine() != null ? it.getMedicine().getName() : "N/A")
                        .medicineCode(it.getMedicine() != null ? it.getMedicine().getMedicineCode() : "N/A")
                        .quantity(it.getQuantity())
                        .unitPrice(it.getUnitPrice())
                        .subtotal(it.getSubtotal())
                        .receivedQuantity(it.getReceivedQuantity())
                        .receivedBatchNumber(it.getReceivedBatchNumber())
                        .receivedExpiryDate(it.getReceivedExpiryDate())
                        .receivedStorageLocation(it.getReceivedStorageLocation())
                        .build())
                        .collect(Collectors.toList());

                return PurchaseOrderResponse.builder()
                        .id(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .supplier(supResp)
                        .orderDate(order.getOrderDate())
                        .expectedDelivery(order.getExpectedDelivery())
                        .status(order.getStatus())
                        .totalAmount(order.getTotalAmount())
                        .createdBy(order.getCreatedBy())
                        .approvedBy(order.getApprovedBy())
                        .approvedAt(order.getApprovedAt())
                        .processedBy(order.getProcessedBy())
                        .processedAt(order.getProcessedAt())
                        .shippedBy(order.getShippedBy())
                        .shippedAt(order.getShippedAt())
                        .receivedBy(order.getReceivedBy())
                        .receivedAt(order.getReceivedAt())
                        .cancelledBy(order.getCancelledBy())
                        .cancelledAt(order.getCancelledAt())
                        .statusUpdatedBy(order.getStatusUpdatedBy())
                        .statusUpdatedAt(order.getStatusUpdatedAt())
                        .items(itemResps)
                        .createdAt(order.getCreatedAt())
                        .updatedAt(order.getUpdatedAt())
                        .build();
    }
}
