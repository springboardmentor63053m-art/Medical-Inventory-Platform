package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.SaleRequest;
import com.medistock.medistock_backend.dto.SaleItemRequest;
import com.medistock.medistock_backend.dto.SaleResponse;
import com.medistock.medistock_backend.entity.Inventory;
import com.medistock.medistock_backend.entity.Medicine;
import com.medistock.medistock_backend.entity.Sale;
import com.medistock.medistock_backend.entity.SaleItem;
import com.medistock.medistock_backend.entity.User;
import com.medistock.medistock_backend.exception.BadRequestException;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import com.medistock.medistock_backend.repository.InventoryRepository;
import com.medistock.medistock_backend.repository.MedicineRepository;
import com.medistock.medistock_backend.repository.SaleRepository;
import com.medistock.medistock_backend.repository.UserRepository;
import com.medistock.medistock_backend.service.InventoryService;
import com.medistock.medistock_backend.service.SaleService;
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
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;

    @Override
    @Transactional
    public SaleResponse createSale(SaleRequest request, String currentUsername) {
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new BadRequestException("Customer name is required");
        }
        if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
            throw new BadRequestException("Customer phone is required");
        }

        // 1. Find User who created the sale
        User user = null;
        if (currentUsername != null && !currentUsername.isBlank()) {
            user = userRepository.findByUsername(currentUsername).orElse(null);
        }

        // 2. Stock Validation (Pre-check)
        for (SaleItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemReq.getMedicineId()));

            Inventory inventory = inventoryRepository.findByMedicineId(itemReq.getMedicineId())
                    .orElseThrow(() -> new BadRequestException("Medicine " + medicine.getName() + " does not have an inventory entry."));

            if (inventory.getQuantity() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for " + medicine.getName() + ". Available: " + inventory.getQuantity() + ".");
            }
        }

        // 3. Generate Unique Invoice Number
        String invoiceNum = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 4. Build Sale Entity
        Sale sale = Sale.builder()
                .invoiceNumber(invoiceNum)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .saleDate(LocalDateTime.now())
                .user(user)
                .items(new ArrayList<>())
                .build();

        BigDecimal grandTotal = BigDecimal.ZERO;

        // 5. Build and Save SaleItems
        for (SaleItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + itemReq.getMedicineId()));

            if (medicine.getPrice() == null) {
                throw new BadRequestException("Medicine " + medicine.getName() + " does not have a price set. Cannot complete sale.");
            }

            BigDecimal unitPrice = medicine.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            grandTotal = grandTotal.add(lineTotal);

            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .medicine(medicine)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(lineTotal)
                    .build();

            sale.getItems().add(saleItem);

            // 6. Decrease Inventory & Automatically Create OUT StockMovement
            inventoryService.updateStockQuantity(itemReq.getMedicineId(), -itemReq.getQuantity());
        }

        sale.setTotalAmount(grandTotal);
        
        BigDecimal finalAmt = grandTotal.subtract(sale.getDiscountAmount());
        if (finalAmt.compareTo(BigDecimal.ZERO) < 0) {
            finalAmt = BigDecimal.ZERO;
        }
        sale.setFinalAmount(finalAmt);

        Sale savedSale = saleRepository.save(sale);
        return mapToResponse(savedSale);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SaleResponse> getAllSales() {
        return saleRepository.findAllByOrderBySaleDateDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale record not found with id: " + id));
        return mapToResponse(sale);
    }

    private SaleResponse mapToResponse(Sale sale) {
        List<SaleResponse.SaleItemDto> itemDtos = sale.getItems().stream()
                .map(item -> SaleResponse.SaleItemDto.builder()
                        .id(item.getId())
                        .medicineId(item.getMedicine() != null ? item.getMedicine().getId() : null)
                        .medicineName(item.getMedicine() != null ? item.getMedicine().getName() : "N/A")
                        .medicineCode(item.getMedicine() != null ? item.getMedicine().getCode() : "N/A")
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        String username = sale.getUser() != null ? sale.getUser().getUsername() : "N/A";

        return SaleResponse.builder()
                .id(sale.getId())
                .invoiceNumber(sale.getInvoiceNumber())
                .customerName(sale.getCustomerName())
                .customerPhone(sale.getCustomerPhone())
                .totalAmount(sale.getTotalAmount())
                .discountAmount(sale.getDiscountAmount())
                .finalAmount(sale.getFinalAmount())
                .paymentMethod(sale.getPaymentMethod())
                .saleDate(sale.getSaleDate())
                .createdByUsername(username)
                .items(itemDtos)
                .build();
    }
}
