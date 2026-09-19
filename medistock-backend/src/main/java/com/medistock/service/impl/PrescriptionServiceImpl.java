package com.medistock.service.impl;

import com.medistock.dto.CreateSaleRequest;
import com.medistock.dto.PageResponse;
import com.medistock.dto.PrescriptionDTO;
import com.medistock.dto.SaleDTO;
import com.medistock.dto.SaleItemDTO;
import com.medistock.entity.*;
import com.medistock.enums.ActionType;
import com.medistock.enums.NotificationType;
import com.medistock.enums.PrescriptionStatus;
import com.medistock.enums.SaleType;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.*;
import com.medistock.service.NotificationService;
import com.medistock.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final StockLogRepository stockLogRepository;
    private final SaleRepository saleRepository;

    @Value("${app.upload.dir:uploads/prescriptions/}")
    private String uploadDir;

    public PrescriptionServiceImpl(PrescriptionRepository prescriptionRepository,
                                   CustomerRepository customerRepository,
                                   UserRepository userRepository,
                                   NotificationService notificationService,
                                   MedicineRepository medicineRepository,
                                   InventoryRepository inventoryRepository,
                                   StockLogRepository stockLogRepository,
                                   SaleRepository saleRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockLogRepository = stockLogRepository;
        this.saleRepository = saleRepository;
    }

    @Override
    @Transactional
    public PrescriptionDTO uploadPrescription(Long customerId, MultipartFile file) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, filename);
            Files.write(filePath, file.getBytes());

            Prescription prescription = new Prescription();
            prescription.setCustomer(customer);
            prescription.setImagePath(filePath.toString());
            prescription.setStatus(PrescriptionStatus.PENDING);

            Prescription saved = prescriptionRepository.save(prescription);

            notificationService.createNotification(
                    "New Prescription Uploaded",
                    "Prescription #" + saved.getId() + " uploaded for customer " + customer.getFullName() + ". Pending review.",
                    NotificationType.PRESCRIPTION_ALERT
            );

            return mapToDTO(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store prescription file", e);
        }
    }

    @Override
    public PageResponse<PrescriptionDTO> getAllPrescriptions(PrescriptionStatus status, Pageable pageable) {
        Page<Prescription> page;
        if (status != null) {
            page = prescriptionRepository.findByStatus(status, pageable);
        } else {
            page = prescriptionRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        List<PrescriptionDTO> content = page.getContent().stream().map(this::mapToDTO).collect(Collectors.toList());
        return PageResponse.<PrescriptionDTO>builder()
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
    public List<PrescriptionDTO> getCustomerPrescriptions(Long customerId) {
        return prescriptionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PrescriptionDTO getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + id));
        return mapToDTO(prescription);
    }

    @Override
    @Transactional
    public PrescriptionDTO verifyPrescription(Long id, PrescriptionStatus status, String adminNotes, Long reviewerId) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + id));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found with ID: " + reviewerId));

        prescription.setStatus(status);
        prescription.setAdminNotes(adminNotes);
        prescription.setReviewedBy(reviewer);
        prescription.setReviewedAt(LocalDateTime.now());

        Prescription saved = prescriptionRepository.save(prescription);

        notificationService.createNotification(
                "Prescription Verified: " + status.name(),
                "Prescription #" + saved.getId() + " for " + saved.getCustomer().getFullName() + " was " + status.name(),
                NotificationType.PRESCRIPTION_ALERT
        );

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public SaleDTO fulfillPrescriptionOrder(Long prescriptionId, List<CreateSaleRequest.SaleItemRequest> items, Long fulfilledById, String deliveryNotes) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + prescriptionId));

        if (prescription.getStatus() != PrescriptionStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED prescriptions can be fulfilled. Current status: " + prescription.getStatus());
        }

        User fulfilledBy = userRepository.findById(fulfilledById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + fulfilledById));

        Customer customer = prescription.getCustomer();

        // Create the sale
        Sale sale = new Sale();
        sale.setSaleNumber("SALE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        sale.setCustomer(customer);
        sale.setPrescription(prescription);
        sale.setSaleType(SaleType.ONLINE);
        sale.setSoldBy(fulfilledBy);
        sale.setNotes(deliveryNotes != null ? deliveryNotes : "Online prescription order fulfilled");
        sale.setStatus("DELIVERED");

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        for (CreateSaleRequest.SaleItemRequest itemReq : items) {
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
            saleItems.add(item);

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
            log.setPerformedBy(fulfilledBy.getEmail());
            log.setRemarks("Online prescription order fulfilled - Sale " + sale.getSaleNumber());
            stockLogRepository.save(log);
        }

        sale.setTotalAmount(totalAmount);
        sale.setItems(saleItems);
        Sale savedSale = saleRepository.save(sale);

        // Mark prescription as FULFILLED
        prescription.setStatus(PrescriptionStatus.FULFILLED);
        prescriptionRepository.save(prescription);

        notificationService.createNotification(
                "Online Prescription Order Delivered",
                "Prescription #" + prescriptionId + " for " + customer.getFullName() + " has been fulfilled. Sale #" + savedSale.getSaleNumber() + " Total: ₹" + totalAmount,
                NotificationType.PRESCRIPTION_ALERT
        );

        return mapToSaleDTO(savedSale);
    }

    private PrescriptionDTO mapToDTO(Prescription p) {
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(p.getId());
        dto.setCustomerId(p.getCustomer().getId());
        dto.setCustomerName(p.getCustomer().getFullName());
        dto.setCustomerPhone(p.getCustomer().getPhone());
        dto.setImagePath(p.getImagePath());
        dto.setStatus(p.getStatus() != null ? p.getStatus().name() : null);
        dto.setAdminNotes(p.getAdminNotes());

        if (p.getReviewedBy() != null) {
            dto.setReviewedById(p.getReviewedBy().getId());
            dto.setReviewedByName(p.getReviewedBy().getFullName());
        }

        dto.setCreatedAt(p.getCreatedAt());
        dto.setReviewedAt(p.getReviewedAt());
        return dto;
    }

    private SaleDTO mapToSaleDTO(Sale sale) {
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

