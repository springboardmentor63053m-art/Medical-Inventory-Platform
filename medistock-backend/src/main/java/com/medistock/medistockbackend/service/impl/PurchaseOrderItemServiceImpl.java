package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.PurchaseOrderItem;
import com.medistock.medistockbackend.entity.PurchaseOrder;
import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.entity.Supplier;
import com.medistock.medistockbackend.entity.Inventory;
import com.medistock.medistockbackend.entity.StockLog;
import com.medistock.medistockbackend.entity.User;
import com.medistock.medistockbackend.repository.PurchaseOrderItemRepository;
import com.medistock.medistockbackend.repository.PurchaseOrderRepository;
import com.medistock.medistockbackend.repository.MedicineRepository;
import com.medistock.medistockbackend.repository.SupplierRepository;
import com.medistock.medistockbackend.repository.InventoryRepository;
import com.medistock.medistockbackend.repository.StockLogRepository;
import com.medistock.medistockbackend.repository.UserRepository;
import com.medistock.medistockbackend.service.PurchaseOrderItemService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderItemServiceImpl implements PurchaseOrderItemService {

    private final PurchaseOrderItemRepository repository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final StockLogRepository stockLogRepository;
    private final UserRepository userRepository;

    public PurchaseOrderItemServiceImpl(PurchaseOrderItemRepository repository,
                                       PurchaseOrderRepository purchaseOrderRepository,
                                       MedicineRepository medicineRepository,
                                       SupplierRepository supplierRepository,
                                       InventoryRepository inventoryRepository,
                                       StockLogRepository stockLogRepository,
                                       UserRepository userRepository) {
        this.repository = repository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.medicineRepository = medicineRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockLogRepository = stockLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<PurchaseOrderItem> findAll() {
        return repository.findAll();
    }

    @Override
    public PurchaseOrderItem findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrderItem not found with id: " + id));
    }

    @Override
    public PurchaseOrderItem save(PurchaseOrderItem entity) {
        // Resolve Medicine
        if (entity.getMedicine() != null && entity.getMedicine().getId() != null) {
            Medicine med = medicineRepository.findById(entity.getMedicine().getId()).orElse(null);
            if (med != null) {
                entity.setMedicine(med);
            }
        }

        // Resolve or create PurchaseOrder
        if (entity.getPurchaseOrder() == null || entity.getPurchaseOrder().getId() == null) {
            Supplier supplier = null;
            if (entity.getMedicine() != null && entity.getMedicine().getSupplier() != null) {
                supplier = entity.getMedicine().getSupplier();
            }
            if (supplier == null) {
                supplier = supplierRepository.findAll().stream().findFirst().orElse(null);
            }
            if (supplier != null) {
                PurchaseOrder po = new PurchaseOrder();
                po.setSupplier(supplier);
                po.setStatus("COMPLETED");
                po.setOrderDate(LocalDateTime.now());
                po = purchaseOrderRepository.save(po);
                entity.setPurchaseOrder(po);
            }
        } else {
            PurchaseOrder po = purchaseOrderRepository.findById(entity.getPurchaseOrder().getId()).orElse(null);
            if (po != null) {
                entity.setPurchaseOrder(po);
            }
        }

        boolean isNew = (entity.getId() == null);
        PurchaseOrderItem savedItem = repository.save(entity);

        // Synchronize inventory quantity and stock log when a new purchase item is added
        if (isNew && savedItem.getMedicine() != null && savedItem.getQuantity() != null && savedItem.getQuantity() > 0) {
            Medicine med = savedItem.getMedicine();
            int addQty = savedItem.getQuantity();

            List<Inventory> inventories = inventoryRepository.findAll().stream()
                    .filter(inv -> inv.getMedicine() != null && inv.getMedicine().getId().equals(med.getId()))
                    .collect(Collectors.toList());

            if (!inventories.isEmpty()) {
                Inventory activeInv = inventories.get(0);
                activeInv.setQuantity((activeInv.getQuantity() != null ? activeInv.getQuantity() : 0) + addQty);
                inventoryRepository.save(activeInv);
            } else {
                Inventory newInv = new Inventory();
                newInv.setMedicine(med);
                newInv.setBatchNumber("BATCH-" + (System.currentTimeMillis() % 10000));
                newInv.setQuantity(addQty);
                newInv.setMinimumStock(10);
                newInv.setExpiryDate(java.time.LocalDate.now().plusYears(2));
                inventoryRepository.save(newInv);
            }

            try {
                User user = userRepository.findAll().stream().findFirst().orElse(null);
                if (user != null) {
                    StockLog log = new StockLog();
                    log.setMedicine(med);
                    log.setUser(user);
                    log.setAction("STOCK_IN");
                    log.setQuantity(addQty);
                    log.setTimestamp(LocalDateTime.now());
                    stockLogRepository.save(log);
                }
            } catch (Exception e) {
                // Ignore stock log exception
            }
        }

        return savedItem;
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
