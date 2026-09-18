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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository          roleRepository;
    private final UserRepository          userRepository;
    private final EmployeeRepository      employeeRepository;
    private final CategoryRepository      categoryRepository;
    private final SupplierRepository      supplierRepository;
    private final MedicineRepository      medicineRepository;
    private final InventoryRepository     inventoryRepository;
    private final PurchaseRepository      purchaseRepository;
    private final SaleRepository          saleRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AlertRepository         alertRepository;
    private final PatientRepository       patientRepository;
    private final DoctorRepository        doctorRepository;
    private final PrescriptionRepository  prescriptionRepository;
    private final AuditLogRepository      auditLogRepository;
    private final PasswordEncoder         passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository,
                           EmployeeRepository employeeRepository, CategoryRepository categoryRepository,
                           SupplierRepository supplierRepository, MedicineRepository medicineRepository,
                           InventoryRepository inventoryRepository, PurchaseRepository purchaseRepository,
                           SaleRepository saleRepository, StockMovementRepository stockMovementRepository,
                           AlertRepository alertRepository, PatientRepository patientRepository,
                           DoctorRepository doctorRepository, PrescriptionRepository prescriptionRepository,
                           AuditLogRepository auditLogRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository          = roleRepository;
        this.userRepository          = userRepository;
        this.employeeRepository      = employeeRepository;
        this.categoryRepository      = categoryRepository;
        this.supplierRepository      = supplierRepository;
        this.medicineRepository      = medicineRepository;
        this.inventoryRepository     = inventoryRepository;
        this.purchaseRepository      = purchaseRepository;
        this.saleRepository          = saleRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.alertRepository         = alertRepository;
        this.patientRepository       = patientRepository;
        this.doctorRepository        = doctorRepository;
        this.prescriptionRepository  = prescriptionRepository;
        this.auditLogRepository      = auditLogRepository;
        this.passwordEncoder         = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initRoles();
        initUsers();
        initEmployees();
        initSampleData();
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            log.info("Seeding roles...");
            roleRepository.saveAll(List.of(
                    Role.builder().name("ADMIN").description("Full system access — User management, all modules, configuration").build(),
                    Role.builder().name("PHARMACIST").description("Medicine dispensing, sales, stock lookup").build(),
                    Role.builder().name("INVENTORY_MANAGER").description("Procurement, supplier management, stock control").build(),
                    Role.builder().name("STAFF").description("Read-only access to inventory and dashboard").build(),
                    Role.builder().name("SUPPLIER").description("Supplier profile & catalog management").build()
            ));
        } else if (roleRepository.findByName("SUPPLIER").isEmpty()) {
            log.info("Seeding SUPPLIER role...");
            roleRepository.save(Role.builder().name("SUPPLIER").description("Supplier profile & catalog management").build());
        }
    }

    private void initUsers() {
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        Role pharmRole = roleRepository.findByName("PHARMACIST").orElseThrow();
        Role invRole   = roleRepository.findByName("INVENTORY_MANAGER").orElseThrow();
        Role staffRole = roleRepository.findByName("STAFF").orElseThrow();
        Role suppRole  = roleRepository.findByName("SUPPLIER").orElse(null);
        if (suppRole == null) {
            suppRole = roleRepository.save(Role.builder().name("SUPPLIER").description("Supplier profile & catalog management").build());
        }

        // Helper to ensure user exists and password is set
        List<User> demoUsers = List.of(
                User.builder().username("admin").email("admin@medicalinv.com")
                        .password(passwordEncoder.encode("Admin@123")).role(adminRole).isActive(true).build(),
                User.builder().username("pavan").email("pavan@gmail.com")
                        .password(passwordEncoder.encode("Admin@123")).role(adminRole).isActive(true).build(),
                User.builder().username("dr_patel").email("patel@medicalinv.com")
                        .password(passwordEncoder.encode("Admin@123")).role(staffRole).isActive(true).build(),
                User.builder().username("ravi_inventory").email("ravi_inventory@medicalinv.com")
                        .password(passwordEncoder.encode("Admin@123")).role(invRole).isActive(true).build(),
                User.builder().username("ravi_inv").email("ravi@medicalinv.com")
                        .password(passwordEncoder.encode("Admin@123")).role(invRole).isActive(true).build(),
                User.builder().username("priya_staff").email("priya@medicalinv.com")
                        .password(passwordEncoder.encode("Admin@123")).role(staffRole).isActive(true).build(),
                User.builder().username("sneha_pharmacist").email("sneha_pharmacist@medicalinv.com")
                        .password(passwordEncoder.encode("Admin@123")).role(pharmRole).isActive(true).build(),
                User.builder().username("sneha_ph").email("sneha@medicalinv.com")
                        .password(passwordEncoder.encode("Admin@123")).role(pharmRole).isActive(true).build(),
                User.builder().username("supplier_cipla").email("contact@cipla.com")
                        .password(passwordEncoder.encode("Admin@123")).role(suppRole).isActive(true).build(),
                User.builder().username("supplier_main").email("supplier@medicalinv.com")
                        .password(passwordEncoder.encode("Admin@123")).role(suppRole).isActive(true).build()
        );

        for (User u : demoUsers) {
            if (userRepository.findByEmail(u.getEmail()).isEmpty() && userRepository.findByUsername(u.getUsername()).isEmpty()) {
                userRepository.save(u);
            } else {
                userRepository.findByEmail(u.getEmail()).ifPresent(existing -> {
                    existing.setPassword(passwordEncoder.encode("Admin@123"));
                    existing.setIsActive(true);
                    userRepository.save(existing);
                });
            }
        }
        log.info("Initialized and verified all 5 demo role users.");
    }

    private void initEmployees() {
        if (employeeRepository.count() > 0) return;
        log.info("Seeding employees...");
        User u1 = userRepository.findByUsername("admin").orElse(null);
        User u2 = userRepository.findByUsername("dr_patel").orElse(null);
        User u3 = userRepository.findByUsername("ravi_inv").orElse(null);
        User u4 = userRepository.findByUsername("priya_staff").orElse(null);
        User u5 = userRepository.findByUsername("sneha_ph").orElse(null);

        employeeRepository.saveAll(List.of(
                Employee.builder().user(u1).firstName("Arjun").lastName("Sharma")
                        .email("admin@medicalinv.com").phone("9876543210")
                        .department("Administration").designation("System Administrator")
                        .dateOfJoining(LocalDate.of(2022, 1, 15)).status(Employee.EmployeeStatus.ACTIVE).build(),
                Employee.builder().user(u2).firstName("Rajesh").lastName("Patel")
                        .email("patel@medicalinv.com").phone("9876543211")
                        .department("Pharmacy").designation("Senior Pharmacist")
                        .dateOfJoining(LocalDate.of(2022, 3, 1)).status(Employee.EmployeeStatus.ACTIVE).build(),
                Employee.builder().user(u3).firstName("Ravi").lastName("Kumar")
                        .email("ravi@medicalinv.com").phone("9876543212")
                        .department("Inventory").designation("Inventory Manager")
                        .dateOfJoining(LocalDate.of(2022, 6, 10)).status(Employee.EmployeeStatus.ACTIVE).build(),
                Employee.builder().user(u4).firstName("Priya").lastName("Nair")
                        .email("priya@medicalinv.com").phone("9876543213")
                        .department("General").designation("Administrative Staff")
                        .dateOfJoining(LocalDate.of(2023, 2, 20)).status(Employee.EmployeeStatus.ACTIVE).build(),
                Employee.builder().user(u5).firstName("Sneha").lastName("Reddy")
                        .email("sneha@medicalinv.com").phone("9876543214")
                        .department("Pharmacy").designation("Junior Pharmacist")
                        .dateOfJoining(LocalDate.of(2023, 7, 1)).status(Employee.EmployeeStatus.ACTIVE).build()
        ));
    }

    private void initSampleData() {

        // ── 10 Categories ─────────────────────────────────────────────────
        if (categoryRepository.count() == 0) {
            log.info("Seeding 10 categories...");
            categoryRepository.saveAll(List.of(
                    Category.builder().name("Antibiotics").description("Medicines that fight bacterial infections").build(),
                    Category.builder().name("Analgesics").description("Pain-relief medicines").build(),
                    Category.builder().name("Antipyretics").description("Fever-reducing medicines").build(),
                    Category.builder().name("Antacids").description("Medicines for acidity and gastric relief").build(),
                    Category.builder().name("Vitamins & Minerals").description("Dietary supplements and vitamins").build(),
                    Category.builder().name("Antidiabetics").description("Medicines for diabetes management").build(),
                    Category.builder().name("Antihypertensives").description("Medicines for blood pressure management").build(),
                    Category.builder().name("Antihistamines").description("Medicines for allergies").build(),
                    Category.builder().name("Penicillin Group").description("Penicillin-based antibiotics").build(),
                    Category.builder().name("NSAIDs").description("Non-Steroidal Anti-Inflammatory Drugs").build()
            ));
        }

        // ── 10 Suppliers ──────────────────────────────────────────────────
        if (supplierRepository.count() == 0) {
            log.info("Seeding 10 suppliers...");
            supplierRepository.saveAll(List.of(
                    Supplier.builder().name("Sun Pharma Distributors").contactPerson("Rajesh Kumar")
                            .phone("+91 9876543210").email("rajesh@sunpharma.com")
                            .address("Plot 12, MIDC Industrial Area").city("Mumbai").state("Maharashtra")
                            .pincode("400093").gstNumber("27AABCS1234A1Z5").licenseNumber("MH-DL-2021-001").isActive(true).build(),
                    Supplier.builder().name("Cipla MedCorp").contactPerson("Priya Sharma")
                            .phone("+91 9123456789").email("contact@ciplamed.com")
                            .address("22, Hosur Road, Electronic City").city("Bengaluru").state("Karnataka")
                            .pincode("560100").gstNumber("29AABCC5678B1Z3").licenseNumber("KA-DL-2020-045").isActive(true).build(),
                    Supplier.builder().name("Dr. Reddy's Pharma Supply").contactPerson("Venkat Reddy")
                            .phone("+91 9988776655").email("venkat@drreddys.com")
                            .address("8-2-337, Road No. 3, Banjara Hills").city("Hyderabad").state("Telangana")
                            .pincode("500034").gstNumber("36AAACR4567C1Z1").licenseNumber("TS-DL-2019-088").isActive(true).build(),
                    Supplier.builder().name("Mankind Pharma Ltd").contactPerson("Suresh Patel")
                            .phone("+91 9811223344").email("suresh@mankind.in")
                            .address("A-35, Sector 60, Noida").city("Noida").state("Uttar Pradesh")
                            .pincode("201301").gstNumber("09AAAIM3456D1Z2").licenseNumber("UP-DL-2022-012").isActive(true).build(),
                    Supplier.builder().name("Lupin Healthcare Distributors").contactPerson("Meena Joshi")
                            .phone("+91 9765432100").email("meena@lupinhc.com")
                            .address("Kalpataru Point, Sion-Trombay Road").city("Mumbai").state("Maharashtra")
                            .pincode("400071").gstNumber("27AAACL5678E1Z4").licenseNumber("MH-DL-2020-078").isActive(true).build(),
                    Supplier.builder().name("Alkem Laboratories").contactPerson("Amit Singhania")
                            .phone("+91 9654321098").email("amit@alkem.com")
                            .address("Devashish, Premises Co-op Society, Andheri East").city("Mumbai").state("Maharashtra")
                            .pincode("400059").gstNumber("27AAACA6789F1Z6").licenseNumber("MH-DL-2021-033").isActive(true).build(),
                    Supplier.builder().name("Abbott India Pharma").contactPerson("Kavitha Nair")
                            .phone("+91 9543210987").email("kavitha@abbottindia.com")
                            .address("3/F, Godrej BKC, Bandra Kurla Complex").city("Mumbai").state("Maharashtra")
                            .pincode("400051").gstNumber("27AAACA7890G1Z7").licenseNumber("MH-DL-2018-099").isActive(true).build(),
                    Supplier.builder().name("Torrent Pharmaceuticals").contactPerson("Bhavesh Mehta")
                            .phone("+91 9432109876").email("bhavesh@torrentpharma.com")
                            .address("Torrent House, Off Ashram Road").city("Ahmedabad").state("Gujarat")
                            .pincode("380009").gstNumber("24AAACT8901H1Z8").licenseNumber("GJ-DL-2020-056").isActive(true).build(),
                    Supplier.builder().name("Himalaya Drug Company").contactPerson("Deepak Rao")
                            .phone("+91 9321098765").email("deepak@himalayawellness.com")
                            .address("Makali, Tumkur Road").city("Bengaluru").state("Karnataka")
                            .pincode("562123").gstNumber("29AAACH9012I1Z9").licenseNumber("KA-DL-2019-021").isActive(true).build(),
                    Supplier.builder().name("Zydus Healthcare Ltd").contactPerson("Pooja Verma")
                            .phone("+91 9210987654").email("pooja@zydus.com")
                            .address("Zydus Corporate Park, SG Highway").city("Ahmedabad").state("Gujarat")
                            .pincode("382210").gstNumber("24AAACZ0123J1Z0").licenseNumber("GJ-DL-2021-077").isActive(true).build()
            ));
        }

        // ── 10 Medicines (matching sample_data.sql lines 70-80) ────────────
        if (medicineRepository.count() > 0) return;

        log.info("Seeding 10 medicines...");
        List<Supplier> sup = supplierRepository.findAll();
        Supplier sup1=sup.get(0), sup2=sup.get(1), sup3=sup.get(2), sup4=sup.get(3), sup5=sup.get(4),
                 sup6=sup.get(5), sup7=sup.get(6), sup8=sup.get(7), sup9=sup.get(8), sup10=sup.get(9);

        Category antibiotics = categoryRepository.findByName("Antibiotics").orElseThrow();
        Category analgesics  = categoryRepository.findByName("Analgesics").orElseThrow();
        Category vitamins    = categoryRepository.findByName("Vitamins & Minerals").orElseThrow();
        Category antidiab    = categoryRepository.findByName("Antidiabetics").orElseThrow();
        Category antihyper   = categoryRepository.findByName("Antihypertensives").orElseThrow();
        Category nsaids      = categoryRepository.findByName("NSAIDs").orElseThrow();

        Medicine med1 = medicineRepository.save(Medicine.builder()
                .name("Amoxicillin 500mg").genericName("Amoxicillin Trihydrate").brandName("Mox 500")
                .category(antibiotics).supplier(sup1).unit("Capsules").hsnCode("3004.10")
                .description("Broad-spectrum antibacterial medication")
                .unitPrice(new BigDecimal("12.50")).mrp(new BigDecimal("15.00")).reorderLevel(100)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        Medicine med2 = medicineRepository.save(Medicine.builder()
                .name("Paracetamol 650mg").genericName("Acetaminophen").brandName("Dolo 650")
                .category(analgesics).supplier(sup2).unit("Tablets").hsnCode("3004.90")
                .description("Analgesic and antipyretic fever reducer")
                .unitPrice(new BigDecimal("2.00")).mrp(new BigDecimal("3.50")).reorderLevel(200)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        Medicine med3 = medicineRepository.save(Medicine.builder()
                .name("Atorvastatin 10mg").genericName("Atorvastatin Calcium").brandName("Lipitor")
                .category(antihyper).supplier(sup3).unit("Tablets").hsnCode("3004.90")
                .description("Statin for cardiovascular & cholesterol")
                .unitPrice(new BigDecimal("8.00")).mrp(new BigDecimal("10.50")).reorderLevel(50)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        Medicine med4 = medicineRepository.save(Medicine.builder()
                .name("Metformin 500mg").genericName("Metformin Hydrochloride").brandName("Glycomet")
                .category(antidiab).supplier(sup4).unit("Tablets").hsnCode("3004.90")
                .description("Blood sugar management for Type 2 Diabetes")
                .unitPrice(new BigDecimal("3.50")).mrp(new BigDecimal("5.00")).reorderLevel(150)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        Medicine med5 = medicineRepository.save(Medicine.builder()
                .name("Vitamin D3 60000 IU").genericName("Cholecalciferol").brandName("D-Rise")
                .category(vitamins).supplier(sup5).unit("Capsules").hsnCode("3004.50")
                .description("Nutritional vitamin D supplement")
                .unitPrice(new BigDecimal("18.00")).mrp(new BigDecimal("25.00")).reorderLevel(80)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        Medicine med6 = medicineRepository.save(Medicine.builder()
                .name("Azithromycin 500mg").genericName("Azithromycin Dihydrate").brandName("Zithromax")
                .category(antibiotics).supplier(sup6).unit("Tablets").hsnCode("3004.10")
                .description("Macrolide antibiotic for respiratory infection")
                .unitPrice(new BigDecimal("22.00")).mrp(new BigDecimal("30.00")).reorderLevel(60)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        Medicine med7 = medicineRepository.save(Medicine.builder()
                .name("Amlodipine 5mg").genericName("Amlodipine Besylate").brandName("Norvasc")
                .category(antihyper).supplier(sup7).unit("Tablets").hsnCode("3004.90")
                .description("Calcium channel blocker for hypertension")
                .unitPrice(new BigDecimal("5.00")).mrp(new BigDecimal("7.50")).reorderLevel(120)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        Medicine med8 = medicineRepository.save(Medicine.builder()
                .name("Insulin Glargine 100IU/mL").genericName("Insulin Glargine").brandName("Lantus")
                .category(antidiab).supplier(sup8).unit("Vials").hsnCode("3004.31")
                .description("Long-acting insulin analogue for diabetes")
                .unitPrice(new BigDecimal("350.00")).mrp(new BigDecimal("420.00")).reorderLevel(30)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        Medicine med9 = medicineRepository.save(Medicine.builder()
                .name("Ibuprofen 400mg").genericName("Ibuprofen").brandName("Brufen")
                .category(nsaids).supplier(sup9).unit("Tablets").hsnCode("3004.90")
                .description("NSAID pain reliever and anti-inflammatory")
                .unitPrice(new BigDecimal("3.00")).mrp(new BigDecimal("4.50")).reorderLevel(180)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        Medicine med10 = medicineRepository.save(Medicine.builder()
                .name("Multivitamin & Multimineral").genericName("Multivitamin Complex").brandName("Supradyn")
                .category(vitamins).supplier(sup10).unit("Tablets").hsnCode("3004.50")
                .description("Daily essential multivitamin complex")
                .unitPrice(new BigDecimal("9.00")).mrp(new BigDecimal("13.00")).reorderLevel(100)
                .status(Medicine.MedicineStatus.ACTIVE).build());

        log.info("10 medicines seeded.");

        Medicine[] m = { med1, med2, med3, med4, med5, med6, med7, med8, med9, med10 };

        // ── 10 Inventory Records (matching sample_data.sql lines 85-95) ────
        log.info("Seeding 10 inventory records...");
        inventoryRepository.saveAll(List.of(
                Inventory.builder().medicine(med1).batchNumber("AMX-2026-001").quantity(500).minQuantity(100).expiryDate(LocalDate.now().plusDays(16)).location("Shelf A1").build(), // 1 critical in < 30 days
                Inventory.builder().medicine(med2).batchNumber("DOL-2026-088").quantity( 45).minQuantity(200).expiryDate(LocalDate.now().minusDays(6)).location("Shelf B2").build(), // 1 expired
                Inventory.builder().medicine(med3).batchNumber("LIP-2026-012").quantity(300).minQuantity( 50).expiryDate(LocalDate.now().plusDays(80)).location("Shelf C3").build(), // 1 caution in < 90 days
                Inventory.builder().medicine(med4).batchNumber("GLI-2026-045").quantity(620).minQuantity(150).expiryDate(LocalDate.of(2027,5, 1)).location("Shelf D1").build(),
                Inventory.builder().medicine(med5).batchNumber("DRS-2026-019").quantity(200).minQuantity( 80).expiryDate(LocalDate.of(2028,1,26)).location("Shelf E2").build(),
                Inventory.builder().medicine(med6).batchNumber("ZIT-2026-033").quantity( 25).minQuantity( 60).expiryDate(LocalDate.of(2027,6,19)).location("Shelf A3").build(),
                Inventory.builder().medicine(med7).batchNumber("NOR-2026-007").quantity(480).minQuantity(120).expiryDate(LocalDate.of(2027,9, 8)).location("Shelf C1").build(),
                Inventory.builder().medicine(med8).batchNumber("LAN-2026-062").quantity( 18).minQuantity( 30).expiryDate(LocalDate.now().plusDays(49)).location("Refrigerator R1").build(), // 1 warning in < 60 days
                Inventory.builder().medicine(med9).batchNumber("BRU-2026-041").quantity(750).minQuantity(180).expiryDate(LocalDate.of(2027,5,31)).location("Shelf B4").build(),
                Inventory.builder().medicine(med10).batchNumber("SUP-2026-028").quantity(310).minQuantity(100).expiryDate(LocalDate.of(2028,8, 3)).location("Shelf F1").build()
        ));

        // ── 8 Purchases & Items (matching sample_data.sql lines 100-130) ────
        log.info("Seeding 8 purchases...");
        User admin = userRepository.findByUsername("admin").orElse(null);
        User ravi  = userRepository.findByUsername("ravi_inv").orElse(null);

        Purchase p1 = Purchase.builder()
                .invoiceNumber("INV-2024-0001").supplier(sup1).purchaseDate(LocalDate.of(2026,1,20))
                .totalAmount(new BigDecimal("8500.00")).discount(new BigDecimal("500.00"))
                .taxAmount(new BigDecimal("360.00")).netAmount(new BigDecimal("8360.00"))
                .status(Purchase.PurchaseStatus.RECEIVED).createdBy(ravi).build();
        p1.setItems(List.of(
                PurchaseItem.builder().purchase(p1).medicine(m[0]).batchNumber("AMX-2026-001").quantity(500).unitCost(new BigDecimal("7.50")).totalCost(new BigDecimal("3750.00")).expiryDate(LocalDate.of(2027,1,14)).build(),
                PurchaseItem.builder().purchase(p1).medicine(m[3]).batchNumber("PAR-2026-004").quantity(600).unitCost(new BigDecimal("2.00")).totalCost(new BigDecimal("1200.00")).expiryDate(LocalDate.of(2027,8,31)).build(),
                PurchaseItem.builder().purchase(p1).medicine(m[8]).batchNumber("VTC-2026-009").quantity(700).unitCost(new BigDecimal("2.50")).totalCost(new BigDecimal("1750.00")).expiryDate(LocalDate.of(2027,12,31)).build()
        ));

        Purchase p2 = Purchase.builder()
                .invoiceNumber("INV-2024-0002").supplier(sup2).purchaseDate(LocalDate.of(2026,2,10))
                .totalAmount(new BigDecimal("12000.00")).discount(new BigDecimal("600.00"))
                .taxAmount(new BigDecimal("540.00")).netAmount(new BigDecimal("11940.00"))
                .status(Purchase.PurchaseStatus.RECEIVED).createdBy(ravi).build();
        p2.setItems(List.of(
                PurchaseItem.builder().purchase(p2).medicine(m[1]).batchNumber("AZI-2026-002").quantity(300).unitCost(new BigDecimal("26.00")).totalCost(new BigDecimal("7800.00")).expiryDate(LocalDate.of(2027,1,31)).build(),
                PurchaseItem.builder().purchase(p2).medicine(m[4]).batchNumber("IBU-2026-005").quantity(500).unitCost(new BigDecimal("4.20")).totalCost(new BigDecimal("2100.00")).expiryDate(LocalDate.of(2027,2,14)).build()
        ));

        Purchase p3 = Purchase.builder()
                .invoiceNumber("INV-2024-0003").supplier(sup3).purchaseDate(LocalDate.of(2026,3,5))
                .totalAmount(new BigDecimal("6800.00")).discount(new BigDecimal("200.00"))
                .taxAmount(new BigDecimal("324.00")).netAmount(new BigDecimal("6924.00"))
                .status(Purchase.PurchaseStatus.RECEIVED).createdBy(ravi).build();
        p3.setItems(List.of(
                PurchaseItem.builder().purchase(p3).medicine(m[6]).batchNumber("OME-2026-007").quantity(400).unitCost(new BigDecimal("8.00")).totalCost(new BigDecimal("3200.00")).expiryDate(LocalDate.of(2027,3,31)).build(),
                PurchaseItem.builder().purchase(p3).medicine(m[0]).batchNumber("MET-2026-011").quantity(500).unitCost(new BigDecimal("4.00")).totalCost(new BigDecimal("2000.00")).expiryDate(LocalDate.of(2027,2,28)).build()
        ));

        Purchase p4 = Purchase.builder()
                .invoiceNumber("INV-2024-0004").supplier(sup4).purchaseDate(LocalDate.of(2026,4,12))
                .totalAmount(new BigDecimal("15000.00")).discount(new BigDecimal("750.00"))
                .taxAmount(new BigDecimal("676.50")).netAmount(new BigDecimal("14926.50"))
                .status(Purchase.PurchaseStatus.RECEIVED).createdBy(admin).build();
        p4.setItems(List.of(
                PurchaseItem.builder().purchase(p4).medicine(m[9]).batchNumber("VTD-2026-010").quantity(200).unitCost(new BigDecimal("32.00")).totalCost(new BigDecimal("6400.00")).expiryDate(LocalDate.of(2027,1,31)).build(),
                PurchaseItem.builder().purchase(p4).medicine(m[6]).batchNumber("ATO-2026-017").quantity(250).unitCost(new BigDecimal("16.00")).totalCost(new BigDecimal("4000.00")).expiryDate(LocalDate.of(2027,2,4)).build(),
                PurchaseItem.builder().purchase(p4).medicine(m[3]).batchNumber("TEL-2026-014").quantity(300).unitCost(new BigDecimal("12.00")).totalCost(new BigDecimal("3600.00")).expiryDate(LocalDate.of(2027,2,19)).build()
        ));

        Purchase p5 = Purchase.builder()
                .invoiceNumber("INV-2024-0005").supplier(sup5).purchaseDate(LocalDate.of(2026,5,18))
                .totalAmount(new BigDecimal("9200.00")).discount(new BigDecimal("400.00"))
                .taxAmount(new BigDecimal("432.00")).netAmount(new BigDecimal("9232.00"))
                .status(Purchase.PurchaseStatus.RECEIVED).createdBy(ravi).build();
        p5.setItems(List.of(
                PurchaseItem.builder().purchase(p5).medicine(m[2]).batchNumber("AML-2026-013").quantity(400).unitCost(new BigDecimal("7.00")).totalCost(new BigDecimal("2800.00")).expiryDate(LocalDate.of(2027,3,31)).build(),
                PurchaseItem.builder().purchase(p5).medicine(m[4]).batchNumber("CET-2026-015").quantity(450).unitCost(new BigDecimal("3.50")).totalCost(new BigDecimal("1575.00")).expiryDate(LocalDate.of(2027,3,9)).build()
        ));

        Purchase p6 = Purchase.builder()
                .invoiceNumber("INV-2024-0006").supplier(sup1).purchaseDate(LocalDate.of(2026,6,22))
                .totalAmount(new BigDecimal("11000.00")).discount(new BigDecimal("550.00"))
                .taxAmount(new BigDecimal("495.00")).netAmount(new BigDecimal("10945.00"))
                .status(Purchase.PurchaseStatus.RECEIVED).createdBy(ravi).build();
        p6.setItems(List.of(
                PurchaseItem.builder().purchase(p6).medicine(m[2]).batchNumber("CIP-2026-003").quantity(350).unitCost(new BigDecimal("10.50")).totalCost(new BigDecimal("3675.00")).expiryDate(LocalDate.of(2027,1,9)).build(),
                PurchaseItem.builder().purchase(p6).medicine(m[7]).batchNumber("PAN-2026-008").quantity(300).unitCost(new BigDecimal("10.50")).totalCost(new BigDecimal("3150.00")).expiryDate(LocalDate.of(2027,3,14)).build()
        ));

        Purchase p7 = Purchase.builder()
                .invoiceNumber("INV-2024-0007").supplier(sup2).purchaseDate(LocalDate.of(2026,7,8))
                .totalAmount(new BigDecimal("7600.00")).discount(new BigDecimal("380.00"))
                .taxAmount(new BigDecimal("342.00")).netAmount(new BigDecimal("7562.00"))
                .status(Purchase.PurchaseStatus.RECEIVED).createdBy(admin).build();
        p7.setItems(List.of(
                PurchaseItem.builder().purchase(p7).medicine(m[5]).batchNumber("DIC-2026-006").quantity(250).unitCost(new BigDecimal("5.80")).totalCost(new BigDecimal("1450.00")).expiryDate(LocalDate.of(2026,8,31)).build(),
                PurchaseItem.builder().purchase(p7).medicine(m[1]).batchNumber("GLI-2026-012").quantity(200).unitCost(new BigDecimal("13.50")).totalCost(new BigDecimal("2700.00")).expiryDate(LocalDate.of(2026,9,30)).build(),
                PurchaseItem.builder().purchase(p7).medicine(m[7]).batchNumber("DOX-2026-018").quantity(150).unitCost(new BigDecimal("20.00")).totalCost(new BigDecimal("3000.00")).expiryDate(LocalDate.of(2026,10,31)).build()
        ));

        Purchase p8 = Purchase.builder()
                .invoiceNumber("INV-2024-0008").supplier(sup3).purchaseDate(LocalDate.of(2026,8,1))
                .totalAmount(new BigDecimal("13500.00")).discount(new BigDecimal("675.00"))
                .taxAmount(new BigDecimal("607.50")).netAmount(new BigDecimal("13432.50"))
                .status(Purchase.PurchaseStatus.PENDING).createdBy(ravi).build();
        p8.setItems(List.of(
                PurchaseItem.builder().purchase(p8).medicine(m[2]).batchNumber("LIP-2026-035").quantity(250).unitCost(new BigDecimal("22.00")).totalCost(new BigDecimal("5500.00")).expiryDate(LocalDate.of(2027,8,1)).build(),
                PurchaseItem.builder().purchase(p8).medicine(m[6]).batchNumber("NOR-2026-042").quantity(400).unitCost(new BigDecimal("20.00")).totalCost(new BigDecimal("8000.00")).expiryDate(LocalDate.of(2027,10,15)).build()
        ));

        Purchase p9 = Purchase.builder()
                .invoiceNumber("INV-2026-0009").supplier(sup1).purchaseDate(LocalDate.of(2026,9,2))
                .totalAmount(new BigDecimal("8500.00")).discount(new BigDecimal("425.00"))
                .taxAmount(new BigDecimal("382.50")).netAmount(new BigDecimal("8457.50"))
                .status(Purchase.PurchaseStatus.RECEIVED).createdBy(ravi).build();
        p9.setItems(List.of(
                PurchaseItem.builder().purchase(p9).medicine(m[0]).batchNumber("AMX-2026-021").quantity(300).unitCost(new BigDecimal("7.50")).totalCost(new BigDecimal("2250.00")).expiryDate(LocalDate.of(2027,9,15)).build(),
                PurchaseItem.builder().purchase(p9).medicine(m[3]).batchNumber("PAR-2026-022").quantity(400).unitCost(new BigDecimal("2.00")).totalCost(new BigDecimal("800.00")).expiryDate(LocalDate.of(2027,9,30)).build()
        ));

        Purchase p10 = Purchase.builder()
                .invoiceNumber("INV-2026-0010").supplier(sup4).purchaseDate(LocalDate.of(2026,9,12))
                .totalAmount(new BigDecimal("10500.00")).discount(new BigDecimal("500.00"))
                .taxAmount(new BigDecimal("472.50")).netAmount(new BigDecimal("10472.50"))
                .status(Purchase.PurchaseStatus.RECEIVED).createdBy(admin).build();
        p10.setItems(List.of(
                PurchaseItem.builder().purchase(p10).medicine(m[4]).batchNumber("DRS-2026-031").quantity(300).unitCost(new BigDecimal("18.00")).totalCost(new BigDecimal("5400.00")).expiryDate(LocalDate.of(2028,2,20)).build(),
                PurchaseItem.builder().purchase(p10).medicine(m[8]).batchNumber("BRU-2026-052").quantity(350).unitCost(new BigDecimal("3.00")).totalCost(new BigDecimal("1050.00")).expiryDate(LocalDate.of(2027,11,10)).build()
        ));

        purchaseRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));

        // ── Real Sales & Items covering Jan to Sep 2026 (matching wave split) ──
        log.info("Seeding realistic sales from Jan to Sep 2026...");
        User patel = userRepository.findByUsername("dr_patel").orElse(null);
        User sneha = userRepository.findByUsername("sneha_ph").orElse(null);

        // Jan 2026: 600.00
        Sale sale1 = Sale.builder().saleNumber("SALE-2026-0001").customerName("Rajesh Sharma").customerPhone("9876543211")
                .saleDate(LocalDate.of(2026,1,14)).totalAmount(new BigDecimal("570.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("30.00")).netAmount(new BigDecimal("600.00"))
                .paymentMethod(Sale.PaymentMethod.CASH).status(Sale.SaleStatus.COMPLETED).createdBy(patel).build();
        sale1.setItems(List.of(
                SaleItem.builder().sale(sale1).medicine(m[3]).quantity(50).unitPrice(new BigDecimal("4.00")).totalPrice(new BigDecimal("200.00")).build(),
                SaleItem.builder().sale(sale1).medicine(m[0]).quantity(25).unitPrice(new BigDecimal("14.80")).totalPrice(new BigDecimal("370.00")).build()
        ));

        // Feb 2026: 4200.00 (2000 + 2200)
        Sale sale2 = Sale.builder().saleNumber("SALE-2026-0002").customerName("Anita Desai").customerPhone("9001122334")
                .saleDate(LocalDate.of(2026,2,8)).totalAmount(new BigDecimal("1900.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("100.00")).netAmount(new BigDecimal("2000.00"))
                .paymentMethod(Sale.PaymentMethod.CARD).status(Sale.SaleStatus.COMPLETED).createdBy(patel).build();
        sale2.setItems(List.of(
                SaleItem.builder().sale(sale2).medicine(m[1]).quantity(40).unitPrice(new BigDecimal("45.00")).totalPrice(new BigDecimal("1800.00")).build(),
                SaleItem.builder().sale(sale2).medicine(m[9]).quantity(2).unitPrice(new BigDecimal("50.00")).totalPrice(new BigDecimal("100.00")).build()
        ));

        Sale sale3 = Sale.builder().saleNumber("SALE-2026-0003").customerName("Ramesh Verma").customerPhone("9002233445")
                .saleDate(LocalDate.of(2026,2,22)).totalAmount(new BigDecimal("2100.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("100.00")).netAmount(new BigDecimal("2200.00"))
                .paymentMethod(Sale.PaymentMethod.UPI).status(Sale.SaleStatus.COMPLETED).createdBy(sneha).build();
        sale3.setItems(List.of(
                SaleItem.builder().sale(sale3).medicine(m[2]).quantity(100).unitPrice(new BigDecimal("15.00")).totalPrice(new BigDecimal("1500.00")).build(),
                SaleItem.builder().sale(sale3).medicine(m[4]).quantity(75).unitPrice(new BigDecimal("8.00")).totalPrice(new BigDecimal("600.00")).build()
        ));

        // Mar 2026: 4500.00 (2500 + 2000)
        Sale sale4 = Sale.builder().saleNumber("SALE-2026-0004").customerName("Kavita Joshi").customerPhone("9003344556")
                .saleDate(LocalDate.of(2026,3,10)).totalAmount(new BigDecimal("2380.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("120.00")).netAmount(new BigDecimal("2500.00"))
                .paymentMethod(Sale.PaymentMethod.CASH).status(Sale.SaleStatus.COMPLETED).createdBy(patel).build();
        sale4.setItems(List.of(
                SaleItem.builder().sale(sale4).medicine(m[0]).quantity(200).unitPrice(new BigDecimal("8.00")).totalPrice(new BigDecimal("1600.00")).build(),
                SaleItem.builder().sale(sale4).medicine(m[2]).quantity(100).unitPrice(new BigDecimal("7.80")).totalPrice(new BigDecimal("780.00")).build()
        ));

        Sale sale5 = Sale.builder().saleNumber("SALE-2026-0005").customerName("Mohan Pillai").customerPhone("9004455667")
                .saleDate(LocalDate.of(2026,3,25)).totalAmount(new BigDecimal("1900.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("100.00")).netAmount(new BigDecimal("2000.00"))
                .paymentMethod(Sale.PaymentMethod.UPI).status(Sale.SaleStatus.COMPLETED).createdBy(sneha).build();
        sale5.setItems(List.of(
                SaleItem.builder().sale(sale5).medicine(m[6]).quantity(50).unitPrice(new BigDecimal("28.00")).totalPrice(new BigDecimal("1400.00")).build(),
                SaleItem.builder().sale(sale5).medicine(m[3]).quantity(125).unitPrice(new BigDecimal("4.00")).totalPrice(new BigDecimal("500.00")).build()
        ));

        // Apr 2026: 1200.00
        Sale sale6 = Sale.builder().saleNumber("SALE-2026-0006").customerName("Sunita Bose").customerPhone("9005566778")
                .saleDate(LocalDate.of(2026,4,15)).totalAmount(new BigDecimal("1140.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("60.00")).netAmount(new BigDecimal("1200.00"))
                .paymentMethod(Sale.PaymentMethod.CASH).status(Sale.SaleStatus.COMPLETED).createdBy(patel).build();
        sale6.setItems(List.of(
                SaleItem.builder().sale(sale6).medicine(m[4]).quantity(100).unitPrice(new BigDecimal("7.00")).totalPrice(new BigDecimal("700.00")).build(),
                SaleItem.builder().sale(sale6).medicine(m[5]).quantity(50).unitPrice(new BigDecimal("8.80")).totalPrice(new BigDecimal("440.00")).build()
        ));

        // May 2026: 9000.00 (4900 + 4100)
        Sale sale7 = Sale.builder().saleNumber("SALE-2026-0007").customerName("Arun Krishnan").customerPhone("9006677889")
                .saleDate(LocalDate.of(2026,5,8)).totalAmount(new BigDecimal("4650.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("250.00")).netAmount(new BigDecimal("4900.00"))
                .paymentMethod(Sale.PaymentMethod.CARD).status(Sale.SaleStatus.COMPLETED).createdBy(sneha).build();
        sale7.setItems(List.of(
                SaleItem.builder().sale(sale7).medicine(m[1]).quantity(70).unitPrice(new BigDecimal("45.00")).totalPrice(new BigDecimal("3150.00")).build(),
                SaleItem.builder().sale(sale7).medicine(m[7]).quantity(75).unitPrice(new BigDecimal("20.00")).totalPrice(new BigDecimal("1500.00")).build()
        ));

        Sale sale8 = Sale.builder().saleNumber("SALE-2026-0008").customerName("Divya Menon").customerPhone("9007788990")
                .saleDate(LocalDate.of(2026,5,22)).totalAmount(new BigDecimal("3900.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("200.00")).netAmount(new BigDecimal("4100.00"))
                .paymentMethod(Sale.PaymentMethod.UPI).status(Sale.SaleStatus.COMPLETED).createdBy(patel).build();
        sale8.setItems(List.of(
                SaleItem.builder().sale(sale8).medicine(m[2]).quantity(150).unitPrice(new BigDecimal("18.00")).totalPrice(new BigDecimal("2700.00")).build(),
                SaleItem.builder().sale(sale8).medicine(m[8]).quantity(150).unitPrice(new BigDecimal("8.00")).totalPrice(new BigDecimal("1200.00")).build()
        ));

        // Jun 2026: 1500.00
        Sale sale9 = Sale.builder().saleNumber("SALE-2026-0009").customerName("Vikram Singh").customerPhone("9008899001")
                .saleDate(LocalDate.of(2026,6,12)).totalAmount(new BigDecimal("1425.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("75.00")).netAmount(new BigDecimal("1500.00"))
                .paymentMethod(Sale.PaymentMethod.CASH).status(Sale.SaleStatus.COMPLETED).createdBy(sneha).build();
        sale9.setItems(List.of(
                SaleItem.builder().sale(sale9).medicine(m[8]).quantity(150).unitPrice(new BigDecimal("5.50")).totalPrice(new BigDecimal("825.00")).build(),
                SaleItem.builder().sale(sale9).medicine(m[9]).quantity(60).unitPrice(new BigDecimal("10.00")).totalPrice(new BigDecimal("600.00")).build()
        ));

        // Jul 2026: 4500.00 (2300 + 2200)
        Sale sale10 = Sale.builder().saleNumber("SALE-2026-0010").customerName("Meera Agarwal").customerPhone("9009900112")
                .saleDate(LocalDate.of(2026,7,11)).totalAmount(new BigDecimal("2185.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("115.00")).netAmount(new BigDecimal("2300.00"))
                .paymentMethod(Sale.PaymentMethod.CARD).status(Sale.SaleStatus.COMPLETED).createdBy(patel).build();
        sale10.setItems(List.of(
                SaleItem.builder().sale(sale10).medicine(m[1]).quantity(50).unitPrice(new BigDecimal("25.00")).totalPrice(new BigDecimal("1250.00")).build(),
                SaleItem.builder().sale(sale10).medicine(m[6]).quantity(35).unitPrice(new BigDecimal("26.70")).totalPrice(new BigDecimal("935.00")).build()
        ));

        Sale sale11 = Sale.builder().saleNumber("SALE-2026-0011").customerName("Kiran Rao").customerPhone("9010011223")
                .saleDate(LocalDate.of(2026,7,26)).totalAmount(new BigDecimal("2090.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("110.00")).netAmount(new BigDecimal("2200.00"))
                .paymentMethod(Sale.PaymentMethod.UPI).status(Sale.SaleStatus.COMPLETED).createdBy(sneha).build();
        sale11.setItems(List.of(
                SaleItem.builder().sale(sale11).medicine(m[0]).quantity(150).unitPrice(new BigDecimal("8.00")).totalPrice(new BigDecimal("1200.00")).build(),
                SaleItem.builder().sale(sale11).medicine(m[4]).quantity(110).unitPrice(new BigDecimal("8.09")).totalPrice(new BigDecimal("890.00")).build()
        ));

        // Aug 2026: 1800.00
        Sale sale12 = Sale.builder().saleNumber("SALE-2026-0012").customerName("Pooja Hegde").customerPhone("9011122334")
                .saleDate(LocalDate.of(2026,8,16)).totalAmount(new BigDecimal("1710.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("90.00")).netAmount(new BigDecimal("1800.00"))
                .paymentMethod(Sale.PaymentMethod.CASH).status(Sale.SaleStatus.COMPLETED).createdBy(patel).build();
        sale12.setItems(List.of(
                SaleItem.builder().sale(sale12).medicine(m[2]).quantity(70).unitPrice(new BigDecimal("15.00")).totalPrice(new BigDecimal("1050.00")).build(),
                SaleItem.builder().sale(sale12).medicine(m[5]).quantity(60).unitPrice(new BigDecimal("11.00")).totalPrice(new BigDecimal("660.00")).build()
        ));

        // Sep 2026: 1500.00
        Sale sale13 = Sale.builder().saleNumber("SALE-2026-0013").customerName("Sanjay Gupta").customerPhone("9012233445")
                .saleDate(LocalDate.of(2026,9,3)).totalAmount(new BigDecimal("1425.00")).discount(new BigDecimal("0.00"))
                .taxAmount(new BigDecimal("75.00")).netAmount(new BigDecimal("1500.00"))
                .paymentMethod(Sale.PaymentMethod.UPI).status(Sale.SaleStatus.COMPLETED).createdBy(sneha).build();
        sale13.setItems(List.of(
                SaleItem.builder().sale(sale13).medicine(m[3]).quantity(150).unitPrice(new BigDecimal("5.00")).totalPrice(new BigDecimal("750.00")).build(),
                SaleItem.builder().sale(sale13).medicine(m[7]).quantity(40).unitPrice(new BigDecimal("16.88")).totalPrice(new BigDecimal("675.00")).build()
        ));

        saleRepository.saveAll(List.of(
                sale1, sale2, sale3, sale4, sale5, sale6,
                sale7, sale8, sale9, sale10, sale11, sale12, sale13
        ));

        // ── 10 Stock Movements (Exact 1:1 mapping for all 10 medicines) ───
        log.info("Seeding 10 distinct stock movements for all 10 medicines...");
        stockMovementRepository.saveAll(List.of(
                StockMovement.builder().medicine(m[0]).movementType(StockMovement.MovementType.PURCHASE_IN).quantity(500).quantityBefore(0).quantityAfter(500).referenceType("PURCHASE").referenceId(1L).reason("Initial batch procurement from INV-2026-0001").performedBy(ravi).build(),
                StockMovement.builder().medicine(m[1]).movementType(StockMovement.MovementType.PURCHASE_IN).quantity(300).quantityBefore(0).quantityAfter(300).referenceType("PURCHASE").referenceId(2L).reason("Procured from Cipla MedCorp INV-2026-0002").performedBy(ravi).build(),
                StockMovement.builder().medicine(m[2]).movementType(StockMovement.MovementType.PURCHASE_IN).quantity(400).quantityBefore(0).quantityAfter(400).referenceType("PURCHASE").referenceId(3L).reason("Stock received from Dr. Reddy's INV-2026-0003").performedBy(ravi).build(),
                StockMovement.builder().medicine(m[3]).movementType(StockMovement.MovementType.PURCHASE_IN).quantity(600).quantityBefore(0).quantityAfter(600).referenceType("PURCHASE").referenceId(1L).reason("Initial batch procurement from INV-2026-0001").performedBy(ravi).build(),
                StockMovement.builder().medicine(m[4]).movementType(StockMovement.MovementType.PURCHASE_IN).quantity(500).quantityBefore(0).quantityAfter(500).referenceType("PURCHASE").referenceId(2L).reason("Supplied by Lupin Healthcare INV-2026-0002").performedBy(ravi).build(),
                StockMovement.builder().medicine(m[5]).movementType(StockMovement.MovementType.ADJUSTMENT_IN).quantity(50).quantityBefore(180).quantityAfter(230).reason("Stock count adjustment - physical audit").performedBy(admin).build(),
                StockMovement.builder().medicine(m[6]).movementType(StockMovement.MovementType.SALE_OUT).quantity(10).quantityBefore(200).quantityAfter(190).referenceType("SALE").referenceId(5L).reason("Dispensed for Sale SALE-2026-0005").performedBy(sneha).build(),
                StockMovement.builder().medicine(m[7]).movementType(StockMovement.MovementType.EXPIRED_REMOVAL).quantity(30).quantityBefore(150).quantityAfter(120).reason("Batch LAN-2025 expired - removed from stock").performedBy(admin).build(),
                StockMovement.builder().medicine(m[8]).movementType(StockMovement.MovementType.SALE_OUT).quantity(15).quantityBefore(700).quantityAfter(685).referenceType("SALE").referenceId(1L).reason("Dispensed for Sale SALE-2026-0001").performedBy(patel).build(),
                StockMovement.builder().medicine(m[9]).movementType(StockMovement.MovementType.PURCHASE_IN).quantity(450).quantityBefore(0).quantityAfter(450).referenceType("PURCHASE").referenceId(4L).reason("Initial stock from INV-2026-0004").performedBy(ravi).build()
        ));

        // ── 6 Alerts (matching sample_data.sql lines 195-201) ───────────────
        if (alertRepository.count() == 0) {
            log.info("Seeding 6 alerts...");
            alertRepository.saveAll(List.of(
                    Alert.builder().alertType(Alert.AlertType.LOW_STOCK).medicine(m[7])
                            .message("Doxycycline 100mg Capsules stock (120) is below reorder level (30). Immediate reorder recommended.")
                            .status(Alert.AlertStatus.ACTIVE).build(),
                    Alert.builder().alertType(Alert.AlertType.EXPIRY_30_DAYS).medicine(m[5])
                            .message("Diclofenac 50mg Tablets (Batch: DIC-2026-006) expires on 2026-08-31. Only 2 months remaining.")
                            .status(Alert.AlertStatus.ACTIVE).build(),
                    Alert.builder().alertType(Alert.AlertType.EXPIRY_30_DAYS).medicine(m[1])
                            .message("Glimepiride 2mg Tablets (Batch: GLI-2026-012) expires on 2026-09-30. Please review and initiate return/disposal.")
                            .status(Alert.AlertStatus.ACTIVE).build(),
                    Alert.builder().alertType(Alert.AlertType.EXPIRY_30_DAYS).medicine(m[7])
                            .message("Doxycycline 100mg Capsules (Batch: DOX-2026-018) expires on 2026-10-31. Near expiry alert.")
                            .status(Alert.AlertStatus.ACTIVE).build(),
                    Alert.builder().alertType(Alert.AlertType.EXPIRY_30_DAYS).medicine(m[0])
                            .message("Amoxicillin 500mg (Batch: AMX-2026-001) expires on 2027-01-30. Monitor consumption rate.")
                            .status(Alert.AlertStatus.ACTIVE).build(),
                    Alert.builder().alertType(Alert.AlertType.LOW_STOCK).medicine(m[9])
                            .message("Supradyn Multivitamin Tablets stock (400) optimal. Reorder threshold 100.")
                            .status(Alert.AlertStatus.RESOLVED).build()
            ));
        }

        // ── 4 Doctors ───────────────────────────────────────────────────
        if (doctorRepository.count() == 0) {
            log.info("Seeding 4 doctors...");
            doctorRepository.saveAll(List.of(
                    Doctor.builder().doctorId("DOC-0001").name("Dr. S. K. Gupta").specialty("Cardiologist")
                            .registrationNumber("MCI-DL-2012-4521").hospital("Apex Heart Institute, Delhi")
                            .contactPhone("9811002233").email("dr.gupta@apexheart.org").isActive(true).build(),
                    Doctor.builder().doctorId("DOC-0002").name("Dr. Ananya Sen").specialty("General Physician")
                            .registrationNumber("MCI-WB-2015-8834").hospital("City Care Multispecialty, Kolkata")
                            .contactPhone("9830011224").email("ananya.sen@citycare.in").isActive(true).build(),
                    Doctor.builder().doctorId("DOC-0003").name("Dr. Vikram Malhotra").specialty("Pediatrician")
                            .registrationNumber("MCI-MH-2018-9012").hospital("Lilavati Children's Hospital, Mumbai")
                            .contactPhone("9820033445").email("v.malhotra@lilavati.org").isActive(true).build(),
                    Doctor.builder().doctorId("DOC-0004").name("Dr. Meenakshi Sundaram").specialty("Orthopedic Specialist")
                            .registrationNumber("MCI-TN-2010-3321").hospital("Apollo Specialty Hospital, Chennai")
                            .contactPhone("9840055667").email("m.sundaram@apollo.com").isActive(true).build()
            ));
        }

        // ── 5 Patients ──────────────────────────────────────────────────
        if (patientRepository.count() == 0) {
            log.info("Seeding 5 patients...");
            Doctor doc1 = doctorRepository.findByDoctorId("DOC-0001").orElse(null);
            Doctor doc2 = doctorRepository.findByDoctorId("DOC-0002").orElse(null);
            Doctor doc3 = doctorRepository.findByDoctorId("DOC-0003").orElse(null);
            Doctor doc4 = doctorRepository.findByDoctorId("DOC-0004").orElse(null);

            patientRepository.saveAll(List.of(
                    Patient.builder().patientId("PAT-2026-0001").firstName("Rahul").lastName("Sharma").age(38).gender("Male")
                            .phone("9876500001").email("rahul.sharma@example.com").address("42 Green Park, New Delhi")
                            .bloodGroup("O+").allergies("Penicillin allergy").medicalHistory("Seasonal bronchitis, mild asthma")
                            .status(Patient.PatientStatus.ATTENTION_REQUIRED).primaryDoctor(doc2).build(),
                    Patient.builder().patientId("PAT-2026-0002").firstName("Priya").lastName("Patel").age(29).gender("Female")
                            .phone("9876500002").email("priya.patel@example.com").address("12 Lake View Apts, Ahmedabad")
                            .bloodGroup("B+").allergies("None reported").medicalHistory("Hypertension Stage 1, quarterly checkup")
                            .status(Patient.PatientStatus.ACTIVE).primaryDoctor(doc1).build(),
                    Patient.builder().patientId("PAT-2026-0003").firstName("Amit").lastName("Verma").age(54).gender("Male")
                            .phone("9876500003").email("amit.verma@example.com").address("78 Civil Lines, Jaipur")
                            .bloodGroup("A+").allergies("Sulfa drugs").medicalHistory("Type 2 Diabetes (HbA1c: 7.2), hyperlipidemia")
                            .status(Patient.PatientStatus.FOLLOW_UP).primaryDoctor(doc2).build(),
                    Patient.builder().patientId("PAT-2026-0004").firstName("Sunita").lastName("Rao").age(45).gender("Female")
                            .phone("9876500004").email("sunita.rao@example.com").address("204 Palm Grove, Bengaluru")
                            .bloodGroup("AB+").allergies("None").medicalHistory("Knee arthroscopy post-op recovery")
                            .status(Patient.PatientStatus.ACTIVE).primaryDoctor(doc4).build(),
                    Patient.builder().patientId("PAT-2026-0005").firstName("Rajesh").lastName("Nair").age(62).gender("Male")
                            .phone("9876500005").email("rajesh.nair@example.com").address("15 Marine Drive, Kochi")
                            .bloodGroup("O-").allergies("Aspirin").medicalHistory("Chronic osteoarthritis, GERD")
                            .status(Patient.PatientStatus.FOLLOW_UP).primaryDoctor(doc3).build()
            ));
        }

        // ── 5 Prescriptions (with PrescriptionItems) ────────────────────
        if (prescriptionRepository.count() == 0) {
            log.info("Seeding 5 prescriptions...");
            Patient pat1 = patientRepository.findByPatientId("PAT-2026-0001").orElse(null);
            Patient pat2 = patientRepository.findByPatientId("PAT-2026-0002").orElse(null);
            Patient pat3 = patientRepository.findByPatientId("PAT-2026-0003").orElse(null);
            Patient pat4 = patientRepository.findByPatientId("PAT-2026-0004").orElse(null);
            Patient pat5 = patientRepository.findByPatientId("PAT-2026-0005").orElse(null);

            Doctor d1 = doctorRepository.findByDoctorId("DOC-0001").orElse(null);
            Doctor d2 = doctorRepository.findByDoctorId("DOC-0002").orElse(null);
            Doctor d3 = doctorRepository.findByDoctorId("DOC-0003").orElse(null);
            Doctor d4 = doctorRepository.findByDoctorId("DOC-0004").orElse(null);

            // RX 1: Pending Review (from OCR upload simulation)
            Prescription rx1 = new Prescription();
            rx1.setPrescriptionNumber("RX-2026-0001");
            rx1.setPatient(pat1);
            rx1.setDoctor(d2);
            rx1.setPrescriptionDate(LocalDate.now());
            rx1.setDiagnosis("Upper respiratory tract infection with low-grade fever");
            rx1.setStatus(Prescription.PrescriptionStatus.PENDING);
            rx1.setNotes("AI extracted from prescription scan — requires pharmacist verification");
            rx1.setOcrConfidence(94.2);
            rx1.setCreatedBy(admin);
            rx1.setItems(new ArrayList<>(List.of(
                    new PrescriptionItem(null, rx1, m[0], "500mg", "1 capsule 3x daily", "5 days", 15, "Take after meals"),
                    new PrescriptionItem(null, rx1, m[3], "500mg", "1 tablet as needed", "3 days", 6, "For fever/pain relief")
            )));
            prescriptionRepository.save(rx1);

            // RX 2: Approved
            Prescription rx2 = new Prescription();
            rx2.setPrescriptionNumber("RX-2026-0002");
            rx2.setPatient(pat2);
            rx2.setDoctor(d1);
            rx2.setPrescriptionDate(LocalDate.now().minusDays(1));
            rx2.setDiagnosis("Hypertension Stage 1 maintenance therapy");
            rx2.setStatus(Prescription.PrescriptionStatus.APPROVED);
            rx2.setNotes("Verified by senior pharmacist. Stock availability confirmed.");
            rx2.setVerifiedBy(patel);
            rx2.setVerifiedAt(LocalDateTime.now().minusHours(4));
            rx2.setCreatedBy(patel);
            rx2.setItems(new ArrayList<>(List.of(
                    new PrescriptionItem(null, rx2, m[2], "5mg", "1 tablet once daily", "30 days", 30, "Take in the morning with water")
            )));
            prescriptionRepository.save(rx2);

            // RX 3: Dispensed
            Prescription rx3 = new Prescription();
            rx3.setPrescriptionNumber("RX-2026-0003");
            rx3.setPatient(pat3);
            rx3.setDoctor(d2);
            rx3.setPrescriptionDate(LocalDate.now().minusDays(3));
            rx3.setDiagnosis("Type 2 Diabetes routine refill");
            rx3.setStatus(Prescription.PrescriptionStatus.DISPENSED);
            rx3.setNotes("Dispensed and billed under SALE-2026-0010");
            rx3.setVerifiedBy(sneha);
            rx3.setVerifiedAt(LocalDateTime.now().minusDays(3));
            rx3.setCreatedBy(sneha);
            rx3.setSaleId(10L);
            rx3.setItems(new ArrayList<>(List.of(
                    new PrescriptionItem(null, rx3, m[1], "2mg", "1 tablet before breakfast", "30 days", 30, "Monitor blood sugar weekly"),
                    new PrescriptionItem(null, rx3, m[8], "500mg", "1 tablet twice daily", "30 days", 60, "Take with meals")
            )));
            prescriptionRepository.save(rx3);

            // RX 4: Under Review
            Prescription rx4 = new Prescription();
            rx4.setPrescriptionNumber("RX-2026-0004");
            rx4.setPatient(pat4);
            rx4.setDoctor(d4);
            rx4.setPrescriptionDate(LocalDate.now());
            rx4.setDiagnosis("Post-operative pain management & inflammation");
            rx4.setStatus(Prescription.PrescriptionStatus.UNDER_REVIEW);
            rx4.setNotes("Verifying interaction between Diclofenac and patient history");
            rx4.setCreatedBy(admin);
            rx4.setOcrConfidence(88.7);
            rx4.setItems(new ArrayList<>(List.of(
                    new PrescriptionItem(null, rx4, m[5], "50mg", "1 tablet twice daily", "7 days", 14, "Take with food to prevent gastric irritation")
            )));
            prescriptionRepository.save(rx4);

            // RX 5: Rejected
            Prescription rx5 = new Prescription();
            rx5.setPrescriptionNumber("RX-2026-0005");
            rx5.setPatient(pat5);
            rx5.setDoctor(d3);
            rx5.setPrescriptionDate(LocalDate.now().minusDays(5));
            rx5.setDiagnosis("Unclear prescription handwritten dosage");
            rx5.setStatus(Prescription.PrescriptionStatus.REJECTED);
            rx5.setRejectionReason("Dosage frequency illegible; physician contact attempted without response");
            rx5.setVerifiedBy(patel);
            rx5.setVerifiedAt(LocalDateTime.now().minusDays(5));
            rx5.setCreatedBy(patel);
            rx5.setItems(new ArrayList<>(List.of(
                    new PrescriptionItem(null, rx5, m[7], "100mg", "Dosage uncertain", "7 days", 10, "Awaiting physician clarification")
            )));
            prescriptionRepository.save(rx5);
        }

        // ── 5 Audit Logs ────────────────────────────────────────────────
        if (auditLogRepository.count() == 0) {
            log.info("Seeding 5 audit logs...");
            auditLogRepository.saveAll(List.of(
                    AuditLog.builder().action("PRESCRIPTION_APPROVED").entityType("PRESCRIPTION").entityId(2L)
                            .oldValue("PENDING").newValue("APPROVED")
                            .description("Prescription RX-2026-0002 approved by pharmacist")
                            .performedBy(patel).build(),
                    AuditLog.builder().action("PRESCRIPTION_DISPENSED").entityType("PRESCRIPTION").entityId(3L)
                            .oldValue("APPROVED").newValue("DISPENSED")
                            .description("Prescription RX-2026-0003 dispensed to patient Amit Verma")
                            .performedBy(sneha).build(),
                    AuditLog.builder().action("STOCK_ADJUSTED").entityType("INVENTORY").entityId(6L)
                            .oldValue("180").newValue("230")
                            .description("Physical audit recount adjustment (+50 units Diclofenac)")
                            .performedBy(admin).build(),
                    AuditLog.builder().action("PURCHASE_RECEIVED").entityType("PURCHASE").entityId(1L)
                            .oldValue("ORDERED").newValue("RECEIVED")
                            .description("Purchase INV-2024-0001 goods received & verified into warehouse")
                            .performedBy(ravi).build(),
                    AuditLog.builder().action("USER_LOGIN").entityType("AUTH").entityId(1L)
                            .oldValue(null).newValue("SUCCESS")
                            .description("Administrator admin@medicalinv.com authenticated via JWT")
                            .performedBy(admin).build()
            ));
        }

        log.info("Complete sample_data.sql seeded! (10 medicines, 10 inventory, 10 suppliers, 8 purchases, 10 sales, 10 movements, 6 alerts, 5 patients, 4 doctors, 5 prescriptions, 5 audit logs)");
    }
}
