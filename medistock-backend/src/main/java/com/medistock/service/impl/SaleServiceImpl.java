package com.medistock.service.impl;

import com.medistock.dto.CreateSaleRequest;
import com.medistock.dto.PageResponse;
import com.medistock.dto.SaleDTO;
import com.medistock.dto.SaleItemDTO;
import com.medistock.entity.*;
import com.medistock.enums.ActionType;
import com.medistock.enums.NotificationType;
import com.medistock.enums.SaleType;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.*;
import com.medistock.service.NotificationService;
import com.medistock.service.SaleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final StockLogRepository stockLogRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SaleServiceImpl(SaleRepository saleRepository,
                           CustomerRepository customerRepository,
                           PrescriptionRepository prescriptionRepository,
                           MedicineRepository medicineRepository,
                           InventoryRepository inventoryRepository,
                           StockLogRepository stockLogRepository,
                           UserRepository userRepository,
                           NotificationService notificationService) {
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockLogRepository = stockLogRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public SaleDTO createSale(CreateSaleRequest request, Long soldById) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        User soldBy = userRepository.findById(soldById)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found with ID: " + soldById));

        Prescription prescription = null;
        if (request.getPrescriptionId() != null) {
            prescription = prescriptionRepository.findById(request.getPrescriptionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + request.getPrescriptionId()));
        }

        Sale sale = new Sale();
        sale.setSaleNumber("SALE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        sale.setCustomer(customer);
        sale.setPrescription(prescription);
        sale.setSaleType(request.getSaleType() != null ? SaleType.valueOf(request.getSaleType()) : SaleType.WALK_IN);
        sale.setSoldBy(soldBy);
        sale.setNotes(request.getNotes());
        sale.setStatus("COMPLETED");

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<SaleItem> items = new ArrayList<>();

        for (CreateSaleRequest.SaleItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + itemReq.getMedicineId()));

            Inventory inventory = inventoryRepository.findByMedicineId(medicine.getId())
                    .orElseThrow(() -> new BadRequestException("No inventory tracking found for medicine: " + medicine.getMedicineName()));

            if (inventory.getQuantity() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for medicine: " + medicine.getMedicineName() + ". Available: " + inventory.getQuantity());
            }

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : medicine.getSellingPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setMedicine(medicine);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(unitPrice);
            item.setSubtotal(subtotal);
            items.add(item);

            totalAmount = totalAmount.add(subtotal);

            // Deduct inventory
            int prevQty = inventory.getQuantity();
            int newQty = prevQty - itemReq.getQuantity();
            inventory.setQuantity(newQty);
            inventoryRepository.save(inventory);

            // Add StockLog
            StockLog log = new StockLog();
            log.setMedicine(medicine);
            log.setActionType(ActionType.OUT);
            log.setQuantity(itemReq.getQuantity());
            log.setPreviousQuantity(prevQty);
            log.setNewQuantity(newQty);
            log.setPerformedBy(soldBy.getEmail());
            log.setRemarks("Dispensed via sale " + sale.getSaleNumber());
            stockLogRepository.save(log);
        }

        sale.setTotalAmount(totalAmount);
        sale.setItems(items);

        Sale saved = saleRepository.save(sale);

        notificationService.createNotification(
                "New Sale Processed",
                "Sale #" + saved.getSaleNumber() + " created for customer " + customer.getFullName() + ". Total: ₹" + totalAmount,
                NotificationType.SALE_ALERT
        );

        return mapToDTO(saved);
    }

    @Override
    public PageResponse<SaleDTO> getAllSales(SaleType saleType, Pageable pageable) {
        Page<Sale> page;
        if (saleType != null) {
            page = saleRepository.findBySaleType(saleType, pageable);
        } else {
            page = saleRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        List<SaleDTO> content = page.getContent().stream().map(this::mapToDTO).collect(Collectors.toList());
        return PageResponse.<SaleDTO>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    public SaleDTO getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with ID: " + id));
        return mapToDTO(sale);
    }

    @Override
    public List<SaleDTO> getCustomerSales(Long customerId) {
        return saleRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SaleDTO mapToDTO(Sale sale) {
        SaleDTO dto = new SaleDTO();
        dto.setId(sale.getId());
        dto.setSaleNumber(sale.getSaleNumber());
        dto.setCustomerId(sale.getCustomer().getId());
        dto.setCustomerName(sale.getCustomer().getFullName());
        dto.setCustomerPhone(sale.getCustomer().getPhone());

        if (sale.getPrescription() != null) {
            dto.setPrescriptionId(sale.getPrescription().getId());
        }

        dto.setSaleType(sale.getSaleType() != null ? sale.getSaleType().name() : null);
        dto.setTotalAmount(sale.getTotalAmount());
        dto.setStatus(sale.getStatus());
        dto.setSoldById(sale.getSoldBy().getId());
        dto.setSoldByName(sale.getSoldBy().getFullName());
        dto.setNotes(sale.getNotes());
        dto.setCreatedAt(sale.getCreatedAt());

        if (sale.getItems() != null) {
            dto.setItems(sale.getItems().stream().map(item -> {
                SaleItemDTO itemDTO = new SaleItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setMedicineId(item.getMedicine().getId());
                itemDTO.setMedicineName(item.getMedicine().getMedicineName());
                itemDTO.setMedicineCode(item.getMedicine().getMedicineCode());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setUnitPrice(item.getUnitPrice());
                itemDTO.setSubtotal(item.getSubtotal());
                return itemDTO;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
