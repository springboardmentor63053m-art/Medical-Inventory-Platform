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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryService inventoryService;

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderByOrderNumber(String orderNumber) {
        PurchaseOrder order = purchaseOrderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with number: " + orderNumber));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getPurchaseOrdersByStatus(OrderStatus status) {
        return purchaseOrderRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemReq.getMedicineId()));

            BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            grandTotal = grandTotal.add(lineTotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(order)
                    .medicine(medicine)
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

        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == OrderStatus.RECEIVED && status != OrderStatus.RECEIVED) {
            throw new BadRequestException("Cannot change status of an already RECEIVED order");
        }

        order.setStatus(status);

        // If status changes to APPROVED or RECEIVED (and was not previously APPROVED or RECEIVED), update inventory stock
        if ((status == OrderStatus.APPROVED || status == OrderStatus.RECEIVED)
                && oldStatus != OrderStatus.APPROVED && oldStatus != OrderStatus.RECEIVED) {
            for (PurchaseOrderItem item : order.getItems()) {
                inventoryService.updateStockQuantity(item.getMedicine().getId(), item.getQuantity());
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
                        .medicineId(item.getMedicine() != null ? item.getMedicine().getId() : null)
                        .medicineName(item.getMedicine() != null ? item.getMedicine().getName() : null)
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
