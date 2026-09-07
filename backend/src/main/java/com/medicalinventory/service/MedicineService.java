package com.medicalinventory.service;

import com.medicalinventory.entity.*;
import com.medicalinventory.exception.*;
import com.medicalinventory.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicineService {

    private static final Logger log = LoggerFactory.getLogger(MedicineService.class);

    private final MedicineRepository       medicineRepository;
    private final CategoryRepository       categoryRepository;
    private final SupplierRepository       supplierRepository;
    private final InventoryRepository      inventoryRepository;
    private final StockMovementRepository  stockMovementRepository;
    private final AlertRepository          alertRepository;
    private final PurchaseItemRepository   purchaseItemRepository;
    private final SaleItemRepository       saleItemRepository;

    public MedicineService(MedicineRepository medicineRepository, CategoryRepository categoryRepository,
                           SupplierRepository supplierRepository, InventoryRepository inventoryRepository,
                           StockMovementRepository stockMovementRepository, AlertRepository alertRepository,
                           PurchaseItemRepository purchaseItemRepository, SaleItemRepository saleItemRepository) {
        this.medicineRepository      = medicineRepository;
        this.categoryRepository      = categoryRepository;
        this.supplierRepository      = supplierRepository;
        this.inventoryRepository     = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.alertRepository         = alertRepository;
        this.purchaseItemRepository  = purchaseItemRepository;
        this.saleItemRepository      = saleItemRepository;
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", id));
    }

    public List<Medicine> searchMedicines(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllMedicines();
        }
        String clean = keyword.trim().replace("#", "");
        try {
            Long id = Long.parseLong(clean);
            return medicineRepository.findById(id)
                    .map(List::of)
                    .orElseGet(List::of);
        } catch (NumberFormatException e) {
            return medicineRepository.searchByText(clean);
        }
    }

    public List<Medicine> getMedicinesByCategory(Long categoryId) {
        return medicineRepository.findByCategoryId(categoryId);
    }

    public List<Medicine> getMedicinesBySupplier(Long supplierId) {
        return medicineRepository.findBySupplierId(supplierId);
    }

    @Transactional
    public Medicine createMedicine(Medicine medicine) {
        Category category = categoryRepository.findById(medicine.getCategory().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", medicine.getCategory().getId()));
        medicine.setCategory(category);

        if (medicine.getSupplier() != null && medicine.getSupplier().getId() != null) {
            Supplier supplier = supplierRepository.findById(medicine.getSupplier().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", medicine.getSupplier().getId()));
            medicine.setSupplier(supplier);
        }

        Medicine saved = medicineRepository.save(medicine);

        Inventory inventory = Inventory.builder()
                .medicine(saved)
                .quantity(0)
                .minQuantity(saved.getReorderLevel())
                .build();
        inventoryRepository.save(inventory);

        log.info("Created medicine: {} (id={})", saved.getName(), saved.getId());
        return saved;
    }

    @Transactional
    public Medicine updateMedicine(Long id, Medicine updated) {
        Medicine existing = getMedicineById(id);

        Category category = categoryRepository.findById(updated.getCategory().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", updated.getCategory().getId()));

        existing.setName(updated.getName());
        existing.setGenericName(updated.getGenericName());
        existing.setBrandName(updated.getBrandName());
        existing.setCategory(category);
        existing.setUnit(updated.getUnit());
        existing.setHsnCode(updated.getHsnCode());
        existing.setDescription(updated.getDescription());
        existing.setUnitPrice(updated.getUnitPrice());
        existing.setMrp(updated.getMrp());
        existing.setReorderLevel(updated.getReorderLevel());
        existing.setStatus(updated.getStatus());

        if (updated.getSupplier() != null && updated.getSupplier().getId() != null) {
            Supplier supplier = supplierRepository.findById(updated.getSupplier().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", updated.getSupplier().getId()));
            existing.setSupplier(supplier);
        }

        return medicineRepository.save(existing);
    }

    @Transactional
    public Medicine linkSupplier(Long medicineId, Long supplierId) {
        Medicine medicine = getMedicineById(medicineId);
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", supplierId));
        medicine.setSupplier(supplier);
        log.info("Linked medicine {} with supplier {}", medicine.getName(), supplier.getName());
        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine unlinkSupplier(Long medicineId) {
        Medicine medicine = getMedicineById(medicineId);
        medicine.setSupplier(null);
        log.info("Unlinked supplier from medicine {}", medicine.getName());
        return medicineRepository.save(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = getMedicineById(id);
        // 1. Delete associated alerts
        alertRepository.deleteByMedicineId(id);
        // 2. Delete stock movements
        stockMovementRepository.deleteByMedicineId(id);
        // 3. Delete purchase items referencing this medicine
        purchaseItemRepository.deleteByMedicineId(id);
        // 4. Delete sale items referencing this medicine
        saleItemRepository.deleteByMedicineId(id);
        // 5. Delete inventory record
        inventoryRepository.findByMedicineId(id).ifPresent(inventoryRepository::delete);
        // 6. Delete the medicine
        medicineRepository.delete(medicine);
        log.info("Deleted medicine id={}", id);
    }
}
