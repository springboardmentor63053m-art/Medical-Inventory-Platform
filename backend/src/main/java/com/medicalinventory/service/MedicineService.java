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

    private final MedicineRepository  medicineRepository;
    private final CategoryRepository  categoryRepository;
    private final SupplierRepository  supplierRepository;
    private final InventoryRepository inventoryRepository;

    public MedicineService(MedicineRepository medicineRepository, CategoryRepository categoryRepository, SupplierRepository supplierRepository, InventoryRepository inventoryRepository) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", id));
    }

    public List<Medicine> searchMedicines(String keyword) {
        return medicineRepository.searchByKeyword(keyword);
    }

    public List<Medicine> getMedicinesByCategory(Long categoryId) {
        return medicineRepository.findByCategoryId(categoryId);
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
    public void deleteMedicine(Long id) {
        Medicine medicine = getMedicineById(id);
        inventoryRepository.findByMedicineId(id).ifPresent(inv -> {
            if (inv.getQuantity() > 0) {
                throw new BadRequestException("Cannot delete medicine with active inventory. Current stock: " + inv.getQuantity());
            }
        });
        medicineRepository.delete(medicine);
        log.info("Deleted medicine id={}", id);
    }
}
