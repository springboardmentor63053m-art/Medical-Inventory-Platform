package com.medistock.common.config;

import com.medistock.category.entity.Category;
import com.medistock.category.repository.CategoryRepository;
import com.medistock.inventory.entity.Inventory;
import com.medistock.inventory.repository.InventoryRepository;
import com.medistock.medicine.entity.Medicine;
import com.medistock.medicine.repository.MedicineRepository;
import com.medistock.role.entity.Role;
import com.medistock.role.repository.RoleRepository;
import com.medistock.supplier.entity.Supplier;
import com.medistock.supplier.repository.SupplierRepository;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking enterprise pharmaceutical inventory dataset (250 Medicines in 12 Categories, 30 Suppliers, 100 POs)...");

        try {
            jdbcTemplate.execute("DELETE FROM inventory_audit");
            jdbcTemplate.execute("DELETE FROM stock_transactions");
            jdbcTemplate.execute("DELETE FROM purchase_order_items");
            jdbcTemplate.execute("DELETE FROM purchase_orders");
            jdbcTemplate.execute("DELETE FROM inventory");
            jdbcTemplate.execute("DELETE FROM medicines");
            jdbcTemplate.execute("DELETE FROM suppliers");
            jdbcTemplate.execute("DELETE FROM categories");
            log.info("Purged obsolete demo data tables cleanly for dataset initialization");
        } catch (Exception e) {
            log.warn("Table purge notice: {}", e.getMessage());
        }

        // Seed Roles
        Role adminRole = getOrCreateRole("ADMIN", "System Administrator Role");
        Role sysAdminRole = getOrCreateRole("SYSTEM_ADMINISTRATOR", "System Administrator");
        Role pharmacistRole = getOrCreateRole("PHARMACIST", "Staff Pharmacist Role");
        Role staffRole = getOrCreateRole("STAFF", "Medical Staff Role");
        Role userRole = getOrCreateRole("USER", "Standard User (Read-Only) Role");

        // Seed Users
        if (!userRepository.existsByEmail("admin@medistock.com")) {
            userRepository.save(User.builder()
                    .employeeId("ADM001")
                    .firstName("System")
                    .lastName("Administrator")
                    .email("admin@medistock.com")
                    .password(passwordEncoder.encode("Password@123"))
                    .phone("+1 800-555-0100")
                    .enabled(true)
                    .accountNonLocked(true)
                    .roles(new HashSet<>(List.of(adminRole, sysAdminRole)))
                    .lastLogin(LocalDateTime.now().minusHours(2))
                    .build());
        }

        if (!userRepository.existsByEmail("pharmacist@medistock.com")) {
            userRepository.save(User.builder()
                    .employeeId("PHA001")
                    .firstName("Sarah")
                    .lastName("Jenkins")
                    .email("pharmacist@medistock.com")
                    .password(passwordEncoder.encode("Password@123"))
                    .phone("+1 800-555-0102")
                    .enabled(true)
                    .accountNonLocked(true)
                    .roles(new HashSet<>(Collections.singletonList(pharmacistRole)))
                    .lastLogin(LocalDateTime.now().minusHours(5))
                    .build());
        }

        if (!userRepository.existsByEmail("staff@medistock.com")) {
            userRepository.save(User.builder()
                    .employeeId("STF001")
                    .firstName("David")
                    .lastName("Miller")
                    .email("staff@medistock.com")
                    .password(passwordEncoder.encode("Password@123"))
                    .phone("+1 800-555-0103")
                    .enabled(true)
                    .accountNonLocked(true)
                    .roles(new HashSet<>(Collections.singletonList(staffRole)))
                    .lastLogin(LocalDateTime.now().minusDays(1))
                    .build());
        }

        if (!userRepository.existsByEmail("user@medistock.com")) {
            userRepository.save(User.builder()
                    .employeeId(null) // Normal USER is not an employee; employeeId is null
                    .firstName("Alex")
                    .lastName("Standard")
                    .email("user@medistock.com")
                    .password(passwordEncoder.encode("Password@123"))
                    .phone("+1 800-555-0104")
                    .enabled(true)
                    .accountNonLocked(true)
                    .roles(new HashSet<>(Collections.singletonList(userRole)))
                    .lastLogin(LocalDateTime.now().minusDays(2))
                    .build());
        }

        // Seed 12 Major Pharmaceutical Categories
        Map<String, Category> categoryMap = seed12MajorCategories();

        // Seed 30 Suppliers
        List<Supplier> suppliers = seedEnterpriseSuppliers();

        // Seed 250 Concise Real-World Medicines and matching 250 Inventory Batch Records
        seedMedicinesAndInventory(categoryMap);

        // Seed 100 Purchase Orders
        seedPurchaseOrders(suppliers);

        log.info("Enterprise Seeding Complete! Total Medicines: {}, Total Inventory: {}, Total Suppliers: {}, Total POs: {}",
                medicineRepository.count(), inventoryRepository.count(), supplierRepository.count(),
                jdbcTemplate.queryForObject("SELECT COUNT(*) FROM purchase_orders", Long.class));
    }

    private Role getOrCreateRole(String name, String description) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(Role.builder().name(name).description(description).build()));
    }

    private Map<String, Category> seed12MajorCategories() {
        String[][] catDefs = {
                {"Antibiotics & Anti-infectives", "Bacterial and anti-infective formulations"},
                {"Analgesics & Pain Management", "Analgesic, antipyretic, and NSAID medications"},
                {"Cardiovascular & Antihypertensives", "Heart, blood pressure, and lipid management"},
                {"Diabetes & Endocrine Care", "Insulin, oral antidiabetics, and metabolic agents"},
                {"Respiratory & Pulmonary Care", "Bronchodilators, inhalers, and anti-asthmatics"},
                {"Gastroenterology & GI Care", "Proton pump inhibitors, antacids, and GI drugs"},
                {"Neuro-Psychiatry", "Anticonvulsants, antidepressants, and psychiatric drugs"},
                {"Dermatology & Skincare", "Topical creams, ointments, and dermatological agents"},
                {"Ophthalmology & ENT", "Eye and ear drops, nasal sprays, and otic solutions"},
                {"Oncology & Critical Care", "Chemotherapy, resuscitation, and emergency drugs"},
                {"Pediatrics & Women's Health", "Hormones, prenatal care, and pediatric suspensions"},
                {"Vitamins & Clinical Nutrition", "Essential multivitamin and mineral supplements"}
        };

        Map<String, Category> map = new LinkedHashMap<>();
        for (String[] def : catDefs) {
            Category cat = categoryRepository.save(Category.builder()
                    .name(def[0])
                    .description(def[1])
                    .build());
            map.put(def[0], cat);
        }
        return map;
    }

    private List<Supplier> seedEnterpriseSuppliers() {
        String[][] supDefs = {
                {"SUP-101", "Apex Health Pharma Distributors", "Dr. Jane Smith", "+1 800-555-0199", "orders@apexhealth.com", "100 BioTech Way", "Boston", "MA", "USA"},
                {"SUP-102", "Global Care Bio-Logistics", "Mark Taylor", "+1 800-555-0244", "supply@globalcare.com", "450 Pharma Park", "New York", "NY", "USA"},
                {"SUP-103", "Cipla Healthcare Corp", "Rajesh Sharma", "+91 22-6644-8000", "orders@cipla.com", "Cipla House, Lower Parel", "Mumbai", "MH", "India"},
                {"SUP-104", "Sun Pharmaceutical Industries", "Anil Mehta", "+91 22-4324-4324", "supply@sunpharma.com", "Sun House, Goregaon", "Mumbai", "MH", "India"},
                {"SUP-105", "Pfizer Global Logistics", "David Miller", "+1 212-733-2323", "distrib@pfizer.com", "235 East 42nd Street", "New York", "NY", "USA"},
                {"SUP-106", "Dr. Reddy's Laboratories", "Suresh Kumar", "+91 40-4900-2900", "sales@drreddys.com", "7-1-27 Ameerpet", "Hyderabad", "TS", "India"},
                {"SUP-107", "Novartis Pharma Supply", "Claire Dubois", "+41 61-324-1111", "contact@novartis.com", "Novartis Campus", "Basel", "BS", "Switzerland"},
                {"SUP-108", "Sanofi Aventis Bio-Distributors", "Jean Dupont", "+33 1-5377-4000", "supply@sanofi.com", "54 Rue La Boétie", "Paris", "IDF", "France"},
                {"SUP-109", "AstraZeneca Supply Chain", "Emma Watson", "+44 20-3749-5000", "orders@astrazeneca.com", "1 Francis Crick Ave", "Cambridge", "CB", "UK"},
                {"SUP-110", "GlaxoSmithKline Healthcare", "Robert Johnson", "+44 20-8047-5000", "supply@gsk.com", "980 Great West Rd", "Brentford", "MD", "UK"},
                {"SUP-111", "Bayer Pharma Logistics", "Hans Mueller", "+49 214-301", "orders@bayer.com", "Kaiser-Wilhelm-Allee 1", "Leverkusen", "NRW", "Germany"},
                {"SUP-112", "Abbott Laboratories Supply", "Michael Brown", "+1 224-667-6100", "orders@abbott.com", "100 Abbott Park Rd", "Abbott Park", "IL", "USA"},
                {"SUP-113", "Lupin Pharmaceuticals Ltd", "Priya Nair", "+91 22-6640-2222", "sales@lupin.com", "Kalpataru Inspire, Santacruz", "Mumbai", "MH", "India"},
                {"SUP-114", "Glenmark Pharmaceuticals", "Vikram Malhotra", "+91 22-4018-9999", "orders@glenmarkpharma.com", "Glenmark House, Andheri", "Mumbai", "MH", "India"},
                {"SUP-115", "Torrent Pharmaceuticals", "Sanjay Patel", "+91 79-2686-6666", "supply@torrentpharma.com", "Torrent House, Ashram Rd", "Ahmedabad", "GJ", "India"},
                {"SUP-116", "Alkem Laboratories Ltd", "Rakesh Verma", "+91 22-3982-9999", "sales@alkem.com", "Alkem House, Senapati Bapat Marg", "Mumbai", "MH", "India"},
                {"SUP-117", "Mankind Pharma Ltd", "Arun Gupta", "+91 11-4654-1111", "orders@mankindpharma.com", "208 Okhla Industrial Estate", "New Delhi", "DL", "India"},
                {"SUP-118", "Zydus Lifesciences", "Ketan Shah", "+91 79-4804-0000", "supply@zyduslife.com", "Zydus Corporate Park", "Ahmedabad", "GJ", "India"},
                {"SUP-119", "Micro Labs Limited", "Deepak Joshi", "+91 80-2225-1501", "orders@microlabs.in", "31 Race Course Road", "Bengaluru", "KA", "India"},
                {"SUP-120", "Biocon Biologics Supply", "Kiran Mazumdar", "+91 80-2808-2808", "orders@biocon.com", "20th KM Hosur Road", "Bengaluru", "KA", "India"},
                {"SUP-121", "Aurobindo Pharma Ltd", "Venkatesh Rao", "+91 40-6672-5000", "info@aurobindo.com", "Water Mark Building, Hitech City", "Hyderabad", "TS", "India"},
                {"SUP-122", "Intas Pharmaceuticals", "Hitesh Patel", "+91 79-6157-7000", "supply@intaspharma.com", "Corporate House, Sola Road", "Ahmedabad", "GJ", "India"},
                {"SUP-123", "Mylan Laboratories (Viatris)", "Andrew Smith", "+1 724-514-1800", "orders@viatris.com", "1000 Mylan Boulevard", "Canonsburg", "PA", "USA"},
                {"SUP-124", "Teva Pharmaceutical Supply", "Yossi Cohen", "+972 3-926-7267", "orders@tevapharm.com", "124 Dvora HaNevi'a St", "Tel Aviv", "TA", "Israel"},
                {"SUP-125", "Hikma Pharmaceuticals", "Said Darwazah", "+44 20-7399-2760", "supply@hikma.com", "1 Hanover Square", "London", "LD", "UK"},
                {"SUP-126", "Fresenius Kabi Logistics", "Stefan Richter", "+49 6172-6860", "orders@fresenius-kabi.com", "Else-Kröner-Straße 1", "Bad Homburg", "HE", "Germany"},
                {"SUP-127", "Baxter Healthcare Corp", "John Smith", "+1 224-948-2000", "supply@baxter.com", "One Baxter Parkway", "Deerfield", "IL", "USA"},
                {"SUP-128", "Eli Lilly & Company Logistics", "David Ricks", "+1 317-276-2000", "orders@lilly.com", "Lilly Corporate Center", "Indianapolis", "IN", "USA"},
                {"SUP-129", "Boehringer Ingelheim", "Hubertus von Baumbach", "+49 6132-770", "supply@boehringer.com", "Binger Straße 173", "Ingelheim", "RP", "Germany"},
                {"SUP-130", "Merck Sharp & Dohme (MSD)", "Kenneth Frazier", "+1 908-740-4000", "orders@merck.com", "2000 Galloping Hill Rd", "Kenilworth", "NJ", "USA"}
        };

        List<Supplier> list = new ArrayList<>();
        for (String[] s : supDefs) {
            Supplier supplier = supplierRepository.save(Supplier.builder()
                    .supplierCode(s[0])
                    .supplierName(s[1])
                    .contactPerson(s[2])
                    .phone(s[3])
                    .email(s[4])
                    .address(s[5])
                    .city(s[6])
                    .state(s[7])
                    .country(s[8])
                    .build());
            list.add(supplier);
        }
        return list;
    }

    private void seedMedicinesAndInventory(Map<String, Category> catMap) {
        String[] mfrs = {
                "Pfizer", "Cipla", "Sun Pharma", "Dr. Reddy's", "Abbott",
                "Lupin", "Glenmark", "Torrent", "Alkem", "Mankind",
                "Zydus", "GSK", "Novartis", "Sanofi", "Bayer", "AstraZeneca"
        };

        List<String[]> medSpecs = getMaster250ConciseMedicineSpecs();
        log.info("Persisting {} concise real-world medicines across 12 major categories...", medSpecs.size());

        List<Medicine> medicinesList = new ArrayList<>();
        int codeCounter = 1001;

        for (String[] spec : medSpecs) {
            String conciseName = spec[0]; // e.g. "Amoxicillin 500 mg"
            String generic = spec[1];
            String categoryName = spec[2];
            String dosageForm = spec[3]; // e.g. "Capsule"
            double price = Double.parseDouble(spec[4]);
            int minStock = Integer.parseInt(spec[5]);
            String mfr = mfrs[(codeCounter - 1001) % mfrs.length];

            Category cat = catMap.getOrDefault(categoryName, catMap.values().iterator().next());

            boolean rxRequired = !("Vitamins & Clinical Nutrition".equals(categoryName)
                    || "Dermatology & Skincare".equals(categoryName)
                    || conciseName.contains("Paracetamol")
                    || conciseName.contains("Crocin")
                    || conciseName.contains("Dolo")
                    || conciseName.contains("Calamine")
                    || conciseName.contains("Shampoo"));

            Medicine med = Medicine.builder()
                    .medicineCode("MED-" + codeCounter++)
                    .name(conciseName)
                    .genericName(generic)
                    .manufacturer(mfr)
                    .dosage(dosageForm)
                    .unitPrice(BigDecimal.valueOf(price))
                    .reorderLevel(minStock)
                    .description(dosageForm + " formulation of " + generic + " by " + mfr)
                    .status("ACTIVE")
                    .prescriptionRequired(rxRequired)
                    .category(cat)
                    .build();

            medicinesList.add(med);
        }

        List<Medicine> savedMedicines = medicineRepository.saveAll(medicinesList);
        log.info("Saved {} medicines. Generating exactly 1:1 matching inventory batch records...", savedMedicines.size());

        LocalDate today = LocalDate.now();
        List<Inventory> inventoryBatch = new ArrayList<>();

        for (int i = 0; i < savedMedicines.size(); i++) {
            Medicine med = savedMedicines.get(i);
            int qty;
            int minStock = med.getReorderLevel();
            LocalDate expiry;
            String location;

            if (i < 5) {
                // Out of Stock (5 medicines)
                qty = 0;
                expiry = today.plusDays(150 + i * 30);
                location = "Shelf A-" + String.format("%02d", i + 1);
            } else if (i < 15) {
                // Critical Stock (10 medicines)
                qty = (i % 5) + 1; // 1 to 5 units
                expiry = today.plusDays(180 + i * 20);
                location = "Cold Storage F-" + String.format("%02d", (i - 5) + 1);
            } else if (i < 40) {
                // Low Stock (25 medicines)
                qty = Math.min(minStock - 2, 12 + (i % 10));
                expiry = today.plusDays(200 + i * 15);
                location = "Shelf B-" + String.format("%02d", (i - 15) + 1);
            } else if (i < 48) {
                // Expiring within 30 days (8 medicines)
                qty = 60 + (i % 20);
                expiry = today.plusDays((i - 40) * 3 + 4); // 4 to 25 days
                location = "Vault C-" + String.format("%02d", (i - 40) + 1);
            } else if (i < 63) {
                // Expiring within 31-90 days (15 medicines)
                qty = 80 + (i % 30);
                expiry = today.plusDays((i - 48) * 3 + 35); // 35 to 80 days
                location = "Shelf D-" + String.format("%02d", (i - 48) + 1);
            } else {
                // Healthy Stock (remaining ~187 medicines)
                qty = 120 + ((i * 17) % 380);
                expiry = today.plusDays(365 + ((i * 13) % 730)); // 1 to 3 years
                location = "Shelf E-" + String.format("%02d", (i % 30) + 1);
            }

            Inventory inv = Inventory.builder()
                    .medicine(med)
                    .quantity(qty)
                    .minimumStock(minStock)
                    .batchNumber("BAT-2026-" + String.format("%03d", i + 1))
                    .expiryDate(expiry)
                    .storageLocation(location)
                    .build();

            inventoryBatch.add(inv);
        }

        inventoryRepository.saveAll(inventoryBatch);
        log.info("Saved exactly {} matching inventory batch records!", inventoryBatch.size());
    }

    private void seedPurchaseOrders(List<Supplier> suppliers) {
        if (suppliers.isEmpty()) return;

        log.info("Generating 100 enterprise purchase orders...");

        String[] statuses = {"RECEIVED", "APPROVED", "PENDING", "CANCELLED"};
        Random random = new Random(42);

        List<Object[]> poBatch = new ArrayList<>();

        for (int i = 1; i <= 100; i++) {
            Supplier sup = suppliers.get(i % suppliers.size());
            String orderNum = "PO-2026-" + String.format("%03d", i);
            LocalDate orderDate = LocalDate.now().minusDays(random.nextInt(90));
            LocalDate deliveryDate = orderDate.plusDays(random.nextInt(10) + 3);
            String status = statuses[random.nextInt(statuses.length)];
            double totalAmount = 1500.00 + random.nextInt(8500);

            poBatch.add(new Object[]{sup.getId(), orderNum, orderDate, deliveryDate, status, totalAmount});
        }

        jdbcTemplate.batchUpdate(
                "INSERT INTO purchase_orders (supplier_id, order_number, order_date, expected_delivery, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)",
                poBatch
        );

        List<Long> poIds = jdbcTemplate.queryForList("SELECT id FROM purchase_orders ORDER BY id ASC", Long.class);
        List<Long> medicineIds = jdbcTemplate.queryForList("SELECT id FROM medicines", Long.class);

        if (poIds.isEmpty() || medicineIds.isEmpty()) return;

        List<Object[]> poiBatch = new ArrayList<>();
        for (Long poId : poIds) {
            int itemCols = random.nextInt(3) + 2;
            for (int k = 0; k < itemCols; k++) {
                Long medId = medicineIds.get(random.nextInt(medicineIds.size()));
                int qty = (random.nextInt(20) + 1) * 20;
                double price = 10.0 + random.nextInt(40);
                double subtotal = qty * price;
                poiBatch.add(new Object[]{poId, medId, qty, price, subtotal});
            }
        }

        jdbcTemplate.batchUpdate(
                "INSERT INTO purchase_order_items (purchase_order_id, medicine_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)",
                poiBatch
        );

        log.info("Successfully seeded 100 Purchase Orders and {} PO Items.", poiBatch.size());
    }

    private List<String[]> getMaster250ConciseMedicineSpecs() {
        // Format: {ConciseName, GenericName, CategoryName, DosageForm, UnitPrice, MinimumStock}
        List<String[]> list = new ArrayList<>();

        // 1. Antibiotics & Anti-infectives (22)
        list.add(new String[]{"Amoxicillin 500 mg", "Amoxicillin Trihydrate", "Antibiotics & Anti-infectives", "Capsule", "14.50", "50"});
        list.add(new String[]{"Azithromycin 250 mg", "Azithromycin", "Antibiotics & Anti-infectives", "Tablet", "16.40", "20"});
        list.add(new String[]{"Ciprofloxacin 500 mg", "Ciprofloxacin HCl", "Antibiotics & Anti-infectives", "Tablet", "18.90", "30"});
        list.add(new String[]{"Ceftriaxone 1 g", "Ceftriaxone Sodium", "Antibiotics & Anti-infectives", "Injection", "45.00", "25"});
        list.add(new String[]{"Augmentin 625 mg", "Amoxicillin + Clavulanate", "Antibiotics & Anti-infectives", "Tablet", "28.50", "40"});
        list.add(new String[]{"Doxycycline 100 mg", "Doxycycline Hyclate", "Antibiotics & Anti-infectives", "Capsule", "12.00", "30"});
        list.add(new String[]{"Levofloxacin 500 mg", "Levofloxacin", "Antibiotics & Anti-infectives", "Tablet", "22.50", "25"});
        list.add(new String[]{"Metronidazole 400 mg", "Metronidazole", "Antibiotics & Anti-infectives", "Tablet", "8.50", "50"});
        list.add(new String[]{"Clarithromycin 500 mg", "Clarithromycin", "Antibiotics & Anti-infectives", "Tablet", "34.00", "20"});
        list.add(new String[]{"Meropenem 1 g", "Meropenem", "Antibiotics & Anti-infectives", "Injection", "95.00", "15"});
        list.add(new String[]{"Vancomycin 500 mg", "Vancomycin HCl", "Antibiotics & Anti-infectives", "Injection", "82.00", "10"});
        list.add(new String[]{"Piperacillin-Tazobactam 4.5 g", "Piperacillin + Tazobactam", "Antibiotics & Anti-infectives", "Infusion", "120.00", "15"});
        list.add(new String[]{"Cefuroxime 500 mg", "Cefuroxime Axetil", "Antibiotics & Anti-infectives", "Tablet", "38.00", "25"});
        list.add(new String[]{"Nitrofurantoin 100 mg", "Nitrofurantoin", "Antibiotics & Anti-infectives", "Capsule", "19.50", "30"});
        list.add(new String[]{"Linezolid 600 mg", "Linezolid", "Antibiotics & Anti-infectives", "Tablet", "65.00", "15"});
        list.add(new String[]{"Fluconazole 150 mg", "Fluconazole", "Antibiotics & Anti-infectives", "Tablet", "15.00", "35"});
        list.add(new String[]{"Itraconazole 100 mg", "Itraconazole", "Antibiotics & Anti-infectives", "Capsule", "42.00", "25"});
        list.add(new String[]{"Acyclovir 400 mg", "Acyclovir", "Antibiotics & Anti-infectives", "Tablet", "16.00", "30"});
        list.add(new String[]{"Valacyclovir 500 mg", "Valacyclovir HCl", "Antibiotics & Anti-infectives", "Tablet", "45.00", "20"});
        list.add(new String[]{"Oseltamivir 75 mg", "Oseltamivir Phosphate", "Antibiotics & Anti-infectives", "Capsule", "55.00", "20"});
        list.add(new String[]{"Remdesivir 100 mg", "Remdesivir", "Antibiotics & Anti-infectives", "Injection", "120.00", "10"});
        list.add(new String[]{"Voriconazole 200 mg", "Voriconazole", "Antibiotics & Anti-infectives", "Tablet", "110.00", "10"});

        // 2. Analgesics & Pain Management (22)
        list.add(new String[]{"Paracetamol 650 mg", "Acetaminophen", "Analgesics & Pain Management", "Tablet", "8.20", "50"});
        list.add(new String[]{"Ibuprofen 400 mg", "Ibuprofen", "Analgesics & Pain Management", "Tablet", "9.50", "30"});
        list.add(new String[]{"Dolo 650 mg", "Paracetamol", "Analgesics & Pain Management", "Tablet", "6.50", "100"});
        list.add(new String[]{"Crocin 500 mg", "Paracetamol", "Analgesics & Pain Management", "Tablet", "5.80", "80"});
        list.add(new String[]{"Tramadol 50 mg", "Tramadol HCl", "Analgesics & Pain Management", "Capsule", "18.00", "30"});
        list.add(new String[]{"Naproxen 500 mg", "Naproxen Sodium", "Analgesics & Pain Management", "Tablet", "16.50", "25"});
        list.add(new String[]{"Diclofenac 50 mg", "Diclofenac Sodium", "Analgesics & Pain Management", "Tablet", "10.00", "40"});
        list.add(new String[]{"Celecoxib 200 mg", "Celecoxib", "Analgesics & Pain Management", "Capsule", "29.00", "20"});
        list.add(new String[]{"Etoricoxib 90 mg", "Etoricoxib", "Analgesics & Pain Management", "Tablet", "24.00", "25"});
        list.add(new String[]{"Ketorolac 10 mg", "Ketorolac Tromethamine", "Analgesics & Pain Management", "Tablet", "14.00", "20"});
        list.add(new String[]{"Piroxicam 20 mg", "Piroxicam", "Analgesics & Pain Management", "Capsule", "12.50", "25"});
        list.add(new String[]{"Aceclofenac 100 mg", "Aceclofenac", "Analgesics & Pain Management", "Tablet", "11.00", "40"});
        list.add(new String[]{"Mefenamic Acid 500 mg", "Mefenamic Acid", "Analgesics & Pain Management", "Tablet", "12.00", "30"});
        list.add(new String[]{"Codeine Phosphate 30 mg", "Codeine Phosphate", "Analgesics & Pain Management", "Tablet", "22.00", "15"});
        list.add(new String[]{"Buprenorphine 2 mg", "Buprenorphine", "Analgesics & Pain Management", "Sublingual", "45.00", "10"});
        list.add(new String[]{"Hydromorphone 2 mg", "Hydromorphone HCl", "Analgesics & Pain Management", "Tablet", "32.00", "15"});
        list.add(new String[]{"Morphine Sulfate 10 mg", "Morphine ER", "Analgesics & Pain Management", "Tablet", "40.00", "15"});
        list.add(new String[]{"Fentanyl Patch 25 mcg", "Fentanyl", "Analgesics & Pain Management", "Patch", "85.00", "10"});
        list.add(new String[]{"Calpol 250 mg Syrup", "Paracetamol", "Analgesics & Pain Management", "Syrup", "14.00", "40"});
        list.add(new String[]{"Paracetamol IV 1 g", "Paracetamol", "Analgesics & Pain Management", "Infusion", "32.00", "20"});
        list.add(new String[]{"Nimesulide 100 mg", "Nimesulide", "Analgesics & Pain Management", "Tablet", "8.00", "50"});
        list.add(new String[]{"Analgin 500 mg", "Metamizole Sodium", "Analgesics & Pain Management", "Injection", "15.00", "25"});

        // 3. Cardiovascular & Antihypertensives (22)
        list.add(new String[]{"Atorvastatin 20 mg", "Atorvastatin Calcium", "Cardiovascular & Antihypertensives", "Tablet", "22.00", "40"});
        list.add(new String[]{"Losartan 50 mg", "Losartan Potassium", "Cardiovascular & Antihypertensives", "Tablet", "19.50", "35"});
        list.add(new String[]{"Amlodipine 5 mg", "Amlodipine Besylate", "Cardiovascular & Antihypertensives", "Tablet", "13.20", "30"});
        list.add(new String[]{"Telmisartan 40 mg", "Telmisartan", "Cardiovascular & Antihypertensives", "Tablet", "21.00", "40"});
        list.add(new String[]{"Metoprolol ER 50 mg", "Metoprolol Succinate", "Cardiovascular & Antihypertensives", "Tablet", "25.00", "30"});
        list.add(new String[]{"Rosuvastatin 10 mg", "Rosuvastatin Calcium", "Cardiovascular & Antihypertensives", "Tablet", "28.00", "35"});
        list.add(new String[]{"Enalapril 5 mg", "Enalapril Maleate", "Cardiovascular & Antihypertensives", "Tablet", "11.50", "30"});
        list.add(new String[]{"Ramipril 2.5 mg", "Ramipril", "Cardiovascular & Antihypertensives", "Capsule", "16.00", "25"});
        list.add(new String[]{"Clopidogrel 75 mg", "Clopidogrel Bisulfate", "Cardiovascular & Antihypertensives", "Tablet", "34.00", "40"});
        list.add(new String[]{"Ecosprin 75 mg", "Aspirin", "Cardiovascular & Antihypertensives", "Tablet", "7.00", "60"});
        list.add(new String[]{"Nebivolol 5 mg", "Nebivolol HCl", "Cardiovascular & Antihypertensives", "Tablet", "26.50", "25"});
        list.add(new String[]{"Olmesartan 20 mg", "Olmesartan Medoxomil", "Cardiovascular & Antihypertensives", "Tablet", "23.00", "30"});
        list.add(new String[]{"Hydrochlorothiazide 12.5 mg", "Hydrochlorothiazide", "Cardiovascular & Antihypertensives", "Tablet", "9.00", "40"});
        list.add(new String[]{"Spironolactone 25 mg", "Spironolactone", "Cardiovascular & Antihypertensives", "Tablet", "15.00", "30"});
        list.add(new String[]{"Nitroglycerin 0.4 mg", "Nitroglycerin", "Cardiovascular & Antihypertensives", "Sublingual", "38.00", "15"});
        list.add(new String[]{"Hydralazine 25 mg", "Hydralazine HCl", "Cardiovascular & Antihypertensives", "Tablet", "14.00", "30"});
        list.add(new String[]{"Isosorbide 30 mg ER", "Isosorbide Mononitrate", "Cardiovascular & Antihypertensives", "Tablet", "18.50", "30"});
        list.add(new String[]{"Labetalol 100 mg", "Labetalol HCl", "Cardiovascular & Antihypertensives", "Tablet", "21.00", "25"});
        list.add(new String[]{"Furosemide 20 mg", "Furosemide", "Cardiovascular & Antihypertensives", "Injection", "8.00", "30"});
        list.add(new String[]{"Amiodarone 150 mg", "Amiodarone HCl", "Cardiovascular & Antihypertensives", "Injection", "48.00", "15"});
        list.add(new String[]{"Heparin 5000 IU", "Heparin Sodium", "Cardiovascular & Antihypertensives", "Injection", "55.00", "15"});
        list.add(new String[]{"Carvedilol 6.25 mg", "Carvedilol", "Cardiovascular & Antihypertensives", "Tablet", "16.00", "30"});

        // 4. Diabetes & Endocrine Care (22)
        list.add(new String[]{"Insulin Glargine 100 IU", "Insulin Glargine", "Diabetes & Endocrine Care", "Vial", "48.50", "20"});
        list.add(new String[]{"Metformin ER 500 mg", "Metformin HCl", "Diabetes & Endocrine Care", "Tablet", "11.80", "50"});
        list.add(new String[]{"Glimepiride 2 mg", "Glimepiride", "Diabetes & Endocrine Care", "Tablet", "14.50", "40"});
        list.add(new String[]{"Sitagliptin 100 mg", "Sitagliptin Phosphate", "Diabetes & Endocrine Care", "Tablet", "42.00", "30"});
        list.add(new String[]{"Empagliflozin 10 mg", "Empagliflozin", "Diabetes & Endocrine Care", "Tablet", "49.00", "25"});
        list.add(new String[]{"Dapagliflozin 10 mg", "Dapagliflozin", "Diabetes & Endocrine Care", "Tablet", "46.00", "25"});
        list.add(new String[]{"Vildagliptin 50 mg", "Vildagliptin", "Diabetes & Endocrine Care", "Tablet", "31.00", "30"});
        list.add(new String[]{"Human Insulin NPH 100 IU", "Isophane Insulin", "Diabetes & Endocrine Care", "Vial", "35.00", "20"});
        list.add(new String[]{"Regular Insulin 100 IU", "Soluble Insulin", "Diabetes & Endocrine Care", "Vial", "32.00", "20"});
        list.add(new String[]{"Pioglitazone 15 mg", "Pioglitazone HCl", "Diabetes & Endocrine Care", "Tablet", "18.00", "30"});
        list.add(new String[]{"Teneligliptin 20 mg", "Teneligliptin HBr", "Diabetes & Endocrine Care", "Tablet", "26.00", "35"});
        list.add(new String[]{"Linagliptin 5 mg", "Linagliptin", "Diabetes & Endocrine Care", "Tablet", "52.00", "20"});
        list.add(new String[]{"Gliclazide 80 mg", "Gliclazide", "Diabetes & Endocrine Care", "Tablet", "16.50", "30"});
        list.add(new String[]{"Acarbose 50 mg", "Acarbose", "Diabetes & Endocrine Care", "Tablet", "21.00", "25"});
        list.add(new String[]{"Semaglutide 3 mg", "Semaglutide", "Diabetes & Endocrine Care", "Tablet", "180.00", "10"});
        list.add(new String[]{"Levothyroxine 50 mcg", "Levothyroxine Sodium", "Diabetes & Endocrine Care", "Tablet", "8.00", "50"});
        list.add(new String[]{"Levothyroxine 100 mcg", "Levothyroxine Sodium", "Diabetes & Endocrine Care", "Tablet", "9.50", "50"});
        list.add(new String[]{"Carbimazole 5 mg", "Carbimazole", "Diabetes & Endocrine Care", "Tablet", "14.00", "30"});
        list.add(new String[]{"Methimazole 10 mg", "Methimazole", "Diabetes & Endocrine Care", "Tablet", "16.00", "25"});
        list.add(new String[]{"Propylthiouracil 50 mg", "Propylthiouracil", "Diabetes & Endocrine Care", "Tablet", "21.00", "20"});
        list.add(new String[]{"Hydrocortisone 10 mg", "Hydrocortisone", "Diabetes & Endocrine Care", "Tablet", "12.00", "30"});
        list.add(new String[]{"Glucagon Kit 1 mg", "Glucagon Recombinant", "Diabetes & Endocrine Care", "Injection", "145.00", "10"});

        // 5. Respiratory & Pulmonary Care (20)
        list.add(new String[]{"Salbutamol Inhaler 100 mcg", "Albuterol Sulfate", "Respiratory & Pulmonary Care", "Inhaler", "24.00", "25"});
        list.add(new String[]{"Budesonide Inhaler 200 mcg", "Budesonide", "Respiratory & Pulmonary Care", "Inhaler", "36.00", "20"});
        list.add(new String[]{"Montelukast 10 mg", "Montelukast Sodium", "Respiratory & Pulmonary Care", "Tablet", "22.50", "35"});
        list.add(new String[]{"Formoterol + Budesonide 400", "Formoterol + Budesonide", "Respiratory & Pulmonary Care", "Rotacap", "42.00", "25"});
        list.add(new String[]{"Ipratropium Inhaler 20 mcg", "Ipratropium Bromide", "Respiratory & Pulmonary Care", "Inhaler", "28.00", "20"});
        list.add(new String[]{"Tiotropium Rotacaps 18 mcg", "Tiotropium Bromide", "Respiratory & Pulmonary Care", "Capsule", "48.00", "15"});
        list.add(new String[]{"Acebrophylline 100 mg", "Acebrophylline", "Respiratory & Pulmonary Care", "Capsule", "19.00", "30"});
        list.add(new String[]{"Levosalbutamol Respules 1.25 mg", "Levosalbutamol", "Respiratory & Pulmonary Care", "Respule", "16.00", "40"});
        list.add(new String[]{"Fexofenadine 120 mg", "Fexofenadine HCl", "Respiratory & Pulmonary Care", "Tablet", "18.00", "30"});
        list.add(new String[]{"Ambroxol Syrup 30 mg/5ml", "Ambroxol HCl", "Respiratory & Pulmonary Care", "Syrup", "14.50", "35"});
        list.add(new String[]{"Dextromethorphan Cough Syrup", "Dextromethorphan HBr", "Respiratory & Pulmonary Care", "Syrup", "12.00", "40"});
        list.add(new String[]{"Terbutaline 2.5 mg", "Terbutaline Sulfate", "Respiratory & Pulmonary Care", "Tablet", "9.50", "30"});
        list.add(new String[]{"Cetirizine 10 mg", "Cetirizine HCl", "Respiratory & Pulmonary Care", "Tablet", "7.50", "40"});
        list.add(new String[]{"Loratadine 10 mg", "Loratadine", "Respiratory & Pulmonary Care", "Tablet", "11.00", "35"});
        list.add(new String[]{"Hydroxyzine 25 mg", "Hydroxyzine HCl", "Respiratory & Pulmonary Care", "Tablet", "15.00", "30"});
        list.add(new String[]{"Budesonide Respules 0.5 mg", "Budesonide", "Respiratory & Pulmonary Care", "Respule", "25.00", "25"});
        list.add(new String[]{"Acetylcysteine 600 mg", "Acetylcysteine", "Respiratory & Pulmonary Care", "Tablet", "22.00", "20"});
        list.add(new String[]{"Theophylline 400 mg ER", "Theophylline", "Respiratory & Pulmonary Care", "Tablet", "14.00", "25"});
        list.add(new String[]{"Phenylephrine Drops 0.5%", "Phenylephrine HCl", "Respiratory & Pulmonary Care", "Drops", "10.00", "30"});
        list.add(new String[]{"Chlorpheniramine 4 mg", "Chlorpheniramine Maleate", "Respiratory & Pulmonary Care", "Tablet", "5.00", "50"});

        // Populate remaining 144 concise medicines across categories 6 to 12
        populateRemainingConciseMedicines(list);

        return list;
    }

    private void populateRemainingConciseMedicines(List<String[]> list) {
        String[][] remainingMeds = {
                // 6. Gastroenterology & GI Care (20)
                {"Pantoprazole 40 mg", "Pantoprazole Sodium", "Gastroenterology & GI Care", "Tablet", "16.00", "40"},
                {"Rabeprazole 20 mg", "Rabeprazole Sodium", "Gastroenterology & GI Care", "Tablet", "18.50", "35"},
                {"Omeprazole 20 mg", "Omeprazole", "Gastroenterology & GI Care", "Capsule", "15.00", "30"},
                {"Domperidone 10 mg", "Domperidone", "Gastroenterology & GI Care", "Tablet", "10.00", "45"},
                {"Ondansetron 4 mg", "Ondansetron HCl", "Gastroenterology & GI Care", "Tablet", "14.00", "40"},
                {"Sucralfate 1 g Syrup", "Sucralfate", "Gastroenterology & GI Care", "Syrup", "32.00", "25"},
                {"Loperamide 2 mg", "Loperamide HCl", "Gastroenterology & GI Care", "Capsule", "8.50", "50"},
                {"Esomeprazole 40 mg", "Esomeprazole Magnesium", "Gastroenterology & GI Care", "Tablet", "26.00", "30"},
                {"Lactulose Syrup 10 g/15ml", "Lactulose", "Gastroenterology & GI Care", "Liquid", "28.00", "20"},
                {"Dicyclomine 20 mg", "Dicyclomine HCl", "Gastroenterology & GI Care", "Tablet", "12.00", "35"},
                {"Mesalamine 1.2 g", "Mesalamine (5-ASA)", "Gastroenterology & GI Care", "Tablet", "75.00", "15"},
                {"Ursodeoxycholic Acid 300 mg", "Ursodiol", "Gastroenterology & GI Care", "Tablet", "62.00", "15"},
                {"Metoclopramide 10 mg", "Metoclopramide HCl", "Gastroenterology & GI Care", "Tablet", "7.50", "40"},
                {"Ranitidine 150 mg", "Ranitidine HCl", "Gastroenterology & GI Care", "Tablet", "9.00", "40"},
                {"Famotidine 20 mg", "Famotidine", "Gastroenterology & GI Care", "Tablet", "11.00", "35"},
                {"Hyoscine Butylbromide 10 mg", "Hyoscine Butylbromide", "Gastroenterology & GI Care", "Tablet", "13.50", "30"},
                {"Bisacodyl 5 mg", "Bisacodyl", "Gastroenterology & GI Care", "Tablet", "6.00", "50"},
                {"Liquid Paraffin + Milk of Magnesia", "Magnesium Hydroxide", "Gastroenterology & GI Care", "Syrup", "18.00", "30"},
                {"Orlistat 120 mg", "Orlistat", "Gastroenterology & GI Care", "Capsule", "85.00", "15"},
                {"Pancreatin 10,000 IU", "Pancreatin Enzymes", "Gastroenterology & GI Care", "Capsule", "42.00", "20"},

                // 7. Neuro-Psychiatry (20)
                {"Levetiracetam 500 mg", "Levetiracetam", "Neuro-Psychiatry", "Tablet", "34.00", "25"},
                {"Gabapentin 300 mg", "Gabapentin", "Neuro-Psychiatry", "Capsule", "28.00", "30"},
                {"Pregabalin 75 mg", "Pregabalin", "Neuro-Psychiatry", "Capsule", "32.00", "30"},
                {"Sodium Valproate 500 mg", "Sodium Valproate", "Neuro-Psychiatry", "Tablet", "29.00", "25"},
                {"Carbamazepine 200 mg", "Carbamazepine", "Neuro-Psychiatry", "Tablet", "19.00", "30"},
                {"Phenytoin 100 mg", "Phenytoin Sodium", "Neuro-Psychiatry", "Tablet", "14.00", "35"},
                {"Lamotrigine 50 mg", "Lamotrigine", "Neuro-Psychiatry", "Tablet", "26.00", "20"},
                {"Topiramate 50 mg", "Topiramate", "Neuro-Psychiatry", "Tablet", "31.00", "20"},
                {"Donepezil 5 mg", "Donepezil HCl", "Neuro-Psychiatry", "Tablet", "45.00", "15"},
                {"Levodopa + Carbidopa 110 mg", "Levodopa + Carbidopa", "Neuro-Psychiatry", "Tablet", "38.00", "20"},
                {"Escitalopram 10 mg", "Escitalopram Oxalate", "Neuro-Psychiatry", "Tablet", "21.00", "35"},
                {"Sertraline 50 mg", "Sertraline HCl", "Neuro-Psychiatry", "Tablet", "24.00", "30"},
                {"Alprazolam 0.25 mg", "Alprazolam", "Neuro-Psychiatry", "Tablet", "9.00", "40"},
                {"Clonazepam 0.5 mg", "Clonazepam", "Neuro-Psychiatry", "Tablet", "11.00", "40"},
                {"Olanzapine 5 mg", "Olanzapine", "Neuro-Psychiatry", "Tablet", "18.00", "30"},
                {"Quetiapine 50 mg", "Quetiapine Fumarate", "Neuro-Psychiatry", "Tablet", "29.00", "25"},
                {"Fluoxetine 20 mg", "Fluoxetine HCl", "Neuro-Psychiatry", "Capsule", "16.00", "30"},
                {"Risperidone 2 mg", "Risperidone", "Neuro-Psychiatry", "Tablet", "15.00", "35"},
                {"Lorazepam 1 mg", "Lorazepam", "Neuro-Psychiatry", "Tablet", "12.50", "35"},
                {"Aripiprazole 10 mg", "Aripiprazole", "Neuro-Psychiatry", "Tablet", "42.00", "20"},

                // 8. Dermatology & Skincare (20)
                {"Clobetasol Ointment 0.05%", "Clobetasol Propionate", "Dermatology & Skincare", "Ointment", "22.00", "25"},
                {"Mupirocin Ointment 2%", "Mupirocin", "Dermatology & Skincare", "Ointment", "18.00", "30"},
                {"Permethrin Cream 5%", "Permethrin", "Dermatology & Skincare", "Cream", "25.00", "20"},
                {"Tacrolimus Ointment 0.1%", "Tacrolimus", "Dermatology & Skincare", "Ointment", "85.00", "15"},
                {"Isotretinoin 20 mg", "Isotretinoin", "Dermatology & Skincare", "Softgel", "65.00", "15"},
                {"Ketoconazole Shampoo 2%", "Ketoconazole", "Dermatology & Skincare", "Lotion", "32.00", "25"},
                {"Betamethasone Cream 0.1%", "Betamethasone Valerate", "Dermatology & Skincare", "Cream", "14.00", "30"},
                {"Hydrocortisone Cream 1%", "Hydrocortisone Acetate", "Dermatology & Skincare", "Cream", "11.00", "35"},
                {"Adapalene Gel 0.1%", "Adapalene", "Dermatology & Skincare", "Gel", "29.00", "20"},
                {"Calcipotriol Ointment 0.005%", "Calcipotriene", "Dermatology & Skincare", "Ointment", "92.00", "10"},
                {"Clotrimazole Cream 1%", "Clotrimazole", "Dermatology & Skincare", "Cream", "12.00", "40"},
                {"Fusidic Acid Cream 2%", "Fusidic Acid", "Dermatology & Skincare", "Cream", "19.00", "30"},
                {"Benzoyl Peroxide Gel 5%", "Benzoyl Peroxide", "Dermatology & Skincare", "Gel", "16.00", "30"},
                {"Terbinafine Cream 1%", "Terbinafine HCl", "Dermatology & Skincare", "Cream", "21.00", "25"},
                {"Minoxidil Solution 5%", "Minoxidil", "Dermatology & Skincare", "Lotion", "45.00", "20"},
                {"Zinc Oxide Ointment 20%", "Zinc Oxide", "Dermatology & Skincare", "Ointment", "10.00", "35"},
                {"Calamine Lotion 15%", "Calamine + Zinc Oxide", "Dermatology & Skincare", "Lotion", "9.00", "40"},
                {"Coal Tar Shampoo 5%", "Coal Tar", "Dermatology & Skincare", "Lotion", "28.00", "20"},
                {"Salicylic Acid Ointment 6%", "Salicylic Acid", "Dermatology & Skincare", "Ointment", "15.00", "30"},
                {"Econazole Cream 1%", "Econazole Nitrate", "Dermatology & Skincare", "Cream", "18.00", "25"},

                // 9. Ophthalmology & ENT (20)
                {"Moxifloxacin Eye Drops 0.5%", "Moxifloxacin HCl", "Ophthalmology & ENT", "Eye Drops", "22.00", "25"},
                {"Tobramycin Eye Drops 0.3%", "Tobramycin", "Ophthalmology & ENT", "Eye Drops", "16.00", "30"},
                {"Carboxymethylcellulose 0.5%", "Artificial Tears", "Ophthalmology & ENT", "Eye Drops", "18.50", "35"},
                {"Timolol Eye Drops 0.5%", "Timolol Maleate", "Ophthalmology & ENT", "Eye Drops", "21.00", "25"},
                {"Latanoprost Eye Drops 0.005%", "Latanoprost", "Ophthalmology & ENT", "Eye Drops", "78.00", "15"},
                {"Olopatadine Eye Drops 0.1%", "Olopatadine HCl", "Ophthalmology & ENT", "Eye Drops", "26.00", "20"},
                {"Prednisolone Eye Drops 1%", "Prednisolone Acetate", "Ophthalmology & ENT", "Eye Drops", "24.00", "20"},
                {"Cyclopentolate Eye Drops 1%", "Cyclopentolate HCl", "Ophthalmology & ENT", "Eye Drops", "19.00", "20"},
                {"Ofloxacin Ear Drops 0.3%", "Ofloxacin Otic", "Ophthalmology & ENT", "Ear Drops", "15.00", "30"},
                {"Fluticasone Nasal Spray 50mcg", "Fluticasone Furoate", "Ophthalmology & ENT", "Nasal Spray", "45.00", "20"},
                {"Oxymetazoline Spray 0.05%", "Oxymetazoline HCl", "Ophthalmology & ENT", "Nasal Spray", "12.50", "35"},
                {"Xylometazoline Drops 0.1%", "Xylometazoline", "Ophthalmology & ENT", "Nasal Drops", "9.00", "40"},
                {"Waxsoft Ear Drops", "Paradichlorobenzene", "Ophthalmology & ENT", "Ear Drops", "11.00", "30"},
                {"Betahistine 16 mg", "Betahistine Dihydrochloride", "Ophthalmology & ENT", "Tablet", "22.00", "25"},
                {"Cinnarizine 25 mg", "Cinnarizine", "Ophthalmology & ENT", "Tablet", "10.00", "35"},
                {"Acetazolamide 250 mg", "Acetazolamide", "Ophthalmology & ENT", "Tablet", "19.00", "25"},
                {"Brimonidine Eye Drops 0.2%", "Brimonidine Tartrate", "Ophthalmology & ENT", "Eye Drops", "32.00", "20"},
                {"Dorzolamide Eye Drops 2%", "Dorzolamide HCl", "Ophthalmology & ENT", "Eye Drops", "35.00", "20"},
                {"Nepafenac Eye Drops 0.1%", "Nepafenac", "Ophthalmology & ENT", "Eye Drops", "45.00", "20"},
                {"Natamycin Eye Suspension 5%", "Natamycin", "Ophthalmology & ENT", "Eye Drops", "68.00", "15"},

                // 10. Oncology & Critical Care (22)
                {"Paclitaxel 100 mg", "Paclitaxel", "Oncology & Critical Care", "Injection", "160.00", "10"},
                {"Cisplatin 50 mg", "Cisplatin", "Oncology & Critical Care", "Injection", "110.00", "10"},
                {"Doxorubicin 50 mg", "Doxorubicin HCl", "Oncology & Critical Care", "Injection", "135.00", "10"},
                {"Tamoxifen 20 mg", "Tamoxifen Citrate", "Oncology & Critical Care", "Tablet", "35.00", "20"},
                {"Imatinib 400 mg", "Imatinib Mesylate", "Oncology & Critical Care", "Tablet", "175.00", "10"},
                {"Capecitabine 500 mg", "Capecitabine", "Oncology & Critical Care", "Tablet", "98.00", "15"},
                {"Letrozole 2.5 mg", "Letrozole", "Oncology & Critical Care", "Tablet", "42.00", "20"},
                {"Bicalutamide 50 mg", "Bicalutamide", "Oncology & Critical Care", "Tablet", "68.00", "15"},
                {"Adrenaline 1 mg", "Epinephrine", "Oncology & Critical Care", "Injection", "18.00", "20"},
                {"Atropine Sulfate 0.6 mg", "Atropine Sulfate", "Oncology & Critical Care", "Injection", "12.00", "25"},
                {"Dopamine 200 mg", "Dopamine HCl", "Oncology & Critical Care", "Injection", "28.00", "15"},
                {"Norepinephrine 4 mg", "Noradrenaline Bitartrate", "Oncology & Critical Care", "Injection", "42.00", "15"},
                {"Hydrocortisone Succinate 100 mg", "Hydrocortisone Sodium", "Oncology & Critical Care", "Injection", "25.00", "20"},
                {"Naloxone 0.4 mg/ml", "Naloxone HCl", "Oncology & Critical Care", "Injection", "35.00", "20"},
                {"Flumazenil 0.5 mg/5ml", "Flumazenil", "Oncology & Critical Care", "Injection", "48.00", "15"},
                {"Activated Charcoal 50 g", "Activated Charcoal", "Oncology & Critical Care", "Powder", "22.00", "25"},
                {"Magnesium Sulfate 50%", "Magnesium Sulfate", "Oncology & Critical Care", "Injection", "12.00", "30"},
                {"Potassium Chloride 15%", "Potassium Chloride", "Oncology & Critical Care", "Injection", "10.00", "40"},
                {"Calcium Gluconate 10%", "Calcium Gluconate", "Oncology & Critical Care", "Injection", "14.00", "30"},
                {"Hypertonic Saline 3%", "Sodium Chloride 3%", "Oncology & Critical Care", "Infusion", "28.00", "20"},
                {"Dextrose 50% 50ml", "Dextrose 50%", "Oncology & Critical Care", "Injection", "16.00", "30"},
                {"Mannitol 20% 350ml", "Mannitol", "Oncology & Critical Care", "Infusion", "38.00", "20"},

                // 11. Pediatrics & Women's Health (20)
                {"Pediatric Zinc Solution", "Zinc Sulfate 20mg/5ml", "Pediatrics & Women's Health", "Syrup", "11.00", "35"},
                {"Domperidone Drops 10 mg/ml", "Domperidone", "Pediatrics & Women's Health", "Drops", "9.50", "40"},
                {"Pediatric Multivitamin Syrup", "Multivitamins", "Pediatrics & Women's Health", "Syrup", "18.00", "30"},
                {"Simethicone Colic Drops", "Simethicone + Dill Oil", "Pediatrics & Women's Health", "Drops", "10.50", "40"},
                {"Iron + Folic Acid Syrup", "Ferrous Ascorbate + Folic Acid", "Pediatrics & Women's Health", "Syrup", "16.00", "30"},
                {"Cefpodoxime Dry Syrup 50 mg", "Cefpodoxime Proxetil", "Pediatrics & Women's Health", "Suspension", "28.00", "25"},
                {"Azithromycin Suspension 100 mg", "Azithromycin", "Pediatrics & Women's Health", "Suspension", "22.00", "25"},
                {"Ibuprofen + Paracetamol Syrup", "Ibuprofen + Paracetamol", "Pediatrics & Women's Health", "Syrup", "13.00", "35"},
                {"Folic Acid 5 mg", "Folic Acid", "Pediatrics & Women's Health", "Tablet", "6.00", "60"},
                {"Norethisterone 5 mg", "Norethisterone", "Pediatrics & Women's Health", "Tablet", "19.00", "30"},
                {"Combined Contraceptive Pack", "Ethinylestradiol + Levonorgestrel", "Pediatrics & Women's Health", "Pack", "15.00", "40"},
                {"Isoxsuprine SR 40 mg", "Isoxsuprine HCl", "Pediatrics & Women's Health", "Tablet", "25.00", "25"},
                {"Progesterone 200 mg", "Micronized Progesterone", "Pediatrics & Women's Health", "Capsule", "68.00", "15"},
                {"Tranexamic Acid 500 mg", "Tranexamic Acid", "Pediatrics & Women's Health", "Tablet", "34.00", "20"},
                {"Clomiphene Citrate 50 mg", "Clomiphene Citrate", "Pediatrics & Women's Health", "Tablet", "28.00", "20"},
                {"Dinoprostone Gel 0.5 mg", "Dinoprostone", "Pediatrics & Women's Health", "Gel", "85.00", "10"},
                {"Tamsulosin 0.4 mg", "Tamsulosin HCl", "Pediatrics & Women's Health", "Capsule", "24.00", "30"},
                {"Finasteride 5 mg", "Finasteride", "Pediatrics & Women's Health", "Tablet", "28.00", "25"},
                {"Silodosin 8 mg", "Silodosin", "Pediatrics & Women's Health", "Capsule", "35.00", "20"},
                {"Flavoxate 200 mg", "Flavoxate HCl", "Pediatrics & Women's Health", "Tablet", "19.00", "30"},

                // 12. Vitamins & Clinical Nutrition (20)
                {"Vitamin D3 60,000 IU", "Cholecalciferol", "Vitamins & Clinical Nutrition", "Softgel", "16.00", "50"},
                {"Vitamin B Complex + Zinc", "B-Complex + Zinc", "Vitamins & Clinical Nutrition", "Capsule", "12.00", "50"},
                {"Methylcobalamin 1500 mcg", "Vitamin B12", "Vitamins & Clinical Nutrition", "Tablet", "19.00", "40"},
                {"Multivitamin Mineral Syrup", "Multivitamins + Minerals", "Vitamins & Clinical Nutrition", "Syrup", "22.00", "30"},
                {"Omega-3 Fish Oil 1000 mg", "Omega-3 Fatty Acids", "Vitamins & Clinical Nutrition", "Softgel", "28.00", "30"},
                {"Coenzyme Q10 100 mg", "Ubidecarenone (CoQ10)", "Vitamins & Clinical Nutrition", "Softgel", "65.00", "15"},
                {"Alpha Lipoic Acid 100 mg", "Alpha Lipoic Acid", "Vitamins & Clinical Nutrition", "Capsule", "32.00", "20"},
                {"Calcium Citrate Malate 250 mg", "CCM + Vitamin D3", "Vitamins & Clinical Nutrition", "Tablet", "15.00", "35"},
                {"Glucosamine + Chondroitin 750", "Glucosamine + Chondroitin", "Vitamins & Clinical Nutrition", "Tablet", "36.00", "25"},
                {"Calcium + Vitamin D3 500 mg", "Calcium + Vitamin D3", "Vitamins & Clinical Nutrition", "Tablet", "18.00", "40"},
                {"Thiocolchicoside 4 mg", "Thiocolchicoside", "Vitamins & Clinical Nutrition", "Capsule", "24.00", "30"},
                {"Tolperisone 150 mg", "Tolperisone HCl", "Vitamins & Clinical Nutrition", "Tablet", "22.00", "30"},
                {"Baclofen 10 mg", "Baclofen", "Vitamins & Clinical Nutrition", "Tablet", "16.00", "30"},
                {"Diacerein 50 mg", "Diacerein", "Vitamins & Clinical Nutrition", "Capsule", "29.00", "20"},
                {"Hyaluronic Acid Injection 2ml", "Sodium Hyaluronate", "Vitamins & Clinical Nutrition", "Syringe", "140.00", "10"},
                {"Erythropoietin 4000 IU", "Epoetin Alfa", "Vitamins & Clinical Nutrition", "Injection", "85.00", "15"},
                {"Sevelamer Carbonate 800 mg", "Sevelamer Carbonate", "Vitamins & Clinical Nutrition", "Tablet", "62.00", "15"},
                {"Calcium Acetate 667 mg", "Calcium Acetate", "Vitamins & Clinical Nutrition", "Tablet", "18.00", "30"},
                {"Sodium Bicarbonate 500 mg", "Sodium Bicarbonate", "Vitamins & Clinical Nutrition", "Tablet", "8.00", "40"},
                {"Ketoanalogues 600 mg", "Essential Amino Acids", "Vitamins & Clinical Nutrition", "Tablet", "95.00", "10"}
        };

        for (String[] med : remainingMeds) {
            list.add(med);
        }
    }
}
