package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.Notification;
import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.entity.User;
import com.medistock.medistockbackend.repository.NotificationRepository;
import com.medistock.medistockbackend.repository.MedicineRepository;
import com.medistock.medistockbackend.repository.InventoryRepository;
import com.medistock.medistockbackend.repository.UserRepository;
import com.medistock.medistockbackend.service.NotificationService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository repository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository repository,
                                   MedicineRepository medicineRepository,
                                   InventoryRepository inventoryRepository,
                                   UserRepository userRepository) {
        this.repository = repository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Notification> findAll() {
        generateAutomaticNotifications();
        return repository.findAll();
    }

    @Override
    public List<Notification> findByUserId(Long userId) {
        generateAutomaticNotifications();
        return repository.findByUserIdOrderByTimestampDesc(userId);
    }

    @Override
    public List<Notification> findByRoleName(String roleName) {
        generateAutomaticNotifications();
        String role = (roleName != null) ? roleName.toUpperCase() : "";

        if (role.contains("PHARMACIST")) {
            return repository.findByUserRoleNameOrderByTimestampDesc("ROLE_PHARMACIST").stream()
                    .filter(n -> n.getType() != null &&
                            ("NEW_ORDER".equalsIgnoreCase(n.getType()) ||
                             "PRESCRIPTION_ORDER".equalsIgnoreCase(n.getType()) ||
                             "ORDER".equalsIgnoreCase(n.getType())))
                    .collect(java.util.stream.Collectors.toList());
        }

        if (role.contains("ADMIN")) {
            return repository.findByUserRoleNameOrderByTimestampDesc("ROLE_ADMIN").stream()
                    .filter(n -> n.getType() != null &&
                            ("LOW_STOCK".equalsIgnoreCase(n.getType()) ||
                             "OUT_OF_STOCK".equalsIgnoreCase(n.getType()) ||
                             "EXPIRED".equalsIgnoreCase(n.getType()) ||
                             "EXPIRY".equalsIgnoreCase(n.getType()) ||
                             "BILL_SUBMITTED".equalsIgnoreCase(n.getType())))
                    .collect(java.util.stream.Collectors.toList());
        }

        if (role.contains("SUPPLIER")) {
            return repository.findByUserRoleNameOrderByTimestampDesc("ROLE_SUPPLIER").stream()
                    .filter(n -> n.getType() != null &&
                            ("STOCK_ORDER".equalsIgnoreCase(n.getType()) ||
                             "PURCHASE_ORDER".equalsIgnoreCase(n.getType())))
                    .collect(java.util.stream.Collectors.toList());
        }

        return repository.findByUserRoleNameOrderByTimestampDesc(roleName);
    }

    private User getAdminUser() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null &&
                        ("ROLE_ADMIN".equalsIgnoreCase(u.getRole().getName()) ||
                         "ADMIN".equalsIgnoreCase(u.getRole().getName())))
                .findFirst()
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
    }

    private User getPharmacistUser() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null &&
                        ("ROLE_PHARMACIST".equalsIgnoreCase(u.getRole().getName()) ||
                         "PHARMACIST".equalsIgnoreCase(u.getRole().getName())))
                .findFirst()
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
    }

    private User getSupplierUser() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null &&
                        ("ROLE_SUPPLIER".equalsIgnoreCase(u.getRole().getName()) ||
                         "SUPPLIER".equalsIgnoreCase(u.getRole().getName())))
                .findFirst()
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
    }

    private void generateAutomaticNotifications() {
        try {
            User adminUser = getAdminUser();
            if (adminUser == null) return;

            List<Notification> existing = repository.findAll();

            // 1. Low stock medicines (Target Admin)
            List<Medicine> lowStock = medicineRepository.findLowStockMedicines();
            for (Medicine med : lowStock) {
                String medName = med.getName();
                boolean exists = existing.stream().anyMatch(n -> n.getMessage() != null && n.getMessage().contains(medName) && "LOW_STOCK".equalsIgnoreCase(n.getType()));
                if (!exists) {
                    Notification n = new Notification();
                    n.setUser(adminUser);
                    n.setTitle("Low Stock Alert");
                    n.setType("LOW_STOCK");
                    int qty = med.getStockQuantity() != null ? med.getStockQuantity() : 0;
                    n.setMessage("Low Stock Alert: " + medName + " stock is below the minimum level. Current quantity: " + qty + ".");
                    n.setIsRead(false);
                    n.setTimestamp(java.time.LocalDateTime.now());
                    repository.save(n);
                }
            }

            // 2. Out of stock medicines (Target Admin)
            List<Medicine> outOfStock = medicineRepository.findOutOfStockMedicines();
            for (Medicine med : outOfStock) {
                String medName = med.getName();
                boolean exists = existing.stream().anyMatch(n -> n.getMessage() != null && n.getMessage().contains(medName) && "OUT_OF_STOCK".equalsIgnoreCase(n.getType()));
                if (!exists) {
                    Notification n = new Notification();
                    n.setUser(adminUser);
                    n.setTitle("Out of Stock");
                    n.setType("OUT_OF_STOCK");
                    n.setMessage(medName + " is currently out of stock.");
                    n.setIsRead(false);
                    n.setTimestamp(java.time.LocalDateTime.now());
                    repository.save(n);
                }
            }

            // 3. Upcoming & Expired expiries (Target Admin)
            java.time.LocalDate today = java.time.LocalDate.now();
            List<com.medistock.medistockbackend.entity.Inventory> expiries = inventoryRepository.findUpcomingExpiries(today.plusYears(5));
            for (com.medistock.medistockbackend.entity.Inventory inv : expiries) {
                if (inv.getMedicine() == null || inv.getExpiryDate() == null) continue;
                String medName = inv.getMedicine().getName();
                boolean isExpired = inv.getExpiryDate().isBefore(today);
                String type = isExpired ? "EXPIRED" : "EXPIRY";
                String title = isExpired ? "Expired Medicine" : "Medicine Expiring Soon";
                String msg = isExpired
                        ? medName + " has already expired."
                        : medName + " expires within 30 days.";

                boolean exists = existing.stream().anyMatch(n -> n.getMessage() != null && n.getMessage().contains(medName) && type.equalsIgnoreCase(n.getType()));
                if (!exists) {
                    Notification n = new Notification();
                    n.setUser(adminUser);
                    n.setTitle(title);
                    n.setType(type);
                    n.setMessage(msg);
                    n.setIsRead(false);
                    n.setTimestamp(java.time.LocalDateTime.now());
                    repository.save(n);
                }
            }
        } catch (Exception e) {
            // Ignore error in automatic generation
        }
    }

    @Override
    public Notification findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }

    @Override
    public Notification save(Notification entity) {
        if (entity.getUser() == null || entity.getUser().getId() == null) {
            String type = (entity.getType() != null) ? entity.getType().toUpperCase() : "";
            if ("LOW_STOCK".equals(type) || "OUT_OF_STOCK".equals(type) ||
                "EXPIRED".equals(type) || "EXPIRY".equals(type) ||
                "BILL_SUBMITTED".equals(type)) {
                entity.setUser(getAdminUser());
            } else if ("STOCK_ORDER".equals(type) || "PURCHASE_ORDER".equals(type)) {
                entity.setUser(getSupplierUser());
            } else {
                entity.setUser(getPharmacistUser());
            }
        }
        if (entity.getTimestamp() == null) {
            entity.setTimestamp(java.time.LocalDateTime.now());
        }
        if (entity.getIsRead() == null) {
            entity.setIsRead(false);
        }
        return repository.save(entity);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Notification markAsRead(Long id) {
        Notification notification = findById(id);
        notification.setIsRead(true);
        return repository.save(notification);
    }
}
