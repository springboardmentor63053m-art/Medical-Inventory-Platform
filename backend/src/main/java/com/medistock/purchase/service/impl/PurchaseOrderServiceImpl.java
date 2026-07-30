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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .status(request.getStatus() != null ? request.getStatus() : "PENDING")
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<PurchaseOrderItem> items = new ArrayList<>();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (PurchaseOrderItemRequest itemReq : request.getItems()) {
                Medicine med = medicineRepository.findById(itemReq.getMedicineId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemReq.getMedicineId()));

                BigDecimal subtotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                total = total.add(subtotal);

                items.add(PurchaseOrderItem.builder()
                        .purchaseOrder(order)
                        .medicine(med)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(itemReq.getUnitPrice())
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
        return purchaseOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse updatePurchaseOrderStatus(Long id, String status) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
        order.setStatus(status);
        PurchaseOrder saved = purchaseOrderRepository.save(order);
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
                        .build()).collect(Collectors.toList());

        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .supplier(supResp)
                .orderDate(order.getOrderDate())
                .expectedDelivery(order.getExpectedDelivery())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(itemResps)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
