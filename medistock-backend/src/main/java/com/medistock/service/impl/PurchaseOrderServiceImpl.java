package com.medistock.service.impl;

import com.medistock.dto.PageResponse;
import com.medistock.dto.PurchaseOrderCreateRequest;
import com.medistock.dto.PurchaseOrderDTO;
import com.medistock.dto.PurchaseOrderItemDTO;
import com.medistock.entity.Medicine;
import com.medistock.entity.PurchaseOrder;
import com.medistock.entity.PurchaseOrderItem;
import com.medistock.entity.Supplier;
import com.medistock.enums.ActionType;
import com.medistock.enums.NotificationType;
import com.medistock.enums.OrderStatus;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseOrderRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.service.InventoryService;
import com.medistock.service.NotificationService;
import com.medistock.service.PurchaseOrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;

    public PurchaseOrderServiceImpl(PurchaseOrderRepository purchaseOrderRepository, SupplierRepository supplierRepository, MedicineRepository medicineRepository, InventoryService inventoryService, NotificationService notificationService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryService = inventoryService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderCreateRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        String orderNumber = "PO-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        PurchaseOrder purchaseOrder = PurchaseOrder.builder()
                .supplier(supplier)
                .orderNumber(orderNumber)
                .orderDate(LocalDate.now())
                .expectedDelivery(request.getExpectedDelivery())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal grandTotal = BigDecimal.ZERO;

        for (PurchaseOrderItemDTO itemDTO : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemDTO.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", itemDTO.getMedicineId()));

            BigDecimal unitPrice = itemDTO.getUnitPrice() != null ? itemDTO.getUnitPrice() : medicine.getUnitPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemDTO.getQuantity()));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .medicine(medicine)
                    .quantity(itemDTO.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            purchaseOrder.addItem(item);
            grandTotal = grandTotal.add(subtotal);
        }

        purchaseOrder.setTotalAmount(grandTotal);
        PurchaseOrder savedOrder = purchaseOrderRepository.save(purchaseOrder);

        notificationService.createNotification(
                "New Purchase Order Created",
                "Purchase order #" + savedOrder.getOrderNumber() + " created for supplier " + supplier.getSupplierName(),
                NotificationType.PURCHASE_ALERT
        );

        return mapToDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderDTO> getAllPurchaseOrders(OrderStatus status, Long supplierId, Pageable pageable) {
        Page<PurchaseOrder> page;
        if (status != null) {
            page = purchaseOrderRepository.findByStatus(status, pageable);
        } else if (supplierId != null) {
            page = purchaseOrderRepository.findBySupplierId(supplierId, pageable);
        } else {
            page = purchaseOrderRepository.findAll(pageable);
        }

        List<PurchaseOrderDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<PurchaseOrderDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderDTO getPurchaseOrderById(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        return mapToDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderDTO> getOrdersBySupplier(Long supplierId, Pageable pageable) {
        Page<PurchaseOrder> page = purchaseOrderRepository.findBySupplierId(supplierId, pageable);
        List<PurchaseOrderDTO> dtos = page.getContent().stream().map(this::mapToDTO).toList();
        return PageResponse.<PurchaseOrderDTO>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public PurchaseOrderDTO shipOrder(Long orderId, String trackingDetails, Long supplierUserId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", orderId));

        if (order.getStatus() != OrderStatus.APPROVED && order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order cannot be shipped in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.SHIPPED);
        PurchaseOrder saved = purchaseOrderRepository.save(order);

        notificationService.createNotification(
                "Medicine Shipped by Supplier",
                "Purchase order #" + order.getOrderNumber() + " has been marked as SHIPPED by supplier." + (trackingDetails != null ? " Details: " + trackingDetails : ""),
                NotificationType.PURCHASE_ALERT
        );

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public PurchaseOrderDTO updateOrderStatus(Long id, OrderStatus newStatus, String updatedBy) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of a CANCELLED purchase order");
        }

        if (order.getStatus() == OrderStatus.RECEIVED && newStatus != OrderStatus.RECEIVED) {
            throw new BadRequestException("Purchase order #" + order.getOrderNumber() + " is already RECEIVED");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(newStatus);
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);

        // Transition to RECEIVED -> auto update inventory and log stock
        if (previousStatus != OrderStatus.RECEIVED && newStatus == OrderStatus.RECEIVED) {
            for (PurchaseOrderItem item : updatedOrder.getItems()) {
                inventoryService.adjustStock(
                        item.getMedicine().getId(),
                        item.getQuantity(),
                        ActionType.IN,
                        updatedBy != null ? updatedBy : "PO Receiving Agent",
                        "Received stock via PO #" + updatedOrder.getOrderNumber()
                );
            }

            notificationService.createNotification(
                    "Purchase Order Received",
                    "Purchase order #" + updatedOrder.getOrderNumber() + " has been marked as RECEIVED and inventory has been updated.",
                    NotificationType.PURCHASE_ALERT
            );
        }

        return mapToDTO(updatedOrder);
    }

    @Override
    @Transactional
    public void cancelPurchaseOrder(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));

        if (order.getStatus() == OrderStatus.RECEIVED) {
            throw new BadRequestException("Cannot cancel a RECEIVED purchase order");
        }

        order.setStatus(OrderStatus.CANCELLED);
        purchaseOrderRepository.save(order);
    }

    private PurchaseOrderDTO mapToDTO(PurchaseOrder order) {
        List<PurchaseOrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> PurchaseOrderItemDTO.builder()
                        .id(item.getId())
                        .medicineId(item.getMedicine().getId())
                        .medicineCode(item.getMedicine().getMedicineCode())
                        .medicineName(item.getMedicine().getMedicineName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return PurchaseOrderDTO.builder()
                .id(order.getId())
                .supplierId(order.getSupplier().getId())
                .supplierName(order.getSupplier().getSupplierName())
                .orderNumber(order.getOrderNumber())
                .orderDate(order.getOrderDate())
                .expectedDelivery(order.getExpectedDelivery())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemDTOs)
                .build();
    }
}
