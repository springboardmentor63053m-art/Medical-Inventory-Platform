package com.medistock.medistockbackend.config;

import com.medistock.medistockbackend.entity.AccountStatus;
import com.medistock.medistockbackend.entity.Inventory;
import com.medistock.medistockbackend.entity.Medicine;
import com.medistock.medistockbackend.entity.Role;
import com.medistock.medistockbackend.entity.User;
import com.medistock.medistockbackend.repository.InventoryRepository;
import com.medistock.medistockbackend.repository.MedicineRepository;
import com.medistock.medistockbackend.repository.RoleRepository;
import com.medistock.medistockbackend.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            MedicineRepository medicineRepository,
            InventoryRepository inventoryRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // =====================================================
            // CREATE ROLES
            // =====================================================

            Role adminRole = createRoleIfNotExists(
                    roleRepository,
                    "ROLE_ADMIN"
            );

            Role userRole = createRoleIfNotExists(
                    roleRepository,
                    "ROLE_USER"
            );

            Role pharmacistRole = createRoleIfNotExists(
                    roleRepository,
                    "ROLE_PHARMACIST"
            );

            Role supplierRole = createRoleIfNotExists(
                    roleRepository,
                    "ROLE_SUPPLIER"
            );


            // =====================================================
            // CREATE / UPDATE ADMIN
            // =====================================================

            createOrUpdateUser(
                    userRepository,
                    passwordEncoder,
                    "nithya",
                    "nithya@medistock.com",
                    "Admin@123",
                    adminRole
            );


            // =====================================================
            // CREATE / UPDATE NORMAL USER
            // =====================================================

            createOrUpdateUser(
                    userRepository,
                    passwordEncoder,
                    "arun",
                    "arun@medistock.com",
                    "User@123",
                    userRole
            );


            // =====================================================
            // CREATE / UPDATE PHARMACIST
            // =====================================================

            createOrUpdateUser(
                    userRepository,
                    passwordEncoder,
                    "priya",
                    "priya@medistock.com",
                    "Pharma@123",
                    pharmacistRole
            );


            // =====================================================
            // CREATE / UPDATE SUPPLIER
            // =====================================================

            createOrUpdateUser(
                    userRepository,
                    passwordEncoder,
                    "rahul",
                    "rahul@medistock.com",
                    "Supplier@123",
                    supplierRole
            );


            // =====================================================
            // CREATE INVENTORY DATA
            // =====================================================

            createInventoryData(
                    medicineRepository,
                    inventoryRepository
            );


            // =====================================================
            // DISPLAY LOGIN ACCOUNTS
            // =====================================================

            System.out.println();
            System.out.println("==============================================");
            System.out.println("       MEDISTOCK LOGIN ACCOUNTS");
            System.out.println("==============================================");

            System.out.println(
                    "ADMIN      : nithya / Admin@123"
            );

            System.out.println(
                    "USER       : arun / User@123"
            );

            System.out.println(
                    "PHARMACIST : priya / Pharma@123"
            );

            System.out.println(
                    "SUPPLIER   : rahul / Supplier@123"
            );

            System.out.println("==============================================");
            System.out.println();

            System.out.println("==============================================");
            System.out.println("       MEDISTOCK INVENTORY INITIALIZED");
            System.out.println("==============================================");

            System.out.println(
                    "Total inventory records: "
                    + inventoryRepository.count()
            );

            System.out.println("==============================================");
            System.out.println();
        };
    }


    // =============================================================
    // CREATE ROLE IF IT DOES NOT EXIST
    // =============================================================

    private Role createRoleIfNotExists(
            RoleRepository roleRepository,
            String roleName) {

        return roleRepository
                .findByName(roleName)
                .orElseGet(() -> {

                    Role role = new Role();

                    role.setName(roleName);

                    return roleRepository.save(role);
                });
    }


    // =============================================================
    // CREATE OR UPDATE USER
    // =============================================================

    private void createOrUpdateUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String username,
            String email,
            String password,
            Role role) {

        User user = userRepository
                .findByUsername(username)
                .orElse(null);


        // ---------------------------------------------------------
        // USER DOES NOT EXIST
        // ---------------------------------------------------------

        if (user == null) {

            user = new User();

            user.setUsername(username);

            user.setEmail(email);

            user.setPassword(
                    passwordEncoder.encode(password)
            );

            user.setRole(role);

            user.setAccountStatus(
                    AccountStatus.APPROVED
            );

            userRepository.save(user);

            System.out.println(
                    "Created account: " + username
            );

            return;
        }


        // ---------------------------------------------------------
        // USER ALREADY EXISTS
        // ---------------------------------------------------------

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(password)
        );

        user.setRole(role);

        user.setAccountStatus(
                AccountStatus.APPROVED
        );

        userRepository.save(user);

        System.out.println(
                "Updated account: " + username
        );
    }


    // =============================================================
    // CREATE INVENTORY DATA
    // =============================================================

    private void createInventoryData(
            MedicineRepository medicineRepository,
            InventoryRepository inventoryRepository) {

        System.out.println();
        System.out.println("----------------------------------------------");
        System.out.println("Creating MediStock inventory data...");
        System.out.println("----------------------------------------------");


        // ---------------------------------------------------------
        // 1. METFORMIN
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Metformin",
                "MED-MET-001",
                60,
                LocalDate.of(2028, 1, 31)
        );


        // ---------------------------------------------------------
        // 2. AMLODIPINE
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Amlodipine",
                "MED-AML-001",
                45,
                LocalDate.of(2027, 8, 31)
        );


        // ---------------------------------------------------------
        // 3. VITAMIN C
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Vitamin C",
                "MED-VIT-001",
                200,
                LocalDate.of(2028, 6, 30)
        );


        // ---------------------------------------------------------
        // 4. IBUPROFEN
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Ibuprofen",
                "MED-IBU-001",
                80,
                LocalDate.of(2027, 10, 31)
        );


        // ---------------------------------------------------------
        // 5. AZITHROMYCIN
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Azithromycin",
                "MED-AZI-001",
                50,
                LocalDate.of(2027, 7, 31)
        );


        // ---------------------------------------------------------
        // 6. OMEPRAZOLE
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Omeprazole",
                "MED-OME-001",
                110,
                LocalDate.of(2028, 2, 29)
        );


        // ---------------------------------------------------------
        // 7. PARACETAMOL
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Paracetamol",
                "MED-PAR-001",
                150,
                LocalDate.of(2027, 12, 31)
        );


        // ---------------------------------------------------------
        // 8. CETIRIZINE
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Cetirizine",
                "MED-CET-001",
                15,
                LocalDate.of(2027, 9, 30)
        );


        // ---------------------------------------------------------
        // 9. LOSARTAN
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Losartan",
                "MED-LOS-001",
                10,
                LocalDate.of(2027, 11, 30)
        );


        // ---------------------------------------------------------
        // 10. ASPIRIN
        // ---------------------------------------------------------

        createInventoryIfNeeded(
                medicineRepository,
                inventoryRepository,
                "Aspirin",
                "MED-ASP-001",
                0,
                LocalDate.of(2027, 6, 30)
        );


        System.out.println("----------------------------------------------");
        System.out.println("Inventory initialization completed.");
        System.out.println("----------------------------------------------");
    }


    // =============================================================
    // CREATE SINGLE INVENTORY RECORD
    // =============================================================

    private void createInventoryIfNeeded(
            MedicineRepository medicineRepository,
            InventoryRepository inventoryRepository,
            String medicineName,
            String batchNumber,
            int quantity,
            LocalDate expiryDate) {


        // ---------------------------------------------------------
        // FIND MEDICINE
        // ---------------------------------------------------------

        Optional<Medicine> medicineOptional =
                medicineRepository
                        .findByNameContainingIgnoreCase(medicineName)
                        .stream()
                        .findFirst();


        // ---------------------------------------------------------
        // MEDICINE NOT FOUND
        // ---------------------------------------------------------

        if (medicineOptional.isEmpty()) {

            System.out.println(
                    "Medicine not found: "
                            + medicineName
                            + " - inventory skipped."
            );

            return;
        }


        Medicine medicine = medicineOptional.get();


        // ---------------------------------------------------------
        // CHECK IF INVENTORY ALREADY EXISTS
        // ---------------------------------------------------------

        boolean alreadyExists =
                inventoryRepository
                        .findAll()
                        .stream()
                        .anyMatch(inventory ->
                                inventory.getMedicine() != null
                                        &&
                                inventory.getMedicine()
                                        .getId()
                                        .equals(medicine.getId())
                        );


        if (alreadyExists) {

            System.out.println(
                    "Inventory already exists for: "
                            + medicine.getName()
            );

            return;
        }


        // ---------------------------------------------------------
        // CREATE INVENTORY
        // ---------------------------------------------------------

        Inventory inventory = new Inventory();


        // Link inventory to medicine
        inventory.setMedicine(medicine);


        // Batch
        inventory.setBatchNumber(batchNumber);


        // Quantity
        inventory.setQuantity(quantity);


        // Expiry
        inventory.setExpiryDate(expiryDate);


        // ---------------------------------------------------------
        // SAVE
        // ---------------------------------------------------------

        inventoryRepository.save(inventory);


        System.out.println(
                "Created inventory: "
                        + medicine.getName()
                        + " | "
                        + batchNumber
                        + " | Qty: "
                        + quantity
                        + " | Expiry: "
                        + expiryDate
        );
    }
}