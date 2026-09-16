package com.medistock.config;

import com.medistock.entity.Inventory;
import com.medistock.entity.Medicine;
import com.medistock.entity.Role;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.repository.InventoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.RoleRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final com.medistock.repository.MessageRepository messageRepository;
    private final com.medistock.repository.ExpiryTrackingRepository expiryTrackingRepository;
    private final com.medistock.repository.PurchaseOrderRepository purchaseOrderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           SupplierRepository supplierRepository,
                           MedicineRepository medicineRepository,
                           InventoryRepository inventoryRepository,
                           com.medistock.repository.MessageRepository messageRepository,
                           com.medistock.repository.ExpiryTrackingRepository expiryTrackingRepository,
                           com.medistock.repository.PurchaseOrderRepository purchaseOrderRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.messageRepository = messageRepository;
        this.expiryTrackingRepository = expiryTrackingRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting MediStock data initialization & catalog verification...");

        // Fix database constraints dynamically if needed
        try {
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_notification_type_check");
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS chk_notif_type");
            jdbcTemplate.execute("ALTER TABLE expiry_tracking DROP CONSTRAINT IF EXISTS expiry_tracking_status_check");
            jdbcTemplate.execute("ALTER TABLE expiry_tracking DROP CONSTRAINT IF EXISTS chk_expiry_status");
            jdbcTemplate.execute("ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check");
            jdbcTemplate.execute("ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS chk_po_status");
        } catch (Exception e) {
            log.warn("Database constraint adjustment note: {}", e.getMessage());
        }

        // 1. Initialize Roles
        Role adminRole = getOrCreateRole("ADMIN", "System Administrator Role");
        Role pharmacistRole = getOrCreateRole("PHARMACIST", "Pharmacist Role");
        Role viewerRole = getOrCreateRole("VIEWER", "Staff Viewer Role");
        Role staffRole = getOrCreateRole("STAFF", "Staff Role - Limited Inventory Access");
        Role supplierRole = getOrCreateRole("SUPPLIER", "Supplier Partner Role");

        // 2. Initialize Default Users
        User adminUser = getOrCreateUser("admin@medistock.com", "admin123", "Admin", "User", adminRole);
        User pharmUser = getOrCreateUser("pharmacist@medistock.com", "password123", "Pharmacist", "Staff", pharmacistRole);
        getOrCreateUser("viewer@medistock.com", "password123", "Staff", "Viewer", viewerRole);
        getOrCreateUser("staff@medistock.com", "password123", "Staff", "Member", staffRole);
        User suppUser = getOrCreateUser("supplier@medistock.com", "password123", "Supplier", "Partner", supplierRole);

        // 3. Initialize / Seed Suppliers
        log.info("Ensuring comprehensive active pharmaceutical suppliers exist...");

        Supplier cipla = getOrCreateSupplier("Cipla Distributors", "Rajesh Kumar", "contact@cipla.com", "9876543210", "Plot 14, MIDC Industrial Area", "Mumbai", "Maharashtra");
        Supplier sunPharma = getOrCreateSupplier("Sun Pharma Ltd", "Anita Sharma", "orders@sunpharma.com", "9876543211", "Sun House, Goregaon East", "Mumbai", "Maharashtra");
        Supplier ranbaxy = getOrCreateSupplier("Ranbaxy Supplies", "Vikram Singh", "info@ranbaxy.com", "9876543212", "Sector 18, Udyog Vihar", "Gurugram", "Haryana");
        Supplier drReddy = getOrCreateSupplier("Dr. Reddy's Labs", "Priya Nair", "supply@drreddys.com", "9876543213", "Banjara Hills Road No 3", "Hyderabad", "Telangana");
        Supplier torrent = getOrCreateSupplier("Torrent Pharmaceuticals", "Sanjay Patel", "procure@torrentpharma.com", "9876543214", "Torrent House, Off Ashram Road", "Ahmedabad", "Gujarat");
        Supplier lupin = getOrCreateSupplier("Lupin Lifesciences", "Neha Deshmukh", "orders@lupin.com", "9876543215", "Kalpataru Inspire, Santacruz East", "Mumbai", "Maharashtra");
        Supplier abbott = getOrCreateSupplier("Abbott Healthcare", "Rahul Verma", "healthcare@abbott.com", "9876543216", "Godrej BKC, Bandra Kurla Complex", "Mumbai", "Maharashtra");
        Supplier zydus = getOrCreateSupplier("Zydus Cadila", "Arjun Mehta", "supply@zyduslife.com", "9876543217", "Zydus Corporate Park, SG Highway", "Ahmedabad", "Gujarat");
        Supplier mankind = getOrCreateSupplier("Mankind Pharma", "Suresh Chandra", "sales@mankindpharma.com", "9876543218", "208 Okhla Industrial Estate Phase III", "New Delhi", "Delhi");
        Supplier alkem = getOrCreateSupplier("Alkem Laboratories", "Divya Iyer", "orders@alkemlabs.com", "9876543219", "Alkem House, Senapati Bapat Marg", "Mumbai", "Maharashtra");
        Supplier glenmark = getOrCreateSupplier("Glenmark Pharmaceuticals", "Amit Kulkarni", "info@glenmark.com", "9876543220", "Glenmark House, B.D. Sawant Marg", "Mumbai", "Maharashtra");

        if (suppUser != null && suppUser.getSupplier() == null) {
            suppUser.setSupplier(cipla);
            userRepository.save(suppUser);
        }

        // 4. Initialize / Seed Rich Medicines Catalogue for each Supplier
        log.info("Ensuring multi-category medicines catalogue exists for all suppliers...");

        // --- Cipla Distributors Medicines ---
        Medicine amox = getOrCreateMedicine("MED-1001", "Amoxicillin 500mg", "Amoxicillin Trihydrate", "Antibiotics", "Cipla", "5.00", "12.00", "BATCH-CIP-001", "Broad spectrum penicillin antibiotic capsule for bacterial infections", cipla, 180, 20, 600, "Shelf A-12", 14);
        Medicine omep = getOrCreateMedicine("MED-1005", "Omeprazole 20mg", "Omeprazole", "Gastrointestinal", "Cipla", "4.00", "9.00", "BATCH-CIP-002", "Proton pump inhibitor for GERD and acid peptic disorders", cipla, 140, 20, 500, "Shelf A-14", 18);
        Medicine ibupCip = getOrCreateMedicine("MED-1008", "Ibuprofen 400mg", "Ibuprofen", "Painkillers", "Cipla", "3.50", "7.50", "BATCH-CIP-003", "Nonsteroidal anti-inflammatory analgesic tablet", cipla, 220, 25, 800, "Shelf A-15", 22);
        Medicine cetCip = getOrCreateMedicine("MED-1011", "Cetirizine 10mg", "Cetirizine HCl", "Antihistamines", "Cipla", "1.50", "4.50", "BATCH-CIP-004", "Antiallergic tablet for allergic rhinitis and urticaria", cipla, 350, 40, 1000, "Shelf A-18", 16);
        Medicine montCip = getOrCreateMedicine("MED-1012", "Montelukast 10mg", "Montelukast Sodium", "Respiratory", "Cipla", "6.50", "15.00", "BATCH-CIP-005", "Leukotriene receptor antagonist for prophylaxis and chronic asthma", cipla, 95, 15, 400, "Shelf A-20", 20);
        Medicine foraCip = getOrCreateMedicine("MED-1013", "Foracort 200 Inhaler", "Budesonide + Formoterol", "Respiratory", "Cipla", "180.00", "320.00", "BATCH-CIP-006", "Metered dose aerosol inhaler for asthma maintenance and COPD", cipla, 45, 10, 200, "Cold Bay C-02", 12);

        // --- Sun Pharma Ltd Medicines ---
        Medicine paraSun = getOrCreateMedicine("MED-1002", "Paracetamol 650mg", "Paracetamol", "Painkillers", "Sun Pharma", "2.00", "6.00", "BATCH-SUN-001", "Fast-acting antipyretic and analgesic tablet for fever and aches", sunPharma, 450, 50, 1200, "Shelf B-02", 15);
        Medicine pantoSun = getOrCreateMedicine("MED-1014", "Pantoprazole 40mg", "Pantoprazole Sodium", "Gastrointestinal", "Sun Pharma", "4.20", "9.50", "BATCH-SUN-002", "Gastric acid pump blocker delayed-release tablet", sunPharma, 210, 25, 600, "Shelf B-05", 24);
        Medicine rosuSun = getOrCreateMedicine("MED-1015", "Rosuvastatin 10mg", "Rosuvastatin Calcium", "Cardiovascular", "Sun Pharma", "8.00", "18.00", "BATCH-SUN-003", "Statin lipid-lowering medication for hypercholesterolemia", sunPharma, 130, 20, 500, "Shelf B-08", 20);
        Medicine voliSun = getOrCreateMedicine("MED-1016", "Volini Pain Relief Gel 50g", "Diclofenac Diethylamine", "Painkillers", "Sun Pharma", "45.00", "95.00", "BATCH-SUN-004", "Deep penetrating topical pain relief gel for muscular sprains", sunPharma, 80, 15, 300, "Shelf B-11", 18);
        Medicine sustSun = getOrCreateMedicine("MED-1017", "Susten 200mg Capsule", "Natural Micronized Progesterone", "Gynecology", "Sun Pharma", "32.00", "65.00", "BATCH-SUN-005", "Natural progesterone soft gelatin capsule for luteal support", sunPharma, 60, 10, 250, "Cold Bay C-04", 16);

        // --- Ranbaxy Supplies Medicines ---
        Medicine ibupRan = getOrCreateMedicine("MED-1003", "Ibuprofen Forte 400mg", "Ibuprofen", "Painkillers", "Ranbaxy", "3.50", "8.50", "BATCH-RAN-001", "Anti-inflammatory tablet for joint, musculoskeletal and dental pain", ranbaxy, 160, 20, 600, "Shelf C-01", 20);
        Medicine storRan = getOrCreateMedicine("MED-1018", "Storvas 20mg", "Atorvastatin Calcium", "Cardiovascular", "Ranbaxy", "9.50", "22.00", "BATCH-RAN-002", "Potent cholesterol-lowering statin for cardiovascular risk reduction", ranbaxy, 115, 15, 450, "Shelf C-04", 18);
        Medicine cifRan = getOrCreateMedicine("MED-1019", "Cifran 500mg", "Ciprofloxacin HCl", "Antibiotics", "Ranbaxy", "7.00", "16.00", "BATCH-RAN-003", "Broad-spectrum fluoroquinolone for urinary, respiratory and GI infections", ranbaxy, 190, 25, 700, "Shelf C-07", 15);
        Medicine revRan = getOrCreateMedicine("MED-1020", "Revital H Daily Vitality", "Ginseng + Multivitamins + Zinc", "Vitamins & Minerals", "Ranbaxy", "8.50", "18.00", "BATCH-RAN-004", "Daily energy, immunity and stamina nutritional health supplement", ranbaxy, 280, 30, 900, "Shelf C-10", 24);
        Medicine moxRan = getOrCreateMedicine("MED-1021R", "Mox 500mg", "Amoxicillin", "Antibiotics", "Ranbaxy", "6.00", "14.00", "BATCH-RAN-005", "Bactericidal penicillin antibiotic for ENT and chest infections", ranbaxy, 140, 20, 500, "Shelf C-12", 14);

        // --- Dr. Reddy's Labs Medicines ---
        Medicine azithDr = getOrCreateMedicine("MED-1004", "Azithromycin 250mg", "Azithromycin", "Antibiotics", "Dr. Reddy's Labs", "15.00", "30.00", "BATCH-DRR-001", "Macrolide antibiotic tablet for respiratory, skin and soft tissue infections", drReddy, 125, 15, 400, "Shelf D-01", 16);
        Medicine omezDr = getOrCreateMedicine("MED-1021", "Omez 20mg Capsule", "Omeprazole", "Gastrointestinal", "Dr. Reddy's Labs", "4.50", "10.00", "BATCH-DRR-002", "Micro-pellet enteric coated capsule for hyperacidity and ulcers", drReddy, 310, 35, 900, "Shelf D-04", 22);
        Medicine niseDr = getOrCreateMedicine("MED-1022", "Nise 100mg", "Nimesulide", "Painkillers", "Dr. Reddy's Labs", "3.80", "8.00", "BATCH-DRR-003", "Targeted preferential COX-2 inhibitor for acute inflammatory pain", drReddy, 175, 20, 600, "Shelf D-07", 18);
        Medicine stamDr = getOrCreateMedicine("MED-1023", "Stamlo 5mg", "Amlodipine Besylate", "Cardiovascular", "Dr. Reddy's Labs", "3.00", "7.00", "BATCH-DRR-004", "Long-acting dihydropyridine calcium channel blocker for hypertension", drReddy, 260, 30, 800, "Shelf D-10", 26);
        Medicine ecoDr = getOrCreateMedicine("MED-1024", "Econorm Probiotic Sachet", "Saccharomyces Boulardii", "Gastrointestinal", "Dr. Reddy's Labs", "22.00", "45.00", "BATCH-DRR-005", "Lyophilized therapeutic probiotic for antibiotic-associated diarrhea", drReddy, 85, 15, 300, "Shelf D-12", 14);

        // --- Torrent Pharmaceuticals Medicines ---
        Medicine losarTor = getOrCreateMedicine("MED-1025", "Losartan Potassium 50mg", "Losartan", "Cardiovascular", "Torrent Pharma", "5.50", "12.50", "BATCH-TOR-001", "Angiotensin II receptor antagonist for hypertension and nephropathy", torrent, 200, 25, 700, "Shelf E-01", 24);
        Medicine nebiTor = getOrCreateMedicine("MED-1026", "Nebicard 5mg", "Nebivolol", "Cardiovascular", "Torrent Pharma", "7.20", "16.00", "BATCH-TOR-002", "Third-generation beta blocker with nitric oxide-mediated vasodilation", torrent, 140, 20, 500, "Shelf E-04", 20);
        Medicine chymTor = getOrCreateMedicine("MED-1027", "Chymoral Forte Tablet", "Trypsin + Chymotrypsin", "Painkillers", "Torrent Pharma", "18.00", "38.00", "BATCH-TOR-003", "Proteolytic anti-inflammatory enzymes for edema and hematoma resolution", torrent, 90, 15, 350, "Shelf E-07", 16);
        Medicine nexpTor = getOrCreateMedicine("MED-1028", "Nexpro Fast 40mg", "Esomeprazole + Sodium Bicarbonate", "Gastrointestinal", "Torrent Pharma", "8.00", "18.00", "BATCH-TOR-004", "Instant release dual mechanism proton pump inhibitor for severe heartburn", torrent, 160, 20, 550, "Shelf E-10", 22);
        Medicine velozTor = getOrCreateMedicine("MED-1029T", "Veloz 20mg", "Rabeprazole Sodium", "Gastrointestinal", "Torrent Pharma", "5.00", "11.50", "BATCH-TOR-005", "Rapid onset gastric antisecretory medication for peptic and duodenal ulcers", torrent, 180, 25, 650, "Shelf E-12", 20);

        // --- Lupin Lifesciences Medicines ---
        Medicine glucoLup = getOrCreateMedicine("MED-1029", "Gluconorm-G 2mg", "Glimepiride + Metformin", "Antidiabetic", "Lupin Ltd", "6.50", "14.00", "BATCH-LUP-001", "Dual synergistic combination for type 2 diabetes glycemic control", lupin, 240, 30, 800, "Shelf F-01", 22);
        Medicine tonactLup = getOrCreateMedicine("MED-1030", "Tonact 10mg", "Atorvastatin Calcium", "Cardiovascular", "Lupin Ltd", "7.00", "15.50", "BATCH-LUP-002", "Selective HMG-CoA reductase inhibitor for cardiovascular prevention", lupin, 170, 20, 600, "Shelf F-04", 24);
        Medicine cefakLup = getOrCreateMedicine("MED-1031", "Cefakind 500mg", "Cefuroxime Axetil", "Antibiotics", "Lupin Ltd", "28.00", "55.00", "BATCH-LUP-003", "Advanced 2nd generation cephalosporin for resistant respiratory infections", lupin, 80, 15, 300, "Shelf F-07", 15);
        Medicine lupiLup = getOrCreateMedicine("MED-1032", "Lupisulin N 100IU/ml", "Isophane Insulin Human", "Antidiabetic", "Lupin Ltd", "140.00", "260.00", "BATCH-LUP-004", "Intermediate-acting human insulin vial for type 1 and type 2 diabetes", lupin, 50, 10, 200, "Cold Bay C-01", 12);
        Medicine teleLup = getOrCreateMedicine("MED-1033L", "Teleact 40mg", "Telmisartan", "Cardiovascular", "Lupin Ltd", "6.80", "15.00", "BATCH-LUP-005", "Longest half-life ARB for smooth 24-hour BP control", lupin, 190, 25, 650, "Shelf F-10", 26);

        // --- Abbott Healthcare Medicines ---
        Medicine thyroAbb = getOrCreateMedicine("MED-1033", "Thyronorm 50mcg", "Levothyroxine Sodium", "Endocrinology", "Abbott India", "2.20", "5.00", "BATCH-ABB-001", "Synthetic thyroid hormone replacement for hypothyroidism", abbott, 400, 40, 1200, "Shelf G-01", 24);
        Medicine digeneAbb = getOrCreateMedicine("MED-1034", "Digene Antacid Gel 200ml", "Aluminium Hydroxide + Simethicone", "Gastrointestinal", "Abbott India", "65.00", "125.00", "BATCH-ABB-002", "Sugar-free soothing liquid antacid suspension for heartburn and bloating", abbott, 110, 20, 400, "Shelf G-04", 18);
        Medicine duphAbb = getOrCreateMedicine("MED-1035", "Duphaston 10mg", "Dydrogesterone", "Gynecology", "Abbott India", "48.00", "95.00", "BATCH-ABB-003", "Selective synthetic progestogen for endometriosis and recurrent miscarriage", abbott, 65, 10, 250, "Shelf G-07", 20);
        Medicine brufenAbb = getOrCreateMedicine("MED-1036", "Brufen 400mg", "Ibuprofen", "Painkillers", "Abbott India", "3.00", "7.00", "BATCH-ABB-004", "Standard NSAID tablet for mild to moderate musculoskeletal inflammation", abbott, 320, 35, 1000, "Shelf G-10", 22);
        Medicine cremAbb = getOrCreateMedicine("MED-1037A", "Cremaffin Plus 225ml", "Liquid Paraffin + Milk of Magnesia", "Gastrointestinal", "Abbott India", "90.00", "175.00", "BATCH-ABB-005", "Emulsion laxative for gentle chronic constipation management", abbott, 75, 15, 300, "Shelf G-12", 18);

        // --- Zydus Cadila Medicines ---
        Medicine atorvaZyd = getOrCreateMedicine("MED-1037", "Atorva 10mg", "Atorvastatin", "Cardiovascular", "Zydus Healthcare", "6.00", "13.50", "BATCH-ZYD-001", "Statin tablet to lower bad cholesterol and prevent coronary artery disease", zydus, 185, 20, 600, "Shelf H-01", 24);
        Medicine deriZyd = getOrCreateMedicine("MED-1038", "Deriphyllin 150mg Retard", "Theophylline + Etofylline", "Respiratory", "Zydus Healthcare", "1.80", "4.00", "BATCH-ZYD-002", "Sustained release bronchodilator for bronchial asthma and wheezing", zydus, 350, 40, 1100, "Shelf H-04", 20);
        Medicine atenZyd = getOrCreateMedicine("MED-1039", "Aten 50mg", "Atenolol", "Cardiovascular", "Zydus Healthcare", "3.20", "7.50", "BATCH-ZYD-003", "Cardioselective beta-adrenoreceptor blocking agent for hypertension", zydus, 220, 25, 750, "Shelf H-07", 22);
        Medicine formoZyd = getOrCreateMedicine("MED-1040", "Formonide 200 Inhaler", "Formoterol + Budesonide", "Respiratory", "Zydus Healthcare", "195.00", "340.00", "BATCH-ZYD-004", "Dual mechanism maintenance and reliever inhaler for asthma", zydus, 40, 10, 180, "Cold Bay C-03", 14);
        Medicine pantoZyd = getOrCreateMedicine("MED-1041Z", "Pantodac 40mg", "Pantoprazole", "Gastrointestinal", "Zydus Healthcare", "5.20", "11.00", "BATCH-ZYD-005", "Proton pump inhibitor enteric coated tablet for reflux esophagitis", zydus, 170, 20, 600, "Shelf H-10", 22);

        // --- Mankind Pharma Medicines ---
        Medicine moxiMan = getOrCreateMedicine("MED-1041", "Moxikind-CV 625", "Amoxicillin + Potassium Clavulanate", "Antibiotics", "Mankind Pharma", "16.00", "34.00", "BATCH-MAN-001", "Broad-spectrum co-amoxiclav formulation for resistant bacterial infections", mankind, 210, 25, 700, "Shelf I-01", 16);
        Medicine manfMan = getOrCreateMedicine("MED-1042", "Manforce 50mg", "Sildenafil Citrate", "Men's Health", "Mankind Pharma", "25.00", "55.00", "BATCH-MAN-002", "Phosphodiesterase type 5 (PDE5) inhibitor tablet", mankind, 120, 15, 400, "Shelf I-04", 24);
        Medicine candiMan = getOrCreateMedicine("MED-1043", "Candiforce 100mg Capsule", "Itraconazole", "Dermatology", "Mankind Pharma", "14.00", "30.00", "BATCH-MAN-003", "Broad-spectrum triazole antifungal capsule for dermatological mycoses", mankind, 95, 15, 350, "Shelf I-07", 18);
        Medicine doloMan = getOrCreateMedicine("MED-1044", "Dolo-650 Tablet", "Paracetamol 650mg", "Painkillers", "Mankind Pharma", "2.10", "5.00", "BATCH-MAN-004", "Trusted antipyretic & analgesic tablet for viral fevers and headaches", mankind, 500, 60, 1500, "Shelf I-10", 24);
        Medicine gudcMan = getOrCreateMedicine("MED-1045M", "Gudcef 200mg", "Cefpodoxime Proxetil", "Antibiotics", "Mankind Pharma", "19.00", "40.00", "BATCH-MAN-005", "Potent 3rd-generation oral cephalosporin antibiotic for respiratory infections", mankind, 110, 15, 400, "Shelf I-12", 15);

        // --- Alkem Laboratories Medicines ---
        Medicine clavAlk = getOrCreateMedicine("MED-1045", "Clavam 625mg", "Amoxicillin + Clavulanic Acid", "Antibiotics", "Alkem Labs", "18.00", "38.00", "BATCH-ALK-001", "Gold-standard penicillinase inhibitor combo for sinus, dental and skin infections", alkem, 230, 25, 800, "Shelf J-01", 15);
        Medicine panAlk = getOrCreateMedicine("MED-1046", "Pan 40mg Tablet", "Pantoprazole Sodium", "Gastrointestinal", "Alkem Labs", "5.50", "12.00", "BATCH-ALK-002", "Premium delayed-release proton pump inhibitor for severe gastritis", alkem, 275, 30, 900, "Shelf J-04", 22);
        Medicine azeeAlk = getOrCreateMedicine("MED-1047", "Azee 500mg", "Azithromycin Dihydrate", "Antibiotics", "Alkem Labs", "20.00", "42.00", "BATCH-ALK-003", "High strength 3-day course macrolide antibiotic for respiratory tract infections", alkem, 160, 20, 550, "Shelf J-07", 18);
        Medicine gemAlk = getOrCreateMedicine("MED-1048", "Gemer 2mg Tablet", "Glimepiride + Metformin SR", "Antidiabetic", "Alkem Labs", "8.00", "17.00", "BATCH-ALK-004", "Dual mechanism sustained-release antidiabetic for optimal postprandial glucose", alkem, 195, 20, 650, "Shelf J-10", 20);
        Medicine ondemAlk = getOrCreateMedicine("MED-1049A", "Ondem 4mg Fast-Melt", "Ondansetron", "Gastrointestinal", "Alkem Labs", "4.00", "9.00", "BATCH-ALK-005", "Orally disintegrating antiemetic tablet for post-chemo and acute nausea", alkem, 210, 25, 700, "Shelf J-12", 24);

        // --- Glenmark Pharmaceuticals Medicines ---
        Medicine telmaGlen = getOrCreateMedicine("MED-1049", "Telma 40mg", "Telmisartan", "Cardiovascular", "Glenmark", "7.50", "16.00", "BATCH-GLN-001", "Premier ARB antihypertensive with proven vascular and metabolic protection", glenmark, 250, 30, 850, "Shelf K-01", 24);
        Medicine ascoGlen = getOrCreateMedicine("MED-1050", "Ascoril D Plus Syrup 100ml", "Dextromethorphan + Phenylephrine + CPM", "Respiratory", "Glenmark", "55.00", "110.00", "BATCH-GLN-002", "Comprehensive cough formula for dry irritating allergic cough & nasal congestion", glenmark, 130, 20, 450, "Shelf K-04", 18);
        Medicine candGlen = getOrCreateMedicine("MED-1051", "Candid-B Cream 20g", "Clotrimazole + Beclomethasone", "Dermatology", "Glenmark", "42.00", "88.00", "BATCH-GLN-003", "Dual therapeutic broad-spectrum antifungal plus anti-inflammatory cream", glenmark, 160, 20, 500, "Shelf K-07", 20);
        Medicine fabiGlen = getOrCreateMedicine("MED-1052", "FabiFlu 400mg", "Favipiravir", "Antiviral", "Glenmark", "35.00", "75.00", "BATCH-GLN-004", "Targeted RNA-dependent RNA polymerase inhibitor antiviral tablet", glenmark, 70, 10, 250, "Shelf K-10", 14);
        Medicine vitcGlen = getOrCreateMedicine("MED-1053G", "Glenmark Vitamin C 500mg + Zinc", "Ascorbic Acid + Zinc Oxide", "Vitamins & Minerals", "Glenmark", "3.00", "7.00", "BATCH-GLN-005", "Chewable antioxidant immune defense tablet with elemental zinc", glenmark, 400, 40, 1200, "Shelf K-12", 24);

        // 5. Seed Chat Messages if empty
        if (messageRepository.count() == 0) {
            log.info("Seeding initial chat messages...");
            if (adminUser != null && pharmUser != null) {
                com.medistock.entity.Message msg1 = new com.medistock.entity.Message();
                msg1.setSender(pharmUser);
                msg1.setReceiver(adminUser);
                msg1.setSubject("Stock Reorder Request");
                msg1.setContent("Hi Admin, Amoxicillin and Paracetamol stock is running low. Should we issue a new Purchase Order?");
                messageRepository.save(msg1);

                com.medistock.entity.Message msg2 = new com.medistock.entity.Message();
                msg2.setSender(adminUser);
                msg2.setReceiver(pharmUser);
                msg2.setSubject("Re: Stock Reorder Request");
                msg2.setContent("Approved! I have created PO-2026-001 with Cipla Distributors and PO-2026-002 with Sun Pharma.");
                messageRepository.save(msg2);
            }

            if (adminUser != null && suppUser != null) {
                com.medistock.entity.Message msg3 = new com.medistock.entity.Message();
                msg3.setSender(suppUser);
                msg3.setReceiver(adminUser);
                msg3.setSubject("Shipment Dispatched");
                msg3.setContent("Hello Admin, shipment for PO-2026-001 has been dispatched via BlueDart logistics.");
                messageRepository.save(msg3);
            }
        }

        // 6. Initialize Sample Purchase Orders for all suppliers if empty or low
        if (purchaseOrderRepository.count() < 5) {
            log.info("Seeding realistic sample purchase orders across suppliers for catalogue procurement history...");
            LocalDate now = LocalDate.now();

            createSamplePO(cipla, amox, "PO-2026-001", now.minusDays(6), now.plusDays(1), com.medistock.enums.OrderStatus.RECEIVED, 200, new BigDecimal("5.00"));
            createSamplePO(sunPharma, paraSun, "PO-2026-002", now.minusDays(4), now.plusDays(2), com.medistock.enums.OrderStatus.SHIPPED, 500, new BigDecimal("2.00"));
            createSamplePO(ranbaxy, cifRan, "PO-2026-003", now.minusDays(2), now.plusDays(4), com.medistock.enums.OrderStatus.APPROVED, 150, new BigDecimal("7.00"));
            createSamplePO(drReddy, azithDr, "PO-2026-004", now.minusDays(1), now.plusDays(5), com.medistock.enums.OrderStatus.PENDING, 100, new BigDecimal("15.00"));
            createSamplePO(torrent, losarTor, "PO-2026-005", now.minusDays(3), now.plusDays(3), com.medistock.enums.OrderStatus.RECEIVED, 250, new BigDecimal("5.50"));
            createSamplePO(lupin, glucoLup, "PO-2026-006", now.minusDays(2), now.plusDays(4), com.medistock.enums.OrderStatus.SHIPPED, 300, new BigDecimal("6.50"));
            createSamplePO(abbott, thyroAbb, "PO-2026-007", now.minusDays(5), now.plusDays(2), com.medistock.enums.OrderStatus.RECEIVED, 400, new BigDecimal("2.20"));
            createSamplePO(mankind, doloMan, "PO-2026-008", now.minusDays(1), now.plusDays(6), com.medistock.enums.OrderStatus.APPROVED, 600, new BigDecimal("2.10"));
            createSamplePO(alkem, clavAlk, "PO-2026-009", now.minusDays(2), now.plusDays(5), com.medistock.enums.OrderStatus.PENDING, 150, new BigDecimal("18.00"));
            createSamplePO(glenmark, telmaGlen, "PO-2026-010", now.minusDays(3), now.plusDays(3), com.medistock.enums.OrderStatus.RECEIVED, 200, new BigDecimal("7.50"));
        }

        log.info("MediStock data initialization complete! Total suppliers: {}, Total medicines: {}",
                supplierRepository.count(), medicineRepository.count());
    }

    private Role getOrCreateRole(String roleName, String description) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(roleName)
                        .description(description)
                        .build()));
    }

    private User getOrCreateUser(String email, String password, String firstName, String lastName, Role role) {
        User u = userRepository.findByEmail(email)
                .orElseGet(() -> User.builder()
                        .email(email)
                        .firstName(firstName)
                        .lastName(lastName)
                        .phone("9876543210")
                        .status("ACTIVE")
                        .role(role)
                        .build());
        u.setPassword(passwordEncoder.encode(password));
        u.setStatus("ACTIVE");
        u.setRole(role);
        return userRepository.save(u);
    }

    private Supplier getOrCreateSupplier(String name, String contact, String email, String phone, String address, String city, String state) {
        return supplierRepository.findByEmail(email)
                .orElseGet(() -> supplierRepository.save(Supplier.builder()
                        .supplierName(name)
                        .contactPerson(contact)
                        .email(email)
                        .phone(phone)
                        .address(address)
                        .city(city)
                        .state(state)
                        .country("India")
                        .status("ACTIVE")
                        .build()));
    }

    private Medicine getOrCreateMedicine(String code, String name, String genericName, String category, String manufacturer,
                                         String unitPrice, String sellingPrice, String batchNumber, String description,
                                         Supplier supplier, int stockQty, int minStock, int maxStock, String location, int expiryMonths) {
        Medicine med = medicineRepository.findByMedicineCode(code)
                .orElseGet(() -> medicineRepository.save(Medicine.builder()
                        .medicineCode(code)
                        .medicineName(name)
                        .genericName(genericName)
                        .category(category)
                        .manufacturer(manufacturer)
                        .brand(manufacturer)
                        .unitPrice(new BigDecimal(unitPrice))
                        .sellingPrice(new BigDecimal(sellingPrice))
                        .batchNumber(batchNumber)
                        .description(description)
                        .supplier(supplier)
                        .build()));

        if (med.getSupplier() == null && supplier != null) {
            med.setSupplier(supplier);
            med = medicineRepository.save(med);
        }

        createInventory(med, stockQty, minStock, maxStock, location);
        createExpiry(med, batchNumber, stockQty, expiryMonths);
        return med;
    }

    private void createInventory(Medicine medicine, int qty, int min, int max, String location) {
        if (inventoryRepository.findByMedicineId(medicine.getId()).isEmpty()) {
            inventoryRepository.save(Inventory.builder()
                    .medicine(medicine)
                    .quantity(qty)
                    .minimumStock(min)
                    .maximumStock(max)
                    .location(location)
                    .build());
        }
    }

    private void createExpiry(Medicine medicine, String batchNumber, int qty, int expiryMonths) {
        if (expiryTrackingRepository.findByMedicineIdAndBatchNumber(medicine.getId(), batchNumber).isEmpty()) {
            LocalDate expDate;
            com.medistock.enums.ExpiryStatus status;
            if (expiryMonths <= 0) {
                expDate = LocalDate.now().minusDays(5);
                status = com.medistock.enums.ExpiryStatus.EXPIRED;
            } else if (expiryMonths <= 1) {
                expDate = LocalDate.now().plusDays(15);
                status = com.medistock.enums.ExpiryStatus.EXPIRING_SOON;
            } else {
                expDate = LocalDate.now().plusMonths(expiryMonths);
                status = com.medistock.enums.ExpiryStatus.ACTIVE;
            }
            expiryTrackingRepository.save(com.medistock.entity.ExpiryTracking.builder()
                    .medicine(medicine)
                    .batchNumber(batchNumber)
                    .quantity(qty)
                    .expiryDate(expDate)
                    .status(status)
                    .build());
        }
    }

    private void createSamplePO(Supplier supplier, Medicine medicine, String orderNumber, LocalDate orderDate, LocalDate expDelivery,
                                com.medistock.enums.OrderStatus status, int qty, BigDecimal unitPrice) {
        if (!purchaseOrderRepository.existsByOrderNumber(orderNumber)) {
            BigDecimal total = unitPrice.multiply(new BigDecimal(qty));
            com.medistock.entity.PurchaseOrder po = com.medistock.entity.PurchaseOrder.builder()
                    .orderNumber(orderNumber)
                    .supplier(supplier)
                    .orderDate(orderDate)
                    .expectedDelivery(expDelivery)
                    .status(status)
                    .totalAmount(total)
                    .notes("Stock procurement from " + supplier.getSupplierName())
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .build();
            po.addItem(com.medistock.entity.PurchaseOrderItem.builder()
                    .medicine(medicine)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .subtotal(total)
                    .build());
            purchaseOrderRepository.save(po);
        }
    }
}
