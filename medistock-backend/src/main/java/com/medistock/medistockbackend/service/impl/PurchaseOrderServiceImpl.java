package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.PurchaseOrder;
import com.medistock.medistockbackend.entity.PurchaseOrderItem;
import com.medistock.medistockbackend.entity.Supplier;
import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.entity.Notification;
import com.medistock.medistockbackend.entity.User;
import com.medistock.medistockbackend.repository.PurchaseOrderRepository;
import com.medistock.medistockbackend.repository.SupplierRepository;
import com.medistock.medistockbackend.repository.MedicineRepository;
import com.medistock.medistockbackend.repository.NotificationRepository;
import com.medistock.medistockbackend.repository.UserRepository;
import com.medistock.medistockbackend.service.PurchaseOrderService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PurchaseOrderServiceImpl implements PurchaseOrderService {
    private final PurchaseOrderRepository repository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public PurchaseOrderServiceImpl(final PurchaseOrderRepository repository,
                                    final SupplierRepository supplierRepository,
                                    final MedicineRepository medicineRepository,
                                    final NotificationRepository notificationRepository,
                                    final UserRepository userRepository) {
        this.repository = repository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<PurchaseOrder> findAll() {
        return repository.findAll();
    }

    @Override
    public PurchaseOrder findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder not found with id: " + id));
    }

    @Override
    public PurchaseOrder save(PurchaseOrder entity) {
        boolean isNew = (entity.getId() == null);

        if (entity.getSupplier() != null && entity.getSupplier().getId() != null) {
            Supplier fullSup = supplierRepository.findById(entity.getSupplier().getId()).orElse(null);
            if (fullSup != null) {
                entity.setSupplier(fullSup);
            }
        }

        if (entity.getItems() != null && !entity.getItems().isEmpty()) {
            for (PurchaseOrderItem item : entity.getItems()) {
                item.setPurchaseOrder(entity);
                if (item.getMedicine() != null && item.getMedicine().getId() != null) {
                    Medicine fullMed = medicineRepository.findById(item.getMedicine().getId()).orElse(null);
                    if (fullMed != null) {
                        item.setMedicine(fullMed);
                        if (item.getPrice() == null || item.getPrice() <= 0) {
                            item.setPrice(fullMed.getPrice() != null ? fullMed.getPrice() : 0.0);
                        }
                    }
                }
            }
        }

        PurchaseOrder saved = repository.save(entity);

        if (isNew && saved.getSupplier() != null) {
            try {
                final Supplier sup = saved.getSupplier();
                final String supEmail = sup.getEmail() != null ? sup.getEmail().trim() : "";
                final String supName = sup.getName() != null ? sup.getName().trim() : "";

                List<User> supplierUsers = userRepository.findAll().stream()
                        .filter(u -> u.getRole() != null &&
                                ("ROLE_SUPPLIER".equalsIgnoreCase(u.getRole().getName()) ||
                                 "SUPPLIER".equalsIgnoreCase(u.getRole().getName())))
                        .toList();

                User supplierUser = supplierUsers.stream()
                        .filter(u -> (!supEmail.isEmpty() && supEmail.equalsIgnoreCase(u.getEmail())) ||
                                     (!supName.isEmpty() && (supName.equalsIgnoreCase(u.getUsername()) || supName.equalsIgnoreCase(u.getEmail()))))
                        .findFirst()
                        .orElseGet(() -> supplierUsers.stream()
                                .filter(u -> !supName.isEmpty() && u.getUsername() != null &&
                                             (u.getUsername().toLowerCase().contains(supName.toLowerCase()) ||
                                              supName.toLowerCase().contains(u.getUsername().toLowerCase())))
                                .findFirst()
                                .orElseGet(() -> supplierUsers.isEmpty() ? null : supplierUsers.get(0)));

                if (supplierUser != null) {
                    double calculatedTotal = saved.getTotalAmount() != null ? saved.getTotalAmount() : 0.0;
                    String totalStr = (calculatedTotal > 0) ? String.format(" (Total: ₹%.2f)", calculatedTotal) : "";

                    Notification n = new Notification();
                    n.setUser(supplierUser);
                    n.setTitle("New Stock Order");
                    n.setType("STOCK_ORDER");
                    n.setMessage("New Stock Order #PO-" + saved.getId() + " received from Admin" + totalStr + ". Please review the requested medicines and quantities.");
                    n.setIsRead(false);
                    n.setTimestamp(java.time.LocalDateTime.now());
                    notificationRepository.save(n);
                }
            } catch (Exception e) {
                // Non-blocking notification creation
            }
        }

        return saved;
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
