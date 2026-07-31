package com.medicalinventory.config;

import com.medicalinventory.entity.*;
import com.medicalinventory.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository       roleRepository;
    private final UserRepository       userRepository;
    private final CategoryRepository   categoryRepository;
    private final SupplierRepository   supplierRepository;
    private final MedicineRepository   medicineRepository;
    private final InventoryRepository  inventoryRepository;
    private final PasswordEncoder      passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, CategoryRepository categoryRepository, SupplierRepository supplierRepository, MedicineRepository medicineRepository, InventoryRepository inventoryRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initRoles();
        initUsers();
        initSampleData();
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            log.info("Seeding system roles...");
            roleRepository.saveAll(List.of(
                    Role.builder().name("ADMIN").description("System Administrator").build(),
                    Role.builder().name("PHARMACIST").description("Licensed Pharmacist").build(),
                    Role.builder().name("INVENTORY_MANAGER").description("Inventory Manager").build(),
                    Role.builder().name("STAFF").description("Hospital / Pharmacy Staff").build()
            ));
        }
    }

    private void initUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding demo users...");
            Role adminRole      = roleRepository.findByName("ADMIN").orElseThrow();
            Role pharmRole      = roleRepository.findByName("PHARMACIST").orElseThrow();
            Role invRole        = roleRepository.findByName("INVENTORY_MANAGER").orElseThrow();

            userRepository.saveAll(List.of(
                    User.builder()
                            .username("admin")
                            .email("admin@medicalinv.com")
                            .password(passwordEncoder.encode("Admin@123"))
                            .role(adminRole)
                            .isActive(true)
                            .build(),
                    User.builder()
                            .username("pharmacist")
                            .email("pharmacist@medicalinv.com")
                            .password(passwordEncoder.encode("Admin@123"))
                            .role(pharmRole)
                            .isActive(true)
                            .build(),
                    User.builder()
                            .username("inventory_mgr")
                            .email("inventory@medicalinv.com")
                            .password(passwordEncoder.encode("Admin@123"))
                            .role(invRole)
                            .isActive(true)
                            .build()
            ));
        }
    }

    private void initSampleData() {
        if (categoryRepository.count() == 0) {
            log.info("Seeding sample categories, suppliers, medicines, and inventory...");

            Category antibiotics  = categoryRepository.save(Category.builder().name("Antibiotics").description("Antibacterial medications").build());
            Category analgesics   = categoryRepository.save(Category.builder().name("Analgesics & Antipyretics").description("Pain relievers and fever reducers").build());
            Category cardiology   = categoryRepository.save(Category.builder().name("Cardiology").description("Heart and cardiovascular medications").build());

            Supplier supplierA = supplierRepository.save(Supplier.builder()
                    .name("Sun Pharma Distributors")
                    .contactPerson("Rajesh Kumar")
                    .phone("+91 9876543210")
                    .email("rajesh@sunpharma.com")
                    .city("Mumbai").state("Maharashtra").isActive(true)
                    .build());

            Supplier supplierB = supplierRepository.save(Supplier.builder()
                    .name("Cipla MedCorp")
                    .contactPerson("Priya Sharma")
                    .phone("+91 9123456789")
                    .email("contact@ciplamed.com")
                    .city("Bengaluru").state("Karnataka").isActive(true)
                    .build());

            Medicine med1 = medicineRepository.save(Medicine.builder()
                    .name("Amoxicillin 500mg")
                    .genericName("Amoxicillin Trihydrate")
                    .brandName("Mox 500")
                    .category(antibiotics)
                    .supplier(supplierA)
                    .unit("Capsules")
                    .unitPrice(new BigDecimal("12.50"))
                    .mrp(new BigDecimal("15.00"))
                    .reorderLevel(100)
                    .status(Medicine.MedicineStatus.ACTIVE)
                    .build());

            inventoryRepository.save(Inventory.builder()
                    .medicine(med1)
                    .quantity(500)
                    .minQuantity(100)
                    .batchNumber("AMX-2024-001")
                    .expiryDate(LocalDate.now().plusDays(180))
                    .location("Shelf A1")
                    .build());

            Medicine med2 = medicineRepository.save(Medicine.builder()
                    .name("Paracetamol 650mg")
                    .genericName("Acetaminophen")
                    .brandName("Dolo 650")
                    .category(analgesics)
                    .supplier(supplierB)
                    .unit("Tablets")
                    .unitPrice(new BigDecimal("2.00"))
                    .mrp(new BigDecimal("3.50"))
                    .reorderLevel(200)
                    .status(Medicine.MedicineStatus.ACTIVE)
                    .build());

            inventoryRepository.save(Inventory.builder()
                    .medicine(med2)
                    .quantity(45)
                    .minQuantity(200)
                    .batchNumber("DOL-2024-088")
                    .expiryDate(LocalDate.now().plusDays(25))
                    .location("Shelf B2")
                    .build());

            Medicine med3 = medicineRepository.save(Medicine.builder()
                    .name("Atorvastatin 10mg")
                    .genericName("Atorvastatin Calcium")
                    .brandName("Lipitor")
                    .category(cardiology)
                    .supplier(supplierA)
                    .unit("Tablets")
                    .unitPrice(new BigDecimal("8.00"))
                    .mrp(new BigDecimal("10.50"))
                    .reorderLevel(50)
                    .status(Medicine.MedicineStatus.ACTIVE)
                    .build());

            inventoryRepository.save(Inventory.builder()
                    .medicine(med3)
                    .quantity(300)
                    .minQuantity(50)
                    .batchNumber("LIP-2024-012")
                    .expiryDate(LocalDate.now().plusDays(365))
                    .location("Shelf C3")
                    .build());
        }
    }
}
