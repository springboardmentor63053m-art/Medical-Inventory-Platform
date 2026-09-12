package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.PurchaseOrderItemRequest;
import com.medistock.medistock_backend.dto.PurchaseOrderRequest;
import com.medistock.medistock_backend.dto.PurchaseOrderResponse;
import com.medistock.medistock_backend.dto.SupplierDto;
import com.medistock.medistock_backend.entity.*;
import com.medistock.medistock_backend.exception.BadRequestException;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import com.medistock.medistock_backend.repository.MedicineRepository;
import com.medistock.medistock_backend.repository.PurchaseOrderRepository;
import com.medistock.medistock_backend.repository.SupplierMedicineRepository;
import com.medistock.medistock_backend.repository.SupplierRepository;
import com.medistock.medistock_backend.repository.UserRepository;
import com.medistock.medistock_backend.service.InventoryService;
import com.medistock.medistock_backend.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierMedicineRepository supplierMedicineRepository;
    private final InventoryService inventoryService;

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllPurchaseOrders() {
        Long supplierId = getAuthenticatedSupplierIdIfSupplierRole();
        List<PurchaseOrder> list = supplierId != null ?
                purchaseOrderRepository.findBySupplierId(supplierId) :
                purchaseOrderRepository.findAll();
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));
        Long supplierId = getAuthenticatedSupplierIdIfSupplierRole();
        if (supplierId != null && (order.getSupplier() == null || !order.getSupplier().getId().equals(supplierId))) {
            throw new BadRequestException("Access denied: You cannot view purchase orders for another supplier");
        }
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderByOrderNumber(String orderNumber) {
        PurchaseOrder order = purchaseOrderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with number: " + orderNumber));
        Long supplierId = getAuthenticatedSupplierIdIfSupplierRole();
        if (supplierId != null && (order.getSupplier() == null || !order.getSupplier().getId().equals(supplierId))) {
            throw new BadRequestException("Access denied: You cannot view purchase orders for another supplier");
        }
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getPurchaseOrdersByStatus(OrderStatus status) {
        Long supplierId = getAuthenticatedSupplierIdIfSupplierRole();
        List<PurchaseOrder> list = purchaseOrderRepository.findByStatus(status);
        if (supplierId != null) {
            list = list.stream()
                    .filter(o -> o.getSupplier() != null && o.getSupplier().getId().equals(supplierId))
                    .collect(Collectors.toList());
        }
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Long getAuthenticatedSupplierIdIfSupplierRole() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPPLIER"))) {
            String username = auth.getName();
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                Supplier supplier = supplierRepository.findByUserId(user.getId())
                        .orElseGet(() -> supplierRepository.findByEmail(user.getEmail()).orElse(null));
                if (supplier != null) {
                    return supplier.getId();
                }
            }
        }
        return null;
    }

    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request, String currentUsername) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        User user = null;
        if (currentUsername != null) {
            user = userRepository.findByUsername(currentUsername).orElse(null);
        }

        String orderNum = "PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PurchaseOrder order = PurchaseOrder.builder()
                .orderNumber(orderNum)
                .supplier(supplier)
                .createdBy(user)
                .status(OrderStatus.PENDING)
                .orderDate(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        BigDecimal grandTotal = BigDecimal.ZERO;

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            SupplierMedicine supplierMedicine = supplierMedicineRepository.findById(itemReq.getSupplierMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier medicine not found with id: " + itemReq.getSupplierMedicineId()));

            BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            grandTotal = grandTotal.add(lineTotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(order)
                    .supplierMedicine(supplierMedicine)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .totalPrice(lineTotal)
                    .build();

            order.getItems().add(item);
        }

        order.setTotalAmount(grandTotal);
        return mapToResponse(purchaseOrderRepository.save(order));
    }

    @Override
    @Transactional
    public PurchaseOrderResponse updateOrderStatus(Long id, OrderStatus status) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));

        Long supplierId = getAuthenticatedSupplierIdIfSupplierRole();
        if (supplierId != null) {
            if (order.getSupplier() == null || !order.getSupplier().getId().equals(supplierId)) {
                throw new BadRequestException("Access denied: You cannot update purchase orders for another supplier");
            }
            if (status == OrderStatus.RECEIVED) {
                throw new BadRequestException("Access denied: Suppliers cannot mark orders as RECEIVED");
            }
        }

        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == OrderStatus.RECEIVED && status != OrderStatus.RECEIVED) {
            throw new BadRequestException("Cannot change status of an already RECEIVED order");
        }

        order.setStatus(status);

        // If status changes to RECEIVED, update inventory stock
        if (status == OrderStatus.RECEIVED && oldStatus != OrderStatus.RECEIVED) {
            for (PurchaseOrderItem item : order.getItems()) {
                SupplierMedicine supplierMed = item.getSupplierMedicine();
                if (supplierMed != null) {
                    // Case B: Match by code first
                    Optional<Medicine> adminMedOpt = medicineRepository.findByCode(supplierMed.getCode());

                    // Case B fallback: match by name + genericName + manufacturer (case-insensitive)
                    if (!adminMedOpt.isPresent() && supplierMed.getName() != null) {
                        List<Medicine> matches = medicineRepository
                            .findByNameIgnoreCaseAndGenericNameIgnoreCaseAndManufacturerIgnoreCase(
                                supplierMed.getName().trim(),
                                supplierMed.getGenericName() != null ? supplierMed.getGenericName().trim() : "",
                                supplierMed.getManufacturer() != null ? supplierMed.getManufacturer().trim() : ""
                            );
                        if (!matches.isEmpty()) {
                            adminMedOpt = Optional.of(matches.get(0));
                        }
                    }

                    Medicine adminMed;
                    BigDecimal poPurchasePrice = item.getUnitPrice() != null ? item.getUnitPrice() : supplierMed.getPrice();
                    if (adminMedOpt.isPresent()) {
                        // Case B: Medicine exists — update unitPrice (buying cost), NEVER overwrite sellingPrice
                        adminMed = adminMedOpt.get();
                        adminMed.setUnitPrice(poPurchasePrice);
                        adminMed = medicineRepository.save(adminMed);
                    } else {
                        // Case A: Medicine is new — create it in Admin
                        // set unitPrice = poPurchasePrice, leave sellingPrice null (unassigned)
                        adminMed = Medicine.builder()
                                .name(supplierMed.getName())
                                .code(supplierMed.getCode())
                                .genericName(supplierMed.getGenericName())
                                .manufacturer(supplierMed.getManufacturer())
                                .unitPrice(poPurchasePrice)
                                .sellingPrice(null)
                                .expiryDate(supplierMed.getExpiryDate())
                                .batchNumber(supplierMed.getBatchNumber())
                                .category(supplierMed.getCategory())
                                .supplier(order.getSupplier())
                                .build();
                        adminMed = medicineRepository.save(adminMed);
                    }
                    inventoryService.updateStockQuantity(adminMed.getId(), item.getQuantity());
                }
            }
        }

        return mapToResponse(purchaseOrderRepository.save(order));
    }

    @Override
    @Transactional
    public void deletePurchaseOrder(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));

        if (order.getStatus() == OrderStatus.RECEIVED) {
            throw new BadRequestException("Cannot delete a RECEIVED purchase order");
        }
        purchaseOrderRepository.delete(order);
    }

    private PurchaseOrderResponse mapToResponse(PurchaseOrder order) {
        SupplierDto supplierDto = order.getSupplier() != null ?
                SupplierDto.builder()
                        .id(order.getSupplier().getId())
                        .name(order.getSupplier().getName())
                        .contactPerson(order.getSupplier().getContactPerson())
                        .email(order.getSupplier().getEmail())
                        .phone(order.getSupplier().getPhone())
                        .address(order.getSupplier().getAddress())
                        .build() : null;

        List<PurchaseOrderResponse.ItemDto> itemDtos = order.getItems().stream()
                .map(item -> PurchaseOrderResponse.ItemDto.builder()
                        .id(item.getId())
                        .supplierMedicineId(item.getSupplierMedicine() != null ? item.getSupplierMedicine().getId() : null)
                        .medicineName(item.getSupplierMedicine() != null ? item.getSupplierMedicine().getName() : null)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .supplier(supplierDto)
                .createdByUsername(order.getCreatedBy() != null ? order.getCreatedBy().getUsername() : "System")
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .items(itemDtos)
                .build();
    }
}
