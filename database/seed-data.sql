-- =========================================================
-- MEDISTOCK — Comprehensive Seed Data (PostgreSQL)
-- =========================================================

-- =========================================================
-- ROLES
-- =========================================================
INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'Full system access - manage users, medicines, suppliers, inventory, orders, reports'),
('PHARMACIST', 'Manage medicines, update inventory, create purchase orders, view reports'),
('STAFF', 'Limited staff access - view medicines, inventory stock movements, reports'),
('SUPPLIER', 'Supplier access - manage orders, catalogue, shipments')
ON CONFLICT (role_name) DO NOTHING;

-- =========================================================
-- USERS (password: 'admin123' / 'password123')
-- =========================================================
INSERT INTO users (first_name, last_name, email, password, phone, status, role_id) VALUES
('Admin', 'User', 'admin@medistock.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543210', 'ACTIVE', 1),
('Pharmacist', 'Staff', 'pharmacist@medistock.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543211', 'ACTIVE', 2),
('Staff', 'Member', 'staff@medistock.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543213', 'ACTIVE', 3),
('Supplier', 'Partner', 'supplier@medistock.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543214', 'ACTIVE', 4)
ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- SUPPLIERS (11 Top Pharmaceutical Vendors)
-- =========================================================
INSERT INTO suppliers (supplier_name, contact_person, email, phone, address, city, state, country, status) VALUES
('Cipla Distributors', 'Rajesh Kumar', 'contact@cipla.com', '9876543210', 'Plot 14, MIDC Industrial Area', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
('Sun Pharma Ltd', 'Anita Sharma', 'orders@sunpharma.com', '9876543211', 'Sun House, Goregaon East', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
('Ranbaxy Supplies', 'Vikram Singh', 'info@ranbaxy.com', '9876543212', 'Sector 18, Udyog Vihar', 'Gurugram', 'Haryana', 'India', 'ACTIVE'),
('Dr. Reddy''s Labs', 'Priya Nair', 'supply@drreddys.com', '9876543213', 'Banjara Hills Road No 3', 'Hyderabad', 'Telangana', 'India', 'ACTIVE'),
('Torrent Pharmaceuticals', 'Sanjay Patel', 'procure@torrentpharma.com', '9876543214', 'Torrent House, Off Ashram Road', 'Ahmedabad', 'Gujarat', 'India', 'ACTIVE'),
('Lupin Lifesciences', 'Neha Deshmukh', 'orders@lupin.com', '9876543215', 'Kalpataru Inspire, Santacruz East', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
('Abbott Healthcare', 'Rahul Verma', 'healthcare@abbott.com', '9876543216', 'Godrej BKC, Bandra Kurla Complex', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
('Zydus Cadila', 'Arjun Mehta', 'supply@zyduslife.com', '9876543217', 'Zydus Corporate Park, SG Highway', 'Ahmedabad', 'Gujarat', 'India', 'ACTIVE'),
('Mankind Pharma', 'Suresh Chandra', 'sales@mankindpharma.com', '9876543218', '208 Okhla Industrial Estate Phase III', 'New Delhi', 'Delhi', 'India', 'ACTIVE'),
('Alkem Laboratories', 'Divya Iyer', 'orders@alkemlabs.com', '9876543219', 'Alkem House, Senapati Bapat Marg', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE'),
('Glenmark Pharmaceuticals', 'Amit Kulkarni', 'info@glenmark.com', '9876543220', 'Glenmark House, B.D. Sawant Marg', 'Mumbai', 'Maharashtra', 'India', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- MEDICINES (55+ Medicines Mapped Across All Suppliers)
-- =========================================================
INSERT INTO medicines (medicine_code, medicine_name, generic_name, category, manufacturer, brand, unit_price, selling_price, batch_number, description, supplier_id) VALUES
-- Cipla
('MED-1001', 'Amoxicillin 500mg', 'Amoxicillin Trihydrate', 'Antibiotics', 'Cipla', 'Cipla', 5.00, 12.00, 'BATCH-CIP-001', 'Broad spectrum penicillin antibiotic capsule for bacterial infections', 1),
('MED-1005', 'Omeprazole 20mg', 'Omeprazole', 'Gastrointestinal', 'Cipla', 'Cipla', 4.00, 9.00, 'BATCH-CIP-002', 'Proton pump inhibitor for GERD and acid peptic disorders', 1),
('MED-1008', 'Ibuprofen 400mg', 'Ibuprofen', 'Painkillers', 'Cipla', 'Cipla', 3.50, 7.50, 'BATCH-CIP-003', 'Nonsteroidal anti-inflammatory analgesic tablet', 1),
('MED-1011', 'Cetirizine 10mg', 'Cetirizine HCl', 'Antihistamines', 'Cipla', 'Cipla', 1.50, 4.50, 'BATCH-CIP-004', 'Antiallergic tablet for allergic rhinitis and urticaria', 1),
('MED-1012', 'Montelukast 10mg', 'Montelukast Sodium', 'Respiratory', 'Cipla', 'Cipla', 6.50, 15.00, 'BATCH-CIP-005', 'Leukotriene receptor antagonist for chronic asthma', 1),
('MED-1013', 'Foracort 200 Inhaler', 'Budesonide + Formoterol', 'Respiratory', 'Cipla', 'Cipla', 180.00, 320.00, 'BATCH-CIP-006', 'Metered dose aerosol inhaler for asthma maintenance and COPD', 1),

-- Sun Pharma
('MED-1002', 'Paracetamol 650mg', 'Paracetamol', 'Painkillers', 'Sun Pharma', 'Sun Pharma', 2.00, 6.00, 'BATCH-SUN-001', 'Fast-acting antipyretic and analgesic tablet for fever and aches', 2),
('MED-1014', 'Pantoprazole 40mg', 'Pantoprazole Sodium', 'Gastrointestinal', 'Sun Pharma', 'Sun Pharma', 4.20, 9.50, 'BATCH-SUN-002', 'Gastric acid pump blocker delayed-release tablet', 2),
('MED-1015', 'Rosuvastatin 10mg', 'Rosuvastatin Calcium', 'Cardiovascular', 'Sun Pharma', 'Sun Pharma', 8.00, 18.00, 'BATCH-SUN-003', 'Statin lipid-lowering medication for hypercholesterolemia', 2),
('MED-1016', 'Volini Pain Relief Gel 50g', 'Diclofenac Diethylamine', 'Painkillers', 'Sun Pharma', 'Sun Pharma', 45.00, 95.00, 'BATCH-SUN-004', 'Deep penetrating topical pain relief gel for muscular sprains', 2),
('MED-1017', 'Susten 200mg Capsule', 'Natural Micronized Progesterone', 'Gynecology', 'Sun Pharma', 'Sun Pharma', 32.00, 65.00, 'BATCH-SUN-005', 'Natural progesterone soft gelatin capsule for luteal support', 2),

-- Ranbaxy
('MED-1003', 'Ibuprofen Forte 400mg', 'Ibuprofen', 'Painkillers', 'Ranbaxy', 'Ranbaxy', 3.50, 8.50, 'BATCH-RAN-001', 'Anti-inflammatory tablet for joint and dental pain', 3),
('MED-1018', 'Storvas 20mg', 'Atorvastatin Calcium', 'Cardiovascular', 'Ranbaxy', 'Ranbaxy', 9.50, 22.00, 'BATCH-RAN-002', 'Potent cholesterol-lowering statin for cardiovascular risk reduction', 3),
('MED-1019', 'Cifran 500mg', 'Ciprofloxacin HCl', 'Antibiotics', 'Ranbaxy', 'Ranbaxy', 7.00, 16.00, 'BATCH-RAN-003', 'Broad-spectrum fluoroquinolone for urinary and GI infections', 3),
('MED-1020', 'Revital H Daily Vitality', 'Ginseng + Multivitamins + Zinc', 'Vitamins & Minerals', 'Ranbaxy', 'Ranbaxy', 8.50, 18.00, 'BATCH-RAN-004', 'Daily energy, immunity and stamina nutritional supplement', 3),
('MED-1021R', 'Mox 500mg', 'Amoxicillin', 'Antibiotics', 'Ranbaxy', 'Ranbaxy', 6.00, 14.00, 'BATCH-RAN-005', 'Bactericidal penicillin antibiotic for ENT and chest infections', 3),

-- Dr. Reddy's
('MED-1004', 'Azithromycin 250mg', 'Azithromycin', 'Antibiotics', 'Dr. Reddy''s Labs', 'Dr. Reddy''s', 15.00, 30.00, 'BATCH-DRR-001', 'Macrolide antibiotic tablet for respiratory infections', 4),
('MED-1021', 'Omez 20mg Capsule', 'Omeprazole', 'Gastrointestinal', 'Dr. Reddy''s Labs', 'Dr. Reddy''s', 4.50, 10.00, 'BATCH-DRR-002', 'Micro-pellet enteric coated capsule for hyperacidity and ulcers', 4),
('MED-1022', 'Nise 100mg', 'Nimesulide', 'Painkillers', 'Dr. Reddy''s Labs', 'Dr. Reddy''s', 3.80, 8.00, 'BATCH-DRR-003', 'Targeted preferential COX-2 inhibitor for acute inflammatory pain', 4),
('MED-1023', 'Stamlo 5mg', 'Amlodipine Besylate', 'Cardiovascular', 'Dr. Reddy''s Labs', 'Dr. Reddy''s', 3.00, 7.00, 'BATCH-DRR-004', 'Calcium channel blocker for hypertension management', 4),
('MED-1024', 'Econorm Probiotic Sachet', 'Saccharomyces Boulardii', 'Gastrointestinal', 'Dr. Reddy''s Labs', 'Dr. Reddy''s', 22.00, 45.00, 'BATCH-DRR-005', 'Therapeutic probiotic for antibiotic-associated diarrhea', 4),

-- Torrent
('MED-1025', 'Losartan Potassium 50mg', 'Losartan', 'Cardiovascular', 'Torrent Pharma', 'Torrent', 5.50, 12.50, 'BATCH-TOR-001', 'Angiotensin II receptor antagonist for hypertension', 5),
('MED-1026', 'Nebicard 5mg', 'Nebivolol', 'Cardiovascular', 'Torrent Pharma', 'Torrent', 7.20, 16.00, 'BATCH-TOR-002', 'Third-generation beta blocker with vasodilating activity', 5),
('MED-1027', 'Chymoral Forte Tablet', 'Trypsin + Chymotrypsin', 'Painkillers', 'Torrent Pharma', 'Torrent', 18.00, 38.00, 'BATCH-TOR-003', 'Proteolytic anti-inflammatory enzymes for edema resolution', 5),
('MED-1028', 'Nexpro Fast 40mg', 'Esomeprazole + Sodium Bicarb', 'Gastrointestinal', 'Torrent Pharma', 'Torrent', 8.00, 18.00, 'BATCH-TOR-004', 'Instant release dual mechanism proton pump inhibitor', 5),
('MED-1029T', 'Veloz 20mg', 'Rabeprazole Sodium', 'Gastrointestinal', 'Torrent Pharma', 'Torrent', 5.00, 11.50, 'BATCH-TOR-005', 'Gastric antisecretory medication for peptic ulcers', 5),

-- Lupin
('MED-1029', 'Gluconorm-G 2mg', 'Glimepiride + Metformin', 'Antidiabetic', 'Lupin Ltd', 'Lupin', 6.50, 14.00, 'BATCH-LUP-001', 'Dual combination for type 2 diabetes glycemic control', 6),
('MED-1030', 'Tonact 10mg', 'Atorvastatin Calcium', 'Cardiovascular', 'Lupin Ltd', 'Lupin', 7.00, 15.50, 'BATCH-LUP-002', 'Selective HMG-CoA reductase inhibitor for prevention', 6),
('MED-1031', 'Cefakind 500mg', 'Cefuroxime Axetil', 'Antibiotics', 'Lupin Ltd', 'Lupin', 28.00, 55.00, 'BATCH-LUP-003', '2nd-generation cephalosporin for respiratory infections', 6),
('MED-1032', 'Lupisulin N 100IU/ml', 'Isophane Insulin Human', 'Antidiabetic', 'Lupin Ltd', 'Lupin', 140.00, 260.00, 'BATCH-LUP-004', 'Intermediate-acting human insulin vial', 6),
('MED-1033L', 'Teleact 40mg', 'Telmisartan', 'Cardiovascular', 'Lupin Ltd', 'Lupin', 6.80, 15.00, 'BATCH-LUP-005', 'Longest half-life ARB for 24-hour blood pressure control', 6),

-- Abbott
('MED-1033', 'Thyronorm 50mcg', 'Levothyroxine Sodium', 'Endocrinology', 'Abbott India', 'Abbott', 2.20, 5.00, 'BATCH-ABB-001', 'Synthetic thyroid hormone for hypothyroidism', 7),
('MED-1034', 'Digene Antacid Gel 200ml', 'Aluminium Hydroxide + Simethicone', 'Gastrointestinal', 'Abbott India', 'Abbott', 65.00, 125.00, 'BATCH-ABB-002', 'Sugar-free soothing liquid antacid suspension', 7),
('MED-1035', 'Duphaston 10mg', 'Dydrogesterone', 'Gynecology', 'Abbott India', 'Abbott', 48.00, 95.00, 'BATCH-ABB-003', 'Selective progestogen for gynecological disorders', 7),
('MED-1036', 'Brufen 400mg', 'Ibuprofen', 'Painkillers', 'Abbott India', 'Abbott', 3.00, 7.00, 'BATCH-ABB-004', 'Standard NSAID tablet for musculoskeletal pain', 7),
('MED-1037A', 'Cremaffin Plus 225ml', 'Liquid Paraffin + Milk of Magnesia', 'Gastrointestinal', 'Abbott India', 'Abbott', 90.00, 175.00, 'BATCH-ABB-005', 'Emulsion laxative for gentle constipation management', 7),

-- Zydus
('MED-1037', 'Atorva 10mg', 'Atorvastatin', 'Cardiovascular', 'Zydus Healthcare', 'Zydus', 6.00, 13.50, 'BATCH-ZYD-001', 'Statin tablet to lower bad cholesterol', 8),
('MED-1038', 'Deriphyllin 150mg Retard', 'Theophylline + Etofylline', 'Respiratory', 'Zydus Healthcare', 'Zydus', 1.80, 4.00, 'BATCH-ZYD-002', 'Sustained release bronchodilator for asthma', 8),
('MED-1039', 'Aten 50mg', 'Atenolol', 'Cardiovascular', 'Zydus Healthcare', 'Zydus', 3.20, 7.50, 'BATCH-ZYD-003', 'Beta blocker for hypertension and angina', 8),
('MED-1040', 'Formonide 200 Inhaler', 'Formoterol + Budesonide', 'Respiratory', 'Zydus Healthcare', 'Zydus', 195.00, 340.00, 'BATCH-ZYD-004', 'Dual mechanism inhaler for asthma maintenance', 8),
('MED-1041Z', 'Pantodac 40mg', 'Pantoprazole', 'Gastrointestinal', 'Zydus Healthcare', 'Zydus', 5.20, 11.00, 'BATCH-ZYD-005', 'Proton pump inhibitor tablet for reflux', 8),

-- Mankind
('MED-1041', 'Moxikind-CV 625', 'Amoxicillin + Clavulanate', 'Antibiotics', 'Mankind Pharma', 'Mankind', 16.00, 34.00, 'BATCH-MAN-001', 'Broad-spectrum co-amoxiclav formulation', 9),
('MED-1042', 'Manforce 50mg', 'Sildenafil Citrate', 'Men''s Health', 'Mankind Pharma', 'Mankind', 25.00, 55.00, 'BATCH-MAN-002', 'PDE5 inhibitor tablet', 9),
('MED-1043', 'Candiforce 100mg Capsule', 'Itraconazole', 'Dermatology', 'Mankind Pharma', 'Mankind', 14.00, 30.00, 'BATCH-MAN-003', 'Broad-spectrum triazole antifungal capsule', 9),
('MED-1044', 'Dolo-650 Tablet', 'Paracetamol 650mg', 'Painkillers', 'Mankind Pharma', 'Mankind', 2.10, 5.00, 'BATCH-MAN-004', 'Antipyretic & analgesic tablet for fever and headaches', 9),
('MED-1045M', 'Gudcef 200mg', 'Cefpodoxime Proxetil', 'Antibiotics', 'Mankind Pharma', 'Mankind', 19.00, 40.00, 'BATCH-MAN-005', '3rd-generation oral cephalosporin antibiotic', 9),

-- Alkem
('MED-1045', 'Clavam 625mg', 'Amoxicillin + Clavulanic Acid', 'Antibiotics', 'Alkem Labs', 'Alkem', 18.00, 38.00, 'BATCH-ALK-001', 'Gold-standard penicillinase inhibitor combo', 10),
('MED-1046', 'Pan 40mg Tablet', 'Pantoprazole Sodium', 'Gastrointestinal', 'Alkem Labs', 'Alkem', 5.50, 12.00, 'BATCH-ALK-002', 'Delayed-release proton pump inhibitor', 10),
('MED-1047', 'Azee 500mg', 'Azithromycin Dihydrate', 'Antibiotics', 'Alkem Labs', 'Alkem', 20.00, 42.00, 'BATCH-ALK-003', '3-day course macrolide antibiotic', 10),
('MED-1048', 'Gemer 2mg Tablet', 'Glimepiride + Metformin SR', 'Antidiabetic', 'Alkem Labs', 'Alkem', 8.00, 17.00, 'BATCH-ALK-004', 'Dual mechanism sustained-release antidiabetic', 10),
('MED-1049A', 'Ondem 4mg Fast-Melt', 'Ondansetron', 'Gastrointestinal', 'Alkem Labs', 'Alkem', 4.00, 9.00, 'BATCH-ALK-005', 'Orally disintegrating antiemetic tablet', 10),

-- Glenmark
('MED-1049', 'Telma 40mg', 'Telmisartan', 'Cardiovascular', 'Glenmark', 'Glenmark', 7.50, 16.00, 'BATCH-GLN-001', 'Premier ARB antihypertensive tablet', 11),
('MED-1050', 'Ascoril D Plus Syrup 100ml', 'Dextromethorphan + Phenylephrine', 'Respiratory', 'Glenmark', 'Glenmark', 55.00, 110.00, 'BATCH-GLN-002', 'Cough formula for dry irritating allergic cough', 11),
('MED-1051', 'Candid-B Cream 20g', 'Clotrimazole + Beclomethasone', 'Dermatology', 'Glenmark', 'Glenmark', 42.00, 88.00, 'BATCH-GLN-003', 'Dual therapeutic broad-spectrum antifungal cream', 11),
('MED-1052', 'FabiFlu 400mg', 'Favipiravir', 'Antiviral', 'Glenmark', 'Glenmark', 35.00, 75.00, 'BATCH-GLN-004', 'Targeted RNA antiviral tablet', 11),
('MED-1053G', 'Glenmark Vitamin C 500mg', 'Ascorbic Acid + Zinc Oxide', 'Vitamins & Minerals', 'Glenmark', 'Glenmark', 3.00, 7.00, 'BATCH-GLN-005', 'Chewable antioxidant immune defense tablet with zinc', 11)
ON CONFLICT (medicine_code) DO NOTHING;
