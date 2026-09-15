package com.medistock.config;

import com.medistock.model.*;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SaleRepository;
import com.medistock.repository.StockMovementRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import com.medistock.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Runs once on every startup:
 *  1) Guarantees exactly one Admin account exists (single-Admin
 *     requirement). Creates a default Admin ONLY if none exists yet;
 *     never inserts a duplicate on subsequent restarts.
 *  2) Backfills an INITIAL_STOCK stock movement for any medicine that
 *     doesn't have one yet (covers medicines inserted directly by
 *     database/seed.sql, which bypasses MedicineService.create()).
 *  3) Once real medicines (from database/seed.sql) and at least one real
 *     Pharmacist/Staff/Admin account exist, bulk-seeds realistic PURCHASE
 *     history (Supplier -> MediStock) and SALES history (MediStock ->
 *     Customer) so every dashboard, chart and history page has substantial
 *     real data instead of empty sections.
 *
 * Requirement 11 ("Do NOT allow: Purchases &gt; 0, Sales &gt; 0, Stock
 * movements = 0 without explanation") is enforced here directly: every
 * seeded purchase and every seeded sale line item writes a matching
 * StockMovement and updates the medicine's running quantity, so
 * opening stock + purchases - sales always equals the final stock, and
 * the Stock Movements page is never empty while Purchases/Sales aren't.
 * Sales are capped to whatever quantity is available at the time they're
 * generated so stock can never go negative during seeding — purchase and
 * sale dates are randomized independently across overlapping windows, so
 * this is a simplification rather than a strict chronological replay, but
 * it guarantees the final quantity always reconciles with the movement
 * history, which is the property requirement 11 actually cares about.
 * All three seeding steps are idempotent — they run once each and never
 * duplicate on later restarts.
 */
@Component
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final String DEFAULT_ADMIN_EMAIL = "admin@medistock.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123";

    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final StockMovementRepository stockMovementRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.core.env.Environment environment;
    private final CategoryService categoryService;

    // Override the bootstrap admin's credentials via env vars so a real
    // deployment never has to keep the well-known admin@medistock.com /
    // Admin@123 pair — set ADMIN_EMAIL / ADMIN_PASSWORD before first startup
    // (only used the very first time, when no Admin account exists yet).
    @org.springframework.beans.factory.annotation.Value("${ADMIN_EMAIL:" + DEFAULT_ADMIN_EMAIL + "}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${ADMIN_PASSWORD:" + DEFAULT_ADMIN_PASSWORD + "}")
    private String adminPassword;

    @org.springframework.beans.factory.annotation.Value("${app.demo-data.enabled:true}")
    private boolean demoDataEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        ensureSingleAdminExists();
        categoryService.seedIfEmpty();
        if (demoDataEnabled) {
            seedFallbackMedicinesIfEmpty();
        }
        // Unconditional even when demo data is off: covers medicines inserted
        // directly by database/seed.sql (or by hand), which is a legitimate
        // thing to do in production too and still needs its audit trail.
        backfillInitialStockMovements();
        if (!demoDataEnabled) {
            log.info("app.demo-data.enabled=false — skipping fallback medicine catalog and synthetic purchase/sales seeding.");
            return;
        }
        Map<Long, Integer> runningStock = seedBulkPurchasesIfPossible();
        seedBulkSalesIfPossible(runningStock);
    }

    /**
     * Safety net for a fresh database. The full 260-medicine demo catalog
     * lives in database/seed.sql, but that file has to be run by hand
     * against MySQL — if nobody has done that yet, spring.jpa.hibernate.ddl-auto
     * still creates an empty medicines table and every screen (Admin's
     * Medicines page, Pharmacist/Staff "New sale" medicine picker, the
     * Purchases form) legitimately has nothing to show. Rather than leave
     * the app looking broken on first run, insert a small starter catalog
     * automatically whenever the medicines table is completely empty. This
     * never runs again once any medicine exists (including one added by
     * hand through the UI), and it defers entirely to database/seed.sql's
     * much larger dataset if that has already been run first.
     */
    private void seedFallbackMedicinesIfEmpty() {
        if (medicineRepository.count() > 0) {
            return;
        }
        System.out.println("MediStock: medicines table is empty — inserting a small starter catalog.");
        System.out.println("MediStock: for the full 260-medicine demo dataset, run database/seed.sql against medistock_db.");

        List<Supplier> suppliers = new ArrayList<>();
        suppliers.add(supplierRepository.save(Supplier.builder()
                .name("Apex Pharma Distributors").contactNumber("9876543210")
                .email("orders@apexpharma.example").address("Plot 12, Industrial Area, Hyderabad").build()));
        suppliers.add(supplierRepository.save(Supplier.builder()
                .name("Sunrise Healthcare Supplies").contactNumber("9876501234")
                .email("sales@sunrisehealth.example").address("MG Road, Bengaluru").build()));
        suppliers.add(supplierRepository.save(Supplier.builder()
                .name("Wellness Wholesale Co.").contactNumber("9998887766")
                .email("contact@wellnesswholesale.example").address("Andheri East, Mumbai").build()));

        record Seed(String name, String category, int qty, int reorder, double price, int supplierIdx, int expiryDays) {}
        List<Seed> seeds = List.of(
                new Seed("Paracetamol 500mg", "Tablet", 400, 50, 2.50, 0, 540),
                new Seed("Amoxicillin 250mg", "Capsule", 180, 40, 6.75, 0, 365),
                new Seed("Cetirizine 10mg", "Tablet", 250, 30, 3.20, 1, 420),
                new Seed("Azithromycin 500mg", "Tablet", 15, 20, 12.00, 1, 300),
                new Seed("Ibuprofen 400mg", "Tablet", 0, 40, 2.90, 0, 240),
                new Seed("Cough Syrup (Dextromethorphan)", "Syrup", 60, 15, 45.00, 2, 20),
                new Seed("Amlodipine 5mg", "Tablet", 320, 40, 4.10, 1, 480),
                new Seed("Metformin 500mg", "Tablet", 275, 50, 3.60, 0, 400),
                new Seed("Insulin Glargine Injection", "Injection", 25, 10, 320.00, 2, 90),
                new Seed("Vitamin D3 60K IU", "Capsule", 140, 25, 8.50, 1, 500),
                new Seed("Omeprazole 20mg", "Capsule", 8, 30, 5.40, 0, 200),
                new Seed("Betamethasone Cream", "Cream", 45, 15, 65.00, 2, 10)
        );

        for (Seed s : seeds) {
            Medicine medicine = Medicine.builder()
                    .name(s.name())
                    .batchNumber("BATCH-" + (1000 + seeds.indexOf(s)))
                    .category(s.category())
                    .supplier(suppliers.get(s.supplierIdx()))
                    .quantity(s.qty())
                    .reorderLevel(s.reorder())
                    .manufacturingDate(java.time.LocalDate.now().minusMonths(6))
                    .expiryDate(java.time.LocalDate.now().plusDays(s.expiryDays()))
                    .price(BigDecimal.valueOf(s.price()))
                    .active(true)
                    .build();
            medicineRepository.save(medicine);
        }
        System.out.println("MediStock: inserted " + seeds.size() + " starter medicines across " + suppliers.size() + " suppliers.");
    }

    private void ensureSingleAdminExists() {
        boolean adminExists = userRepository.findAll().stream().anyMatch(u -> u.getRole() == Role.ADMIN);
        if (adminExists) {
            return;
        }
        User admin = User.builder()
                .fullName("System Administrator")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);

        boolean isProd = environment.acceptsProfiles(org.springframework.core.env.Profiles.of("prod"));
        boolean usingDefaults = DEFAULT_ADMIN_EMAIL.equals(adminEmail) && DEFAULT_ADMIN_PASSWORD.equals(adminPassword);

        if (isProd && usingDefaults) {
            // Don't print a known, publicly-documented password into production
            // logs — just point the operator at the fix.
            log.warn("=============================================================");
            log.warn(" MediStock: created the default Admin account using the");
            log.warn(" built-in fallback credentials because ADMIN_EMAIL/ADMIN_PASSWORD");
            log.warn(" were not set. Log in and change the password immediately, or");
            log.warn(" restart with ADMIN_EMAIL/ADMIN_PASSWORD set before first boot.");
            log.warn("=============================================================");
        } else {
            System.out.println("=============================================================");
            System.out.println(" MediStock: no Admin account found — created the default one.");
            System.out.println(" Login:    " + adminEmail);
            System.out.println(" Password: " + adminPassword);
            System.out.println(" Change this password after first login.");
            System.out.println("=============================================================");
        }
    }

    /**
     * database/seed.sql inserts medicines with raw SQL, bypassing
     * MedicineService.create() (and its INITIAL_STOCK logging). This
     * backfills that missing opening-balance movement for any medicine
     * that doesn't already have at least one stock movement, so the audit
     * trail always accounts for where a medicine's stock started
     * (requirement 7) before purchases/sales seeding runs on top of it.
     */
    private void backfillInitialStockMovements() {
        List<Medicine> medicines = medicineRepository.findAll();
        List<StockMovement> toInsert = new ArrayList<>();
        for (Medicine medicine : medicines) {
            if (stockMovementRepository.existsByMedicine_Id(medicine.getId())) continue;
            int qty = medicine.getQuantity() == null ? 0 : medicine.getQuantity();
            toInsert.add(StockMovement.builder()
                    .medicine(medicine)
                    .type(MovementType.INITIAL_STOCK)
                    .quantityChange(qty)
                    .previousQuantity(0)
                    .newQuantity(qty)
                    .performedBy(null)
                    .note("Initial stock from database/seed.sql")
                    .build());
        }
        if (!toInsert.isEmpty()) {
            stockMovementRepository.saveAll(toInsert);
            System.out.println("MediStock: backfilled " + toInsert.size()
                    + " INITIAL_STOCK movements for medicines seeded directly by seed.sql.");
        }
    }

    /**
     * Bulk purchase history: Supplier -> MediStock. Recorded by any
     * Admin/Pharmacist/Staff account (all three can record purchases).
     * Targets roughly 1,500-2,000 records spread across the last 18
     * months so the Admin dashboard's purchase KPIs, quarterly purchase
     * chart, and supplier analytics all have real substance. Every
     * purchase writes a matching PURCHASE_IN stock movement and raises
     * the medicine's tracked running quantity — purchases only ever
     * increase stock, so there's no risk of going negative here.
     *
     * @return the running quantity per medicine id after all purchases,
     *         handed off to seedBulkSalesIfPossible so sales draw down
     *         from the correct starting point instead of the stale
     *         pre-purchase quantity.
     */
    private Map<Long, Integer> seedBulkPurchasesIfPossible() {
        List<Medicine> medicines = medicineRepository.findAll();
        Map<Long, Integer> runningStock = new HashMap<>();
        for (Medicine m : medicines) {
            runningStock.put(m.getId(), m.getQuantity() == null ? 0 : m.getQuantity());
        }

        if (purchaseRepository.count() > 0) {
            return runningStock; // already seeded on a previous startup — nothing further to do
        }

        List<User> recorders = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.PHARMACIST || u.getRole() == Role.STAFF)
                .toList();

        if (medicines.isEmpty() || recorders.isEmpty()) {
            System.out.println("MediStock: skipping bulk purchase-history seed — run database/seed.sql "
                    + "and register at least one Admin/Pharmacist/Staff account first.");
            return runningStock;
        }

        Random random = new Random(101);
        LocalDateTime now = LocalDateTime.now();
        String[] noteTemplates = {
                "Routine restock", "Scheduled monthly order", "Bulk restock ahead of season",
                "Restock after low-stock alert", "Emergency top-up order", "Quarterly bulk purchase",
                "Restock following supplier promotion", "Standard reorder", "Restock — new batch received"
        };

        List<Purchase> purchaseBatch = new ArrayList<>();
        List<StockMovement> movementBatch = new ArrayList<>();
        int seeded = 0;
        int target = 1500 + random.nextInt(500); // 1500-1999 purchase records

        while (seeded < target) {
            Medicine medicine = medicines.get(random.nextInt(medicines.size()));
            Supplier supplier = medicine.getSupplier();
            User recorder = recorders.get(random.nextInt(recorders.size()));

            int quantity = 20 + random.nextInt(280);
            // Wholesale/purchase price is typically a discount off retail price.
            BigDecimal unitPrice = medicine.getPrice()
                    .multiply(BigDecimal.valueOf(0.55 + random.nextDouble() * 0.25))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);

            int daysAgo = random.nextInt(548); // spread across ~18 months
            LocalDateTime purchaseDate = now.minusDays(daysAgo).withHour(9 + random.nextInt(9)).withMinute(random.nextInt(60));

            purchaseBatch.add(Purchase.builder()
                    .medicine(medicine)
                    .supplier(supplier)
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .totalAmount(totalAmount)
                    .purchasedBy(recorder)
                    .purchaseDate(purchaseDate)
                    .note(noteTemplates[random.nextInt(noteTemplates.length)] + " — " + medicine.getName())
                    .orderStatus(PurchaseOrderStatus.RECEIVED)
                    .receivedDate(purchaseDate)
                    .build());

            int previousQty = runningStock.get(medicine.getId());
            int newQty = previousQty + quantity;
            runningStock.put(medicine.getId(), newQty);
            movementBatch.add(StockMovement.builder()
                    .medicine(medicine)
                    .type(MovementType.PURCHASE_IN)
                    .quantityChange(quantity)
                    .previousQuantity(previousQty)
                    .newQuantity(newQty)
                    .performedBy(recorder)
                    .timestamp(purchaseDate)
                    .note("Purchase from " + (supplier != null ? supplier.getName() : "supplier"))
                    .build());
            seeded++;

            if (purchaseBatch.size() >= 500) {
                purchaseRepository.saveAll(purchaseBatch);
                stockMovementRepository.saveAll(movementBatch);
                purchaseBatch.clear();
                movementBatch.clear();
            }
        }
        if (!purchaseBatch.isEmpty()) {
            purchaseRepository.saveAll(purchaseBatch);
            stockMovementRepository.saveAll(movementBatch);
        }

        // Persist the final post-purchase quantities.
        for (Medicine m : medicines) {
            m.setQuantity(runningStock.get(m.getId()));
        }
        medicineRepository.saveAll(medicines);

        System.out.println("MediStock: seeded " + seeded + " demo purchase records (with matching PURCHASE_IN "
                + "stock movements) across the last 18 months (recorded by " + recorders.size()
                + " Admin/Pharmacist/Staff account(s)).");
        return runningStock;
    }

    /**
     * Bulk sales history: MediStock -> Customer. Recorded only by
     * Pharmacist/Staff accounts (Admin does not sell medicines). Targets
     * roughly 500-700 bills spread across the last 12 months so Sales
     * History, the quarterly sales chart, and top-selling-medicines all
     * have real substance. Every line item writes a matching DISPENSE_OUT
     * stock movement; quantities are capped to whatever runningStock has
     * on hand at that point so seeded stock can never go negative
     * (requirement 8).
     *
     * @param runningStock post-purchase quantity per medicine id, from
     *                     seedBulkPurchasesIfPossible — mutated in place
     *                     as sales draw the stock down.
     */
    private void seedBulkSalesIfPossible(Map<Long, Integer> runningStock) {
        if (saleRepository.count() > 0) return;

        List<Medicine> medicines = medicineRepository.findAll();
        List<User> sellers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STAFF || u.getRole() == Role.PHARMACIST)
                .toList();

        if (medicines.isEmpty() || sellers.isEmpty()) {
            System.out.println("MediStock: skipping bulk sales-history seed — register a Pharmacist or Staff "
                    + "account (and make sure database/seed.sql has been run) to populate sales history.");
            return;
        }

        Random random = new Random(42);
        String[] customerNames = {
                "Ravi Kumar", "Ananya Sharma", "Mohammed Irfan", "Priya Nair", "Suresh Reddy",
                "Kavya Iyer", "Arjun Menon", "Divya Pillai", "Sanjay Gupta", "Meera Krishnan",
                "Rohit Verma", "Sneha Joshi", "Vikram Singh", "Pooja Agarwal", "Karthik Rajan",
                "Neha Kapoor", "Aditya Rao", "Lakshmi Venkat", "Farhan Sheikh", "Deepika Menon",
                "Rajesh Khanna", "Anjali Desai", "Imran Sheikh", "Swathi Reddy", "Manoj Tiwari",
                "Bhavana Rao", "Yusuf Ali", "Preethi Nair", "Gaurav Malhotra", "Ritika Chawla",
                "Naveen Kumar", "Shalini Gupta", "Abdul Rahman", "Vidya Suresh", "Tarun Mehta",
                "Kirti Bansal", "Harish Chandra", "Anita George", "Sameer Khan", "Pallavi Iyer"
        };

        List<StockMovement> movementBatch = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        int seeded = 0;
        for (int monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
            int billsThisMonth = 40 + random.nextInt(20); // 40-59 bills per month, ~560-700 total
            for (int b = 0; b < billsThisMonth; b++) {
                LocalDateTime saleDate = now.minusMonths(monthsAgo).minusDays(random.nextInt(27)).withHour(9 + random.nextInt(9)).withMinute(random.nextInt(60));
                User seller = sellers.get(random.nextInt(sellers.size()));

                Sale sale = Sale.builder()
                        .customerName(customerNames[random.nextInt(customerNames.length)])
                        .soldBy(seller)
                        .totalAmount(BigDecimal.ZERO)
                        .saleDate(saleDate)
                        .build();
                sale = saleRepository.save(sale);
                sale.setBillNumber("INV-" + (1000 + sale.getId()));

                int itemCount = 1 + random.nextInt(4);
                BigDecimal total = BigDecimal.ZERO;
                List<SaleItem> items = new ArrayList<>();
                for (int i = 0; i < itemCount; i++) {
                    Medicine medicine = medicines.get(random.nextInt(medicines.size()));
                    int available = runningStock.getOrDefault(medicine.getId(), 0);
                    if (available <= 0) continue; // nothing left to sell for this medicine — skip this line item

                    int qty = Math.min(1 + random.nextInt(5), available);
                    BigDecimal subtotal = medicine.getPrice().multiply(BigDecimal.valueOf(qty));
                    total = total.add(subtotal);
                    items.add(SaleItem.builder()
                            .sale(sale)
                            .medicine(medicine)
                            .quantity(qty)
                            .unitPrice(medicine.getPrice())
                            .subtotal(subtotal)
                            .build());

                    int newQty = available - qty;
                    runningStock.put(medicine.getId(), newQty);
                    movementBatch.add(StockMovement.builder()
                            .medicine(medicine)
                            .type(MovementType.DISPENSE_OUT)
                            .quantityChange(-qty)
                            .previousQuantity(available)
                            .newQuantity(newQty)
                            .performedBy(seller)
                            .timestamp(saleDate)
                            .note("Sold on bill " + sale.getBillNumber())
                            .build());
                }
                if (items.isEmpty()) continue; // every candidate medicine was out of stock — skip this bill entirely
                sale.setItems(items);
                sale.setTotalAmount(total);
                saleRepository.save(sale);
                seeded++;

                if (movementBatch.size() >= 500) {
                    stockMovementRepository.saveAll(movementBatch);
                    movementBatch.clear();
                }
            }
        }
        if (!movementBatch.isEmpty()) {
            stockMovementRepository.saveAll(movementBatch);
        }

        // Persist final post-sale quantities.
        for (Medicine m : medicines) {
            m.setQuantity(runningStock.getOrDefault(m.getId(), m.getQuantity()));
        }
        medicineRepository.saveAll(medicines);

        System.out.println("MediStock: seeded " + seeded + " demo sales/bills (with matching DISPENSE_OUT stock "
                + "movements) across the last 12 months (across " + sellers.size()
                + " Pharmacist/Staff account(s)) so the sales dashboard and sales history page have real data to show.");
    }
}
