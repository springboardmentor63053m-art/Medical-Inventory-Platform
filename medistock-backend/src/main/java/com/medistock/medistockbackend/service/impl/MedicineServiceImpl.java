package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.entity.Inventory;
import com.medistock.medistockbackend.repository.MedicineRepository;
import com.medistock.medistockbackend.service.MedicineService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.medistock.medistockbackend.entity.Notification;
import com.medistock.medistockbackend.entity.User;
import com.medistock.medistockbackend.repository.NotificationRepository;
import com.medistock.medistockbackend.repository.UserRepository;

@Service
public class MedicineServiceImpl implements MedicineService {
    private final MedicineRepository repository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public MedicineServiceImpl(final MedicineRepository repository,
                               final NotificationRepository notificationRepository,
                               final UserRepository userRepository) {
        this.repository = repository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private void checkAndTriggerLowStockNotification(Medicine medicine) {
        if (medicine == null) return;
        int qty = medicine.getStockQuantity() != null ? medicine.getStockQuantity() : 0;
        int minStock = 10;
        if (medicine.getInventories() != null && !medicine.getInventories().isEmpty()) {
            minStock = medicine.getInventories().stream()
                    .filter(i -> i != null && i.getMinimumStock() != null)
                    .mapToInt(Inventory::getMinimumStock)
                    .max()
                    .orElse(10);
        }

        if (qty > 0 && qty <= minStock) {
            String medName = medicine.getName();
            try {
                List<Notification> existing = notificationRepository.findAll();
                boolean exists = existing.stream().anyMatch(n ->
                    n.getMessage() != null && n.getMessage().contains(medName) &&
                    "LOW_STOCK".equalsIgnoreCase(n.getType()) &&
                    (n.getIsRead() == null || !n.getIsRead())
                );

                if (!exists) {
                    User adminUser = userRepository.findAll().stream()
                            .filter(u -> u.getRole() != null &&
                                    ("ROLE_ADMIN".equalsIgnoreCase(u.getRole().getName()) ||
                                     "ADMIN".equalsIgnoreCase(u.getRole().getName())))
                            .findFirst()
                            .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

                    if (adminUser != null) {
                        Notification n = new Notification();
                        n.setUser(adminUser);
                        n.setTitle("Low Stock Alert");
                        n.setType("LOW_STOCK");
                        n.setMessage("Low Stock Alert: " + medName + " stock is below the minimum level. Current quantity: " + qty + ".");
                        n.setIsRead(false);
                        n.setTimestamp(java.time.LocalDateTime.now());
                        notificationRepository.save(n);
                    }
                }
            } catch (Exception e) {
                // Non-blocking notification creation
            }
        }
    }

    private void populateCalculatedStock(Medicine medicine) {
        if (medicine == null) return;
        int qty = 0;
        if (medicine.getInventories() != null && !medicine.getInventories().isEmpty()) {
            Map<String, Inventory> distinctBatches = new LinkedHashMap<>();
            for (Inventory inv : medicine.getInventories()) {
                if (inv != null) {
                    String batchKey = inv.getBatchNumber() != null && !inv.getBatchNumber().trim().isEmpty()
                            ? inv.getBatchNumber().trim()
                            : ("inv_" + inv.getId());
                    if (!distinctBatches.containsKey(batchKey)) {
                        distinctBatches.put(batchKey, inv);
                    }
                }
            }
            qty = distinctBatches.values().stream()
                    .mapToInt(inv -> inv.getQuantity() != null ? inv.getQuantity() : 0)
                    .sum();
        } else if (medicine.getStockQuantity() != null) {
            qty = medicine.getStockQuantity();
        }
        medicine.setStockQuantity(qty);
    }

    @Override
    public List<Medicine> findAll() {
        List<Medicine> list = repository.findAll();
        list.forEach(this::populateCalculatedStock);
        return list;
    }

    @Override
    public Medicine findById(Long id) {
        Medicine medicine = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        populateCalculatedStock(medicine);
        return medicine;
    }

    @Override
    public Medicine save(Medicine entity) {
        Medicine saved = repository.save(entity);
        populateCalculatedStock(saved);
        checkAndTriggerLowStockNotification(saved);
        return saved;
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Medicine> searchByName(String name) {
        List<Medicine> list = repository.findByNameContainingIgnoreCase(name);
        list.forEach(this::populateCalculatedStock);
        return list;
    }

    @Override
    public List<Medicine> findByCategory(String category) {
        List<Medicine> list = repository.findByCategoryIgnoreCase(category);
        list.forEach(this::populateCalculatedStock);
        return list;
    }

    @Override
    public List<Medicine> findBySupplier(Long supplierId) {
        List<Medicine> list = repository.findBySupplierId(supplierId);
        list.forEach(this::populateCalculatedStock);
        return list;
    }

    @Override
    public List<Medicine> filterByStockStatus(String status) {
        List<Medicine> list;
        if ("available".equalsIgnoreCase(status)) {
            list = repository.findAvailableMedicines();
        } else if ("low".equalsIgnoreCase(status) || "low stock".equalsIgnoreCase(status) || "low_stock".equalsIgnoreCase(status)) {
            list = repository.findLowStockMedicines();
        } else if ("out".equalsIgnoreCase(status) || "out of stock".equalsIgnoreCase(status) || "out_of_stock".equalsIgnoreCase(status) || "outofstock".equalsIgnoreCase(status)) {
            list = repository.findOutOfStockMedicines();
        } else {
            list = java.util.Collections.emptyList();
        }
        list.forEach(this::populateCalculatedStock);
        return list;
    }
}
