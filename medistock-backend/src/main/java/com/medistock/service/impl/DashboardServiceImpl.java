package com.medistock.service.impl;

import com.medistock.dto.*;
import com.medistock.entity.Medicine;
import com.medistock.entity.PurchaseOrder;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.enums.ExpiryStatus;
import com.medistock.enums.OrderStatus;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.*;
import com.medistock.service.DashboardService;
import com.medistock.service.ExpiryTrackingService;
import com.medistock.service.StockLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ExpiryTrackingService expiryTrackingService;
    private final StockLogService stockLogService;

    public DashboardServiceImpl(MedicineRepository medicineRepository, SupplierRepository supplierRepository, InventoryRepository inventoryRepository, PurchaseOrderRepository purchaseOrderRepository, NotificationRepository notificationRepository, UserRepository userRepository, ExpiryTrackingService expiryTrackingService, StockLogService stockLogService) {
        this.medicineRepository = medicineRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.expiryTrackingService = expiryTrackingService;
        this.stockLogService = stockLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary() {
        // Core counts from DB
        long totalMedicines = medicineRepository.count();
        long lowStockCount = inventoryRepository.countLowStockItems();
        long availableStockCount = inventoryRepository.countAvailableStockItems();
        long outOfStockCount = inventoryRepository.countOutOfStockItems();
        long totalStockQuantity = inventoryRepository.sumTotalQuantity();
        long totalSuppliers = supplierRepository.count();

        // Expiry counts
        long expiringSoonCount = 0;
        long expiredCount = 0;
        try {
            expiringSoonCount = expiryTrackingService.countByStatus(ExpiryStatus.EXPIRING_SOON);
            expiredCount = expiryTrackingService.countByStatus(ExpiryStatus.EXPIRED);
        } catch (Exception e) {}

        // Purchase order counts
        long pendingOrdersCount = 0;
        long purchasesThisMonth = 0;
        BigDecimal spendThisMonth = BigDecimal.ZERO;
        try {
            pendingOrdersCount = purchaseOrderRepository.countByStatus(OrderStatus.PENDING);
            LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            purchasesThisMonth = purchaseOrderRepository.countByCreatedAtAfter(startOfMonth);
            Double spend = purchaseOrderRepository.sumTotalAmountByCreatedAtAfter(startOfMonth);
            spendThisMonth = spend != null ? BigDecimal.valueOf(spend) : BigDecimal.ZERO;
        } catch (Exception e) {}

        // Inventory value
        Double invValue = inventoryRepository.getTotalInventoryValue();
        BigDecimal totalInventoryValue = invValue != null ? BigDecimal.valueOf(invValue) : BigDecimal.ZERO;

        // Notifications
        long unreadNotificationsCount = 0;
        try {
            unreadNotificationsCount = notificationRepository.countByStatus("UNREAD");
        } catch (Exception e) {}

        // Recent stock activity
        PageResponse<StockLogDTO> recentLogsPage = stockLogService.getAllStockLogs(
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return DashboardSummaryDTO.builder()
                .totalMedicines(totalMedicines)
                .availableStockCount(availableStockCount)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .totalStockQuantity(totalStockQuantity)
                .expiringSoonCount(expiringSoonCount)
                .expiredCount(expiredCount)
                .totalSuppliers(totalSuppliers)
                .pendingOrdersCount(pendingOrdersCount)
                .totalInventoryValue(totalInventoryValue)
                .unreadNotificationsCount(unreadNotificationsCount)
                .purchasesThisMonth(purchasesThisMonth)
                .spendThisMonth(spendThisMonth)
                .recentActivities(recentLogsPage.getContent())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDashboardDTO getSupplierDashboardSummaryForUser(String email) {
        Long supplierId = null;
        if (email != null) {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null && user.getSupplier() != null) {
                supplierId = user.getSupplier().getId();
            }
        }
        if (supplierId == null) {
            // Default to first available active supplier
            List<Supplier> activeSuppliers = supplierRepository.findByStatus("ACTIVE");
            if (!activeSuppliers.isEmpty()) {
                supplierId = activeSuppliers.get(0).getId();
            } else {
                List<Supplier> all = supplierRepository.findAll();
                if (!all.isEmpty()) supplierId = all.get(0).getId();
            }
        }
        if (supplierId == null) {
            throw new ResourceNotFoundException("Supplier Profile", "id", 0L);
        }
        return getSupplierDashboardSummary(supplierId);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDashboardDTO getSupplierDashboardSummary(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));

        SupplierDTO profile = mapSupplierToDTO(supplier);

        // Supplied Medicines
        List<Medicine> medicines = medicineRepository.findBySupplierId(supplierId);
        List<MedicineDTO> suppliedMedicines = medicines.stream().map(m -> {
            MedicineDTO dto = MedicineDTO.builder()
                    .id(m.getId())
                    .medicineCode(m.getMedicineCode())
                    .medicineName(m.getMedicineName())
                    .genericName(m.getGenericName())
                    .category(m.getCategory())
                    .manufacturer(m.getManufacturer())
                    .unitPrice(m.getUnitPrice())
                    .sellingPrice(m.getSellingPrice())
                    .batchNumber(m.getBatchNumber())
                    .description(m.getDescription())
                    .supplierId(supplier.getId())
                    .supplierName(supplier.getSupplierName())
                    .createdAt(m.getCreatedAt())
                    .build();
            inventoryRepository.findByMedicineId(m.getId()).ifPresent(inv -> {
                dto.setQuantity(inv.getQuantity());
                dto.setMinimumStock(inv.getMinimumStock());
                dto.setMaximumStock(inv.getMaximumStock());
            });
            return dto;
        }).toList();

        // Purchase Orders
        Pageable poPageable = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PurchaseOrder> poPage = purchaseOrderRepository.findBySupplierId(supplierId, poPageable);
        List<PurchaseOrderDTO> purchaseOrders = poPage.getContent().stream().map(po ->
                PurchaseOrderDTO.builder()
                        .id(po.getId())
                        .supplierId(po.getSupplier().getId())
                        .supplierName(po.getSupplier().getSupplierName())
                        .orderNumber(po.getOrderNumber())
                        .orderDate(po.getOrderDate())
                        .expectedDelivery(po.getExpectedDelivery())
                        .status(po.getStatus())
                        .totalAmount(po.getTotalAmount())
                        .createdAt(po.getCreatedAt())
                        .updatedAt(po.getUpdatedAt())
                        .build()
        ).toList();

        // Calculate performance metrics
        long totalOrdersCount = purchaseOrders.size();
        long completedOrdersCount = purchaseOrders.stream().filter(po ->
                po.getStatus() == OrderStatus.RECEIVED || po.getStatus() == OrderStatus.SHIPPED).count();
        long pendingOrdersCount = purchaseOrders.stream().filter(po ->
                po.getStatus() == OrderStatus.PENDING || po.getStatus() == OrderStatus.APPROVED).count();

        BigDecimal totalRevenueSupplied = purchaseOrders.stream()
                .filter(po -> po.getStatus() != OrderStatus.CANCELLED)
                .map(PurchaseOrderDTO::getTotalAmount)
                .filter(amt -> amt != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double fulfillmentRate = totalOrdersCount > 0 ?
                Math.round((completedOrdersCount * 100.0 / totalOrdersCount) * 10.0) / 10.0 : 100.0;

        // Recent Activity
        PageResponse<StockLogDTO> logs = stockLogService.getAllStockLogs(
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return SupplierDashboardDTO.builder()
                .supplierProfile(profile)
                .suppliedMedicines(suppliedMedicines)
                .purchaseOrders(purchaseOrders)
                .totalSuppliedMedicines(suppliedMedicines.size())
                .totalOrdersCount(totalOrdersCount)
                .completedOrdersCount(completedOrdersCount)
                .pendingOrdersCount(pendingOrdersCount)
                .totalRevenueSupplied(totalRevenueSupplied)
                .fulfillmentRate(fulfillmentRate)
                .recentActivities(logs.getContent())
                .build();
    }

    private SupplierDTO mapSupplierToDTO(Supplier supplier) {
        return SupplierDTO.builder()
                .id(supplier.getId())
                .supplierName(supplier.getSupplierName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .city(supplier.getCity())
                .state(supplier.getState())
                .country(supplier.getCountry())
                .status(supplier.getStatus())
                .createdAt(supplier.getCreatedAt())
                .build();
    }
}
