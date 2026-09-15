-- ============================================================
-- MediStock Database Seed Data
-- MySQL — Database: medistock_db
--
-- Bulk realistic demo data:
--   40 suppliers, 260 medicines across dozens of categories/forms
--   (tablets, capsules, syrups, injections, creams, gels, solutions),
--   with a realistic mix of normal / low / out-of-stock / near-expiry /
--   expired records so every dashboard alert and report has real data
--   to show immediately.
--
-- Bulk PURCHASE HISTORY (1,000+ records) and SALES HISTORY (500+ bills)
-- are NOT hardcoded here, because they require valid foreign keys to
-- real user accounts (purchased_by / sold_by), which only exist once
-- you've registered at least one Admin/Pharmacist/Staff account through
-- the app. Instead, the backend's DataInitializer (runs automatically
-- on Spring Boot startup) generates that bulk purchase/sales history
-- for you — see backend/src/main/java/com/medistock/config/DataInitializer.java.
-- It is idempotent: it only seeds once, and skips seeding purchases/sales
-- until it finds real Pharmacist/Staff accounts to attribute them to.
--
-- Existing supplier columns:
-- name, contact_number, email, address
--
-- Existing medicine columns:
-- name, batch_number, category, supplier_id, quantity,
-- reorder_level, manufacturing_date, expiry_date, price
-- ============================================================

USE medistock_db;

-- ============================================================
-- Disable Safe Update Mode
-- This allows DELETE statements without a WHERE clause.
-- ============================================================

SET SQL_SAFE_UPDATES = 0;

-- ============================================================
-- Clear existing sample data
--
-- Medicines are referenced by sale_items (ON DELETE RESTRICT),
-- and by purchases + stock_movements (both ON DELETE CASCADE). Once
-- the app has been used for a while — or DataInitializer has already
-- generated its bulk demo purchase/sales history against the current
-- medicines — those child rows point at the exact medicine IDs this
-- script is about to replace. MySQL blocks the DELETE on `medicines`
-- with error 1451 until those referencing rows are cleared first.
--
-- WARNING: this clears ALL sales, purchases, and stock-movement
-- history, not just "sample" rows — because once the medicine catalog
-- underneath them is being replaced, that history no longer points to
-- anything meaningful anyway. Only run this on a dev/demo database.
-- If you want to keep real transactional history, do NOT run this
-- script — add new medicines through the app UI instead.
-- ============================================================

DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM stock_movements;
DELETE FROM purchases;
DELETE FROM medicines;
DELETE FROM suppliers;

-- ============================================================
-- Reset AUTO_INCREMENT
-- ============================================================

ALTER TABLE sale_items AUTO_INCREMENT = 1;
ALTER TABLE sales AUTO_INCREMENT = 1;
ALTER TABLE stock_movements AUTO_INCREMENT = 1;
ALTER TABLE purchases AUTO_INCREMENT = 1;
ALTER TABLE medicines AUTO_INCREMENT = 1;
ALTER TABLE suppliers AUTO_INCREMENT = 1;

-- ============================================================
-- SUPPLIERS — 40 demo suppliers
-- ============================================================

INSERT INTO suppliers
(name, contact_number, email, address)
VALUES
('MediCare Pharmaceuticals', '9000001001', 'contact@medicare-demo.com', '51 Market Road, Jaipur, Rajasthan 570639'),
('HealthPlus Distributors', '9000001002', 'contact@healthplus-demo.com', '69 Industrial Area, Secunderabad, Telangana 424676'),
('PharmaLink Suppliers', '9000001003', 'contact@pharmalink-demo.com', '8 Medical Avenue, Lucknow, Uttar Pradesh 533022'),
('LifeCare Medical Supplies', '9000001004', 'contact@lifecare-demo.com', '12 MG Road, Chennai, Tamil Nadu 513678'),
('MedSupply Healthcare', '9000001005', 'contact@medsupply-demo.com', '31 Industrial Area, Nagpur, Maharashtra 423780'),
('SafeMed Ltd', '9000001006', 'contact@safemed-demo.com', '8 Healthcare Road, Bhopal, Madhya Pradesh 548231'),
('Prime Pharma India', '9000001007', 'contact@primepharma-demo.com', '81 Pharma Nagar, Bengaluru, Karnataka 564478'),
('Wellness Drug Pharmaceuticals', '9000001008', 'contact@wellnessdrug-demo.com', '74 MG Road, Surat, Gujarat 553497'),
('TrustCare Distributors', '9000001009', 'contact@trustcare-demo.com', '29 MG Road, Kochi, Kerala 412212'),
('ApolloMed Suppliers', '9000001010', 'contact@apollomed-demo.com', '18 Civil Lines, Bhopal, Madhya Pradesh 475920'),
('CarePlus Medical Supplies', '9000001011', 'contact@careplus-demo.com', '70 Market Road, Nagpur, Maharashtra 430879'),
('Zenith Pharma Healthcare', '9000001012', 'contact@zenithpharma-demo.com', '72 Medical Colony, Surat, Gujarat 578783'),
('Sunrise Healthcare Ltd', '9000001013', 'contact@sunrisehealthc-demo.com', '75 Industrial Area, Ahmedabad, Gujarat 549738'),
('Vitalis India', '9000001014', 'contact@vitalis-demo.com', '13 Industrial Estate, Chennai, Tamil Nadu 543588'),
('Nova Pharma Pharmaceuticals', '9000001015', 'contact@novapharma-demo.com', '8 Medical Avenue, Vijayawada, Andhra Pradesh 562270'),
('Bright Life Distributors', '9000001016', 'contact@brightlife-demo.com', '88 Pharma Street, Chennai, Tamil Nadu 539388'),
('Unity Medical Suppliers', '9000001017', 'contact@unitymedical-demo.com', '41 Station Road, Nagpur, Maharashtra 522055'),
('Global Pharma Medical Supplies', '9000001018', 'contact@globalpharma-demo.com', '59 Green Park, Surat, Gujarat 494787'),
('Guardian Health Healthcare', '9000001019', 'contact@guardianhealth-demo.com', '24 Pharma Nagar, Kolkata, West Bengal 583238'),
('Everwell Ltd', '9000001020', 'contact@everwell-demo.com', '74 Industrial Area, Mumbai, Maharashtra 478709'),
('Meridian Pharma India', '9000001021', 'contact@meridianpharma-demo.com', '44 Pharma Street, Visakhapatnam, Andhra Pradesh 591220'),
('Aster Distributors Pharmaceuticals', '9000001022', 'contact@asterdistribut-demo.com', '78 Medical Colony, Indore, Madhya Pradesh 419190'),
('Horizon Medical Distributors', '9000001023', 'contact@horizonmedical-demo.com', '54 Health Park, Bengaluru, Karnataka 443244'),
('Pioneer Pharma Suppliers', '9000001024', 'contact@pioneerpharma-demo.com', '63 Market Road, Jaipur, Rajasthan 510546'),
('CrossCare Medical Supplies', '9000001025', 'contact@crosscare-demo.com', '10 Healthcare Industrial Area, Secunderabad, Telangana 546297'),
('Solace Health Healthcare', '9000001026', 'contact@solacehealth-demo.com', '41 Station Road, Surat, Gujarat 489162'),
('Radiant Pharma Ltd', '9000001027', 'contact@radiantpharma-demo.com', '64 Medical Avenue, Lucknow, Uttar Pradesh 552017'),
('Keystone Medical India', '9000001028', 'contact@keystonemedica-demo.com', '12 Industrial Area, Indore, Madhya Pradesh 470763'),
('Vantage Pharma Pharmaceuticals', '9000001029', 'contact@vantagepharma-demo.com', '86 Ring Road, Coimbatore, Tamil Nadu 417040'),
('Northstar Health Distributors', '9000001030', 'contact@northstarhealt-demo.com', '90 Ring Road, Secunderabad, Telangana 481162'),
('Silverline Pharma Suppliers', '9000001031', 'contact@silverlinephar-demo.com', '58 Healthcare Industrial Area, Surat, Gujarat 474606'),
('Evercare Distributors Medical Supplies', '9000001032', 'contact@evercaredistri-demo.com', '86 Green Park, Kochi, Kerala 490966'),
('Blueleaf Medical Healthcare', '9000001033', 'contact@blueleafmedica-demo.com', '46 Pharma Street, Hyderabad, Telangana 444053'),
('Redwood Pharma Ltd', '9000001034', 'contact@redwoodpharma-demo.com', '64 Industrial Area, Patna, Bihar 415455'),
('Summit Health India', '9000001035', 'contact@summithealth-demo.com', '37 Station Road, Chennai, Tamil Nadu 433906'),
('Ashoka Pharmaceuticals Pharmaceuticals', '9000001036', 'contact@ashokapharmace-demo.com', '51 Healthcare Road, Mumbai, Maharashtra 530157'),
('Kaveri Distributors Distributors', '9000001037', 'contact@kaveridistribu-demo.com', '58 Market Road, Vijayawada, Andhra Pradesh 505289'),
('Ganga Medical Supplies Suppliers', '9000001038', 'contact@gangamedicalsu-demo.com', '18 Medical Colony, Bhopal, Madhya Pradesh 512859'),
('Nilgiri Pharma Medical Supplies', '9000001039', 'contact@nilgiripharma-demo.com', '91 Medical Colony, Bhopal, Madhya Pradesh 508868'),
('Sahyadri Healthcare Healthcare', '9000001040', 'contact@sahyadrihealth-demo.com', '49 Healthcare Industrial Area, Lucknow, Uttar Pradesh 460491');

-- ============================================================
-- MEDICINES — 260 demo medicines across many categories & forms
-- ============================================================

INSERT INTO medicines
(name, batch_number, category, supplier_id, quantity, reorder_level, manufacturing_date, expiry_date, price)
VALUES
('Paracetamol 500mg Tablet', 'PAR-1001', 'Analgesic/Antipyretic', 12, 283, 15, '2025-04-02', '2028-08-07', 44.61),
('Paracetamol 250mg/5ml Syrup', 'PAR-1002', 'Analgesic/Antipyretic', 1, 349, 40, '2025-05-31', '2027-11-04', 43.25),
('Ibuprofen 200mg Tablet', 'IBU-1003', 'NSAID/Analgesic', 30, 356, 50, '2026-05-25', '2028-01-18', 225.69),
('Ibuprofen 100mg/5ml Syrup', 'IBU-1004', 'NSAID/Analgesic', 7, 74, 20, '2025-10-27', '2027-07-14', 124.53),
('Amoxicillin 250mg Capsule', 'AMO-1005', 'Antibiotic', 22, 137, 40, '2025-03-21', '2028-06-14', 153.38),
('Amoxicillin 250mg/5ml Syrup', 'AMO-1006', 'Antibiotic', 5, 364, 20, '2025-03-22', '2027-08-28', 219.59),
('Azithromycin 500mg Tablet', 'AZI-1007', 'Antibiotic', 31, 15, 30, '2025-10-10', '2028-04-21', 37.73),
('Azithromycin 200mg/5ml Syrup', 'AZI-1008', 'Antibiotic', 7, 404, 30, '2025-08-01', '2027-05-27', 189.42),
('Ceftriaxone 1g Injection', 'CEF-1009', 'Antibiotic/Injectable', 34, 305, 15, '2025-04-27', '2027-10-14', 309.61),
('Doxycycline 100mg Capsule', 'DOX-1010', 'Antibiotic', 34, 312, 20, '2026-04-13', '2028-06-19', 96.74),
('Metronidazole 400mg Tablet', 'MET-1011', 'Antibiotic/Antiprotozoal', 40, 81, 20, '2024-05-29', '2026-07-16', 204.39),
('Ciprofloxacin 250mg Tablet', 'CIP-1012', 'Antibiotic', 34, 178, 15, '2025-10-25', '2028-04-09', 127.25),
('Cefixime 200mg Tablet', 'CEF-1013', 'Antibiotic', 29, 231, 25, '2025-10-09', '2027-03-05', 203.67),
('Cetirizine 5mg Tablet', 'CET-1014', 'Antihistamine', 31, 372, 40, '2025-03-09', '2026-12-14', 55.6),
('Loratadine 10mg Tablet', 'LOR-1015', 'Antihistamine', 8, 15, 20, '2025-09-29', '2027-06-13', 228.17),
('Fexofenadine 180mg Tablet', 'FEX-1016', 'Antihistamine', 26, 406, 15, '2026-01-22', '2027-05-24', 120.08),
('Pantoprazole 20mg Tablet', 'PAN-1017', 'Antacid/PPI', 10, 144, 50, '2026-05-30', '2028-08-30', 150.98),
('Omeprazole 20mg Capsule', 'OME-1018', 'Antacid/PPI', 10, 406, 15, '2025-07-14', '2028-10-08', 140.78),
('Rabeprazole 20mg Tablet', 'RAB-1019', 'Antacid/PPI', 13, 153, 25, '2025-12-21', '2027-10-08', 207.93),
('Ranitidine 150mg Tablet', 'RAN-1020', 'Antacid', 17, 11, 15, '2026-03-18', '2028-03-26', 139.73),
('Domperidone 10mg Tablet', 'DOM-1021', 'Antiemetic', 35, 143, 30, '2025-07-22', '2028-08-27', 44.74),
('Ondansetron 4mg Tablet', 'OND-1022', 'Antiemetic', 10, 91, 40, '2025-10-23', '2027-11-11', 122.59),
('Metformin 1000mg Tablet', 'MET-1023', 'Antidiabetic', 7, 181, 20, '2024-11-21', '2027-01-25', 221.74),
('Glimepiride 1mg Tablet', 'GLI-1024', 'Antidiabetic', 36, 14, 15, '2025-11-28', '2027-11-11', 14.74),
('Sitagliptin 50mg Tablet', 'SIT-1025', 'Antidiabetic', 29, 15, 40, '2025-01-30', '2028-11-27', 130.97),
('Insulin Glargine 100IU/ml Injection', 'INS-1026', 'Hormone/Injectable', 29, 378, 15, '2025-12-05', '2027-08-16', 624.32),
('Insulin Aspart 100IU/ml Injection', 'INS-1027', 'Hormone/Injectable', 20, 399, 50, '2025-03-12', '2028-10-19', 779.41),
('Amlodipine 5mg Tablet', 'AML-1028', 'Antihypertensive', 9, 238, 15, '2025-12-28', '2028-04-24', 242.15),
('Losartan 25mg Tablet', 'LOS-1029', 'Antihypertensive', 28, 150, 30, '2026-05-29', '2027-12-13', 248.57),
('Telmisartan 40mg Tablet', 'TEL-1030', 'Antihypertensive', 2, 79, 50, '2026-06-20', '2028-01-10', 89.79),
('Atenolol 50mg Tablet', 'ATE-1031', 'Antihypertensive', 8, 2, 15, '2026-03-20', '2027-09-10', 246.39),
('Ramipril 2.5mg Tablet', 'RAM-1032', 'Antihypertensive', 18, 16, 50, '2025-10-13', '2028-02-01', 190.9),
('Atorvastatin 40mg Tablet', 'ATO-1033', 'Cardiac/Statin', 21, 163, 50, '2025-10-16', '2028-02-21', 29.65),
('Rosuvastatin 10mg Tablet', 'ROS-1034', 'Cardiac/Statin', 2, 7, 15, '2025-09-02', '2027-02-19', 161.53),
('Aspirin 75mg Tablet', 'ASP-1035', 'Antiplatelet/Cardiac', 1, 363, 25, '2026-02-26', '2027-04-24', 90.07),
('Clopidogrel 75mg Tablet', 'CLO-1036', 'Antiplatelet/Cardiac', 11, 366, 25, '2025-12-19', '2027-10-21', 71.38),
('Levothyroxine 25mg Tablet', 'LEV-1037', 'Thyroid Hormone', 29, 54, 25, '2026-07-04', '2027-08-26', 129.02),
('Montelukast 4mg Tablet', 'MON-1038', 'Respiratory', 33, 175, 30, '2025-12-16', '2028-03-14', 141.35),
('Salbutamol Inhaler 100mcg', 'SAL-1039', 'Bronchodilator', 35, 217, 40, '2025-06-25', '2028-11-16', 209.98),
('Salbutamol Nebulizer Solution 5mg/ml', 'SAL-1040', 'Bronchodilator', 13, 141, 50, '2026-07-03', '2028-01-31', 209.41),
('Ipratropium + Salbutamol Nebulizer Solution', 'IPR-1041', 'Bronchodilator', 1, 265, 25, '2026-03-27', '2027-05-29', 25.11),
('Budesonide Inhaler 200mcg', 'BUD-1042', 'Respiratory/Steroid', 33, 394, 20, '2026-08-12', '2027-10-09', 170.27),
('Diclofenac 100mg Tablet', 'DIC-1043', 'Analgesic', 11, 213, 25, '2025-12-08', '2028-06-25', 73.11),
('Diclofenac Gel 1% Gel 30g', 'DIC-1044', 'Topical Analgesic', 20, 240, 25, '2025-06-03', '2027-03-08', 60.72),
('Aceclofenac 100mg Tablet', 'ACE-1045', 'Analgesic', 16, 90, 25, '2025-09-12', '2027-05-09', 130.15),
('Tramadol 50mg Capsule', 'TRA-1046', 'Analgesic', 2, 334, 15, '2026-02-21', '2028-06-06', 80.51),
('Vitamin D3 60000mg Tablet', 'VIT-1047', 'Supplement', 21, 415, 25, '2025-09-08', '2028-09-06', 182.4),
('Vitamin C 500mg Tablet', 'VIT-1048', 'Supplement', 33, 131, 40, '2026-04-08', '2028-06-01', 159.81),
('Vitamin B12 1000mg Injection', 'VIT-1049', 'Injectable Supplement', 6, 98, 25, '2025-09-27', '2028-01-02', 81.5),
('Calcium 500mg Tablet', 'CAL-1050', 'Supplement', 2, 185, 30, '2025-03-23', '2026-12-16', 159.55),
('Iron + Folic Acid 1mg Tablet', 'IRO-1051', 'Supplement', 34, 83, 25, '2026-04-08', '2027-09-10', 23.98),
('Zinc Sulphate 20mg/5ml Syrup', 'ZIN-1052', 'Supplement', 30, 400, 30, '2025-08-02', '2027-10-03', 127.54),
('Multivitamin 1mg/5ml Syrup', 'MUL-1053', 'Supplement', 5, 450, 50, '2025-05-16', '2028-11-21', 153.13),
('Multivitamin 1mg Tablet', 'MUL-1054', 'Supplement', 31, 120, 50, '2025-06-28', '2028-11-20', 22.68),
('ORS Sachets', 'ORS-1055', 'Rehydration', 34, 316, 15, '2025-12-23', '2027-07-05', 77.1),
('Clotrimazole Cream 20g', 'CLO-1056', 'Antifungal/Topical', 2, 290, 40, '2026-01-24', '2027-09-14', 78.08),
('Fluconazole 150mg Tablet', 'FLU-1057', 'Antifungal', 5, 194, 40, '2025-09-05', '2027-12-16', 148.72),
('Hydrocortisone Cream 20g', 'HYD-1058', 'Topical Steroid', 24, 12, 30, '2025-09-13', '2027-01-07', 63.99),
('Betamethasone Cream 20g', 'BET-1059', 'Topical Steroid', 29, 226, 30, '2026-06-20', '2028-01-02', 106.11),
('Povidone Iodine Solution 10% 100ml', 'POV-1060', 'Antiseptic', 1, 111, 30, '2025-05-27', '2027-07-01', 86.54),
('Silver Sulfadiazine Cream 20g', 'SIL-1061', 'Topical Antibacterial', 17, 99, 40, '2025-07-27', '2027-12-17', 98.08),
('Chlorhexidine Solution 2% 100ml', 'CHL-1062', 'Antiseptic', 4, 216, 50, '2026-04-28', '2028-09-23', 75.91),
('Ivermectin 12mg Tablet', 'IVE-1063', 'Antiparasitic', 18, 264, 25, '2024-10-18', '2027-01-11', 113.57),
('Albendazole 400mg Tablet', 'ALB-1064', 'Antiparasitic', 6, 364, 30, '2025-10-09', '2029-01-21', 19.97),
('Folic Acid 5mg Tablet', 'FOL-1065', 'Supplement', 4, 281, 20, '2026-07-15', '2028-02-10', 228.68),
('Pregabalin 75mg Capsule', 'PRE-1066', 'Neuropathic Analgesic', 17, 128, 25, '2025-04-01', '2026-09-05', 186.85),
('Gabapentin 300mg Capsule', 'GAB-1067', 'Neuropathic Analgesic', 36, 152, 50, '2025-10-09', '2027-02-27', 169.87),
('Amitriptyline 25mg Tablet', 'AMI-1068', 'Antidepressant', 29, 139, 30, '2025-02-23', '2026-07-06', 227.31),
('Sertraline 50mg Tablet', 'SER-1069', 'Antidepressant', 12, 228, 20, '2025-06-11', '2027-09-03', 90.75),
('Escitalopram 10mg Tablet', 'ESC-1070', 'Antidepressant', 27, 232, 20, '2026-02-19', '2027-09-15', 100.65),
('Alprazolam 0.25mg Tablet', 'ALP-1071', 'Anxiolytic', 18, 327, 50, '2026-06-15', '2028-06-06', 146.98),
('Clonazepam 0.5mg Tablet', 'CLO-1072', 'Anxiolytic', 18, 298, 50, '2025-09-23', '2028-02-28', 225.02),
('Ondansetron 2mg Injection', 'OND-1073', 'Antiemetic', 9, 350, 30, '2025-03-24', '2028-04-27', 82.25),
('Furosemide 40mg Tablet', 'FUR-1074', 'Diuretic', 34, 220, 20, '2025-03-23', '2026-08-19', 215.02),
('Spironolactone 25mg Tablet', 'SPI-1075', 'Diuretic', 34, 428, 50, '2026-06-25', '2028-10-05', 243.2),
('Prednisolone 10mg Tablet', 'PRE-1076', 'Steroid', 36, 159, 20, '2026-03-01', '2028-07-18', 196.0),
('Dexamethasone 4mg Injection', 'DEX-1077', 'Steroid', 9, 407, 30, '2026-01-11', '2027-04-06', 492.27),
('Loperamide 2mg Tablet', 'LOP-1078', 'Antidiarrheal', 34, 159, 25, '2025-07-16', '2028-08-19', 236.34),
('Ergocalciferol 60000mg Capsule', 'ERG-1079', 'Supplement', 30, 283, 20, '2025-12-31', '2028-06-03', 75.42),
('Mefenamic Acid 250mg Tablet', 'MEF-1080', 'Analgesic', 27, 134, 15, '2026-01-04', '2028-05-06', 178.53),
('Nimesulide 100mg Tablet', 'NIM-1081', 'Analgesic', 17, 161, 25, '2025-03-10', '2028-04-30', 63.14),
('Cough Syrup DX 1mg/5ml Syrup', 'COU-1082', 'Cold & Flu', 24, 423, 25, '2025-03-05', '2028-05-12', 173.18),
('Chlorpheniramine 4mg Tablet', 'CHL-1083', 'Antihistamine', 13, 14, 20, '2026-02-07', '2027-07-27', 83.44),
('Ambroxol 30mg/5ml Syrup', 'AMB-1084', 'Mucolytic', 40, 288, 20, '2025-09-30', '2028-02-13', 127.98),
('Bromhexine 8mg Tablet', 'BRO-1085', 'Mucolytic', 26, 132, 40, '2025-12-12', '2028-02-11', 21.15),
('Amlodipine + Atenolol 1mg Tablet', 'AML-1086', 'Antihypertensive', 26, 420, 25, '2026-01-22', '2027-04-07', 116.81),
('Paracetamol 500mg Tablet', 'PAR-1087', 'Analgesic/Antipyretic', 13, 0, 50, '2025-02-13', '2028-04-04', 52.89),
('Paracetamol 250mg/5ml Syrup', 'PAR-1088', 'Analgesic/Antipyretic', 24, 36, 15, '2025-09-06', '2027-03-03', 246.37),
('Ibuprofen 200mg Tablet', 'IBU-1089', 'NSAID/Analgesic', 27, 234, 20, '2025-10-11', '2027-12-13', 239.23),
('Ibuprofen 100mg/5ml Syrup', 'IBU-1090', 'NSAID/Analgesic', 6, 322, 25, '2025-11-02', '2028-03-14', 19.92),
('Amoxicillin 500mg Capsule', 'AMO-1091', 'Antibiotic', 31, 277, 50, '2025-06-10', '2027-01-23', 15.33),
('Amoxicillin 125mg/5ml Syrup', 'AMO-1092', 'Antibiotic', 5, 72, 20, '2025-01-29', '2028-08-24', 202.41),
('Azithromycin 500mg Tablet', 'AZI-1093', 'Antibiotic', 22, 411, 25, '2025-05-06', '2028-11-18', 239.76),
('Azithromycin 200mg/5ml Syrup', 'AZI-1094', 'Antibiotic', 1, 103, 50, '2024-10-06', '2027-01-06', 182.62),
('Ceftriaxone 1g Injection', 'CEF-1095', 'Antibiotic/Injectable', 31, 178, 30, '2025-12-01', '2028-02-26', 553.74),
('Doxycycline 100mg Capsule', 'DOX-1096', 'Antibiotic', 32, 19, 50, '2025-09-17', '2028-11-20', 52.27),
('Metronidazole 200mg Tablet', 'MET-1097', 'Antibiotic/Antiprotozoal', 21, 100, 40, '2025-01-05', '2028-05-20', 216.42),
('Ciprofloxacin 500mg Tablet', 'CIP-1098', 'Antibiotic', 16, 332, 30, '2025-12-04', '2028-06-22', 106.68),
('Cefixime 200mg Tablet', 'CEF-1099', 'Antibiotic', 7, 141, 15, '2025-07-14', '2027-03-21', 247.05),
('Cetirizine 10mg Tablet', 'CET-1100', 'Antihistamine', 12, 405, 40, '2025-06-19', '2027-08-10', 64.68),
('Loratadine 10mg Tablet', 'LOR-1101', 'Antihistamine', 19, 422, 25, '2026-04-22', '2027-09-05', 75.61),
('Fexofenadine 180mg Tablet', 'FEX-1102', 'Antihistamine', 12, 156, 40, '2025-09-05', '2027-11-12', 67.37),
('Pantoprazole 40mg Tablet', 'PAN-1103', 'Antacid/PPI', 16, 369, 15, '2025-02-08', '2028-04-01', 130.77),
('Omeprazole 20mg Capsule', 'OME-1104', 'Antacid/PPI', 31, 241, 30, '2024-09-27', '2027-01-23', 221.64),
('Rabeprazole 20mg Tablet', 'RAB-1105', 'Antacid/PPI', 8, 159, 40, '2025-07-17', '2027-02-27', 20.19),
('Ranitidine 150mg Tablet', 'RAN-1106', 'Antacid', 39, 89, 15, '2025-10-21', '2028-09-25', 70.91),
('Domperidone 10mg Tablet', 'DOM-1107', 'Antiemetic', 3, 170, 20, '2025-02-14', '2027-01-21', 97.23),
('Ondansetron 4mg Tablet', 'OND-1108', 'Antiemetic', 21, 219, 40, '2025-10-14', '2027-03-02', 106.98),
('Metformin 500mg Tablet', 'MET-1109', 'Antidiabetic', 36, 389, 30, '2025-03-07', '2028-06-28', 125.01),
('Glimepiride 1mg Tablet', 'GLI-1110', 'Antidiabetic', 26, 386, 25, '2026-02-17', '2027-10-23', 176.29),
('Sitagliptin 50mg Tablet', 'SIT-1111', 'Antidiabetic', 37, 221, 15, '2025-05-21', '2028-10-02', 221.85),
('Insulin Glargine 100IU/ml Injection', 'INS-1112', 'Hormone/Injectable', 14, 81, 15, '2026-03-08', '2028-02-01', 686.83),
('Insulin Aspart 100IU/ml Injection', 'INS-1113', 'Hormone/Injectable', 11, 95, 30, '2026-08-03', '2028-07-21', 610.34),
('Amlodipine 10mg Tablet', 'AML-1114', 'Antihypertensive', 10, 74, 20, '2025-08-15', '2027-04-03', 92.2),
('Losartan 50mg Tablet', 'LOS-1115', 'Antihypertensive', 20, 110, 30, '2024-09-05', '2026-08-17', 38.65),
('Telmisartan 80mg Tablet', 'TEL-1116', 'Antihypertensive', 40, 50, 50, '2025-08-10', '2027-07-28', 174.55),
('Atenolol 50mg Tablet', 'ATE-1117', 'Antihypertensive', 31, 315, 30, '2025-10-03', '2027-05-22', 52.28),
('Ramipril 5mg Tablet', 'RAM-1118', 'Antihypertensive', 10, 61, 20, '2026-04-01', '2028-07-10', 67.79),
('Atorvastatin 40mg Tablet', 'ATO-1119', 'Cardiac/Statin', 21, 381, 40, '2025-10-20', '2027-10-22', 36.49),
('Rosuvastatin 20mg Tablet', 'ROS-1120', 'Cardiac/Statin', 38, 273, 25, '2026-08-26', '2028-05-11', 68.32),
('Aspirin 75mg Tablet', 'ASP-1121', 'Antiplatelet/Cardiac', 1, 268, 20, '2026-06-30', '2028-09-06', 157.77),
('Clopidogrel 75mg Tablet', 'CLO-1122', 'Antiplatelet/Cardiac', 31, 265, 25, '2025-10-02', '2027-12-22', 104.88),
('Levothyroxine 50mg Tablet', 'LEV-1123', 'Thyroid Hormone', 3, 230, 50, '2025-02-27', '2028-12-19', 162.02),
('Montelukast 4mg Tablet', 'MON-1124', 'Respiratory', 33, 53, 20, '2025-03-06', '2027-02-18', 224.56),
('Salbutamol Inhaler 100mcg', 'SAL-1125', 'Bronchodilator', 9, 391, 20, '2026-07-28', '2028-12-20', 245.58),
('Salbutamol Nebulizer Solution 5mg/ml', 'SAL-1126', 'Bronchodilator', 23, 359, 25, '2025-05-10', '2027-09-20', 155.73),
('Ipratropium + Salbutamol Nebulizer Solution', 'IPR-1127', 'Bronchodilator', 17, 0, 20, '2025-02-23', '2028-08-10', 129.54),
('Budesonide Inhaler 200mcg', 'BUD-1128', 'Respiratory/Steroid', 24, 365, 20, '2025-09-06', '2027-09-23', 16.91),
('Diclofenac 100mg Tablet', 'DIC-1129', 'Analgesic', 11, 84, 40, '2026-06-08', '2028-09-24', 199.69),
('Diclofenac Gel 1% Gel 30g', 'DIC-1130', 'Topical Analgesic', 36, 164, 15, '2026-06-22', '2028-06-13', 134.19),
('Aceclofenac 100mg Tablet', 'ACE-1131', 'Analgesic', 17, 224, 20, '2025-09-16', '2027-11-16', 98.93),
('Tramadol 50mg Capsule', 'TRA-1132', 'Analgesic', 15, 186, 15, '2025-12-12', '2028-05-24', 50.77),
('Vitamin D3 60000mg Tablet', 'VIT-1133', 'Supplement', 1, 360, 25, '2025-01-01', '2028-09-13', 188.8),
('Vitamin C 500mg Tablet', 'VIT-1134', 'Supplement', 4, 93, 50, '2025-11-03', '2027-01-04', 39.95),
('Vitamin B12 1000mg Injection', 'VIT-1135', 'Injectable Supplement', 20, 251, 20, '2025-01-25', '2028-08-01', 133.39),
('Calcium 500mg Tablet', 'CAL-1136', 'Supplement', 24, 47, 20, '2025-07-18', '2027-08-19', 158.99),
('Iron + Folic Acid 1mg Tablet', 'IRO-1137', 'Supplement', 7, 208, 50, '2025-11-04', '2028-01-28', 23.41),
('Zinc Sulphate 20mg/5ml Syrup', 'ZIN-1138', 'Supplement', 4, 349, 25, '2025-11-08', '2028-10-04', 164.08),
('Multivitamin 1mg/5ml Syrup', 'MUL-1139', 'Supplement', 16, 307, 15, '2025-05-10', '2027-01-07', 47.95),
('Multivitamin 1mg Tablet', 'MUL-1140', 'Supplement', 11, 348, 15, '2026-06-24', '2028-06-29', 22.13),
('ORS Sachets', 'ORS-1141', 'Rehydration', 27, 391, 40, '2025-01-26', '2028-09-29', 56.28),
('Clotrimazole Cream 20g', 'CLO-1142', 'Antifungal/Topical', 5, 314, 50, '2025-02-08', '2028-12-14', 80.66),
('Fluconazole 150mg Tablet', 'FLU-1143', 'Antifungal', 28, 405, 50, '2025-11-17', '2028-03-20', 188.34),
('Hydrocortisone Cream 20g', 'HYD-1144', 'Topical Steroid', 17, 400, 25, '2025-08-05', '2027-09-08', 64.22),
('Betamethasone Cream 20g', 'BET-1145', 'Topical Steroid', 36, 195, 40, '2025-10-13', '2027-10-11', 172.37),
('Povidone Iodine Solution 10% 100ml', 'POV-1146', 'Antiseptic', 33, 420, 20, '2025-02-05', '2027-07-08', 11.69),
('Silver Sulfadiazine Cream 20g', 'SIL-1147', 'Topical Antibacterial', 13, 234, 20, '2026-05-01', '2028-09-18', 221.0),
('Chlorhexidine Solution 2% 100ml', 'CHL-1148', 'Antiseptic', 34, 30, 30, '2025-07-24', '2028-12-24', 176.82),
('Ivermectin 12mg Tablet', 'IVE-1149', 'Antiparasitic', 26, 114, 20, '2025-11-28', '2027-01-15', 158.67),
('Albendazole 400mg Tablet', 'ALB-1150', 'Antiparasitic', 40, 398, 20, '2025-11-22', '2027-01-11', 232.81),
('Folic Acid 5mg Tablet', 'FOL-1151', 'Supplement', 3, 337, 15, '2025-06-25', '2029-01-31', 176.68),
('Pregabalin 75mg Capsule', 'PRE-1152', 'Neuropathic Analgesic', 25, 52, 15, '2024-08-14', '2027-01-17', 33.92),
('Gabapentin 300mg Capsule', 'GAB-1153', 'Neuropathic Analgesic', 31, 174, 50, '2026-03-26', '2027-10-10', 32.17),
('Amitriptyline 25mg Tablet', 'AMI-1154', 'Antidepressant', 17, 69, 25, '2025-10-17', '2028-12-14', 13.06),
('Sertraline 50mg Tablet', 'SER-1155', 'Antidepressant', 39, 1, 40, '2025-12-20', '2028-02-08', 129.9),
('Escitalopram 10mg Tablet', 'ESC-1156', 'Antidepressant', 23, 170, 40, '2026-08-25', '2028-12-13', 121.48),
('Alprazolam 0.25mg Tablet', 'ALP-1157', 'Anxiolytic', 11, 72, 25, '2025-05-18', '2026-12-17', 113.53),
('Clonazepam 0.5mg Tablet', 'CLO-1158', 'Anxiolytic', 32, 18, 30, '2025-06-26', '2027-12-03', 176.24),
('Ondansetron 2mg Injection', 'OND-1159', 'Antiemetic', 19, 0, 20, '2025-01-08', '2028-05-06', 622.52),
('Furosemide 40mg Tablet', 'FUR-1160', 'Diuretic', 32, 356, 15, '2026-04-09', '2027-11-12', 198.68),
('Spironolactone 25mg Tablet', 'SPI-1161', 'Diuretic', 26, 380, 30, '2025-05-27', '2027-01-07', 223.83),
('Prednisolone 5mg Tablet', 'PRE-1162', 'Steroid', 17, 234, 20, '2025-04-18', '2028-09-18', 111.59),
('Dexamethasone 4mg Injection', 'DEX-1163', 'Steroid', 35, 390, 40, '2025-06-17', '2027-01-16', 469.92),
('Loperamide 2mg Tablet', 'LOP-1164', 'Antidiarrheal', 29, 277, 20, '2026-02-13', '2028-03-06', 168.23),
('Ergocalciferol 60000mg Capsule', 'ERG-1165', 'Supplement', 9, 191, 50, '2025-01-03', '2028-05-15', 88.84),
('Mefenamic Acid 500mg Tablet', 'MEF-1166', 'Analgesic', 40, 410, 20, '2025-12-04', '2027-11-12', 45.41),
('Nimesulide 100mg Tablet', 'NIM-1167', 'Analgesic', 16, 122, 50, '2024-12-19', '2027-05-30', 87.39),
('Cough Syrup DX 1mg/5ml Syrup', 'COU-1168', 'Cold & Flu', 25, 420, 25, '2026-01-29', '2027-10-13', 44.53),
('Chlorpheniramine 4mg Tablet', 'CHL-1169', 'Antihistamine', 7, 238, 20, '2025-02-09', '2028-04-01', 162.39),
('Ambroxol 30mg/5ml Syrup', 'AMB-1170', 'Mucolytic', 28, 221, 50, '2025-02-14', '2028-03-31', 175.81),
('Bromhexine 8mg Tablet', 'BRO-1171', 'Mucolytic', 39, 260, 20, '2025-01-06', '2028-11-29', 186.65),
('Amlodipine + Atenolol 1mg Tablet', 'AML-1172', 'Antihypertensive', 38, 133, 50, '2026-07-09', '2028-03-21', 214.29),
('Paracetamol 650mg Tablet', 'PAR-1173', 'Analgesic/Antipyretic', 7, 415, 30, '2025-12-20', '2028-12-11', 224.53),
('Paracetamol 125mg/5ml Syrup', 'PAR-1174', 'Analgesic/Antipyretic', 28, 315, 30, '2025-10-27', '2028-11-03', 124.82),
('Ibuprofen 200mg Tablet', 'IBU-1175', 'NSAID/Analgesic', 1, 54, 15, '2025-10-18', '2027-08-27', 102.07),
('Ibuprofen 100mg/5ml Syrup', 'IBU-1176', 'NSAID/Analgesic', 13, 293, 40, '2025-02-01', '2028-06-19', 133.65),
('Amoxicillin 500mg Capsule', 'AMO-1177', 'Antibiotic', 24, 157, 30, '2025-07-07', '2028-11-12', 134.25),
('Amoxicillin 250mg/5ml Syrup', 'AMO-1178', 'Antibiotic', 40, 240, 25, '2025-11-21', '2028-01-26', 94.02),
('Azithromycin 250mg Tablet', 'AZI-1179', 'Antibiotic', 27, 250, 50, '2025-02-10', '2028-07-29', 229.54),
('Azithromycin 200mg/5ml Syrup', 'AZI-1180', 'Antibiotic', 20, 0, 40, '2025-05-06', '2027-07-25', 187.44),
('Ceftriaxone 1g Injection', 'CEF-1181', 'Antibiotic/Injectable', 14, 0, 15, '2025-05-13', '2028-09-22', 173.53),
('Doxycycline 100mg Capsule', 'DOX-1182', 'Antibiotic', 10, 289, 30, '2025-08-12', '2027-10-10', 93.46),
('Metronidazole 200mg Tablet', 'MET-1183', 'Antibiotic/Antiprotozoal', 23, 262, 50, '2025-06-05', '2028-11-15', 197.63),
('Ciprofloxacin 500mg Tablet', 'CIP-1184', 'Antibiotic', 31, 228, 25, '2025-08-15', '2027-08-20', 8.65),
('Cefixime 200mg Tablet', 'CEF-1185', 'Antibiotic', 31, 372, 15, '2026-08-28', '2027-12-19', 125.35),
('Cetirizine 10mg Tablet', 'CET-1186', 'Antihistamine', 4, 116, 25, '2026-03-06', '2028-06-08', 28.64),
('Loratadine 10mg Tablet', 'LOR-1187', 'Antihistamine', 1, 173, 25, '2025-06-02', '2028-08-26', 58.76),
('Fexofenadine 120mg Tablet', 'FEX-1188', 'Antihistamine', 12, 146, 20, '2025-11-15', '2028-01-29', 195.87),
('Pantoprazole 20mg Tablet', 'PAN-1189', 'Antacid/PPI', 36, 15, 20, '2025-07-01', '2028-11-21', 198.71),
('Omeprazole 20mg Capsule', 'OME-1190', 'Antacid/PPI', 8, 111, 20, '2026-06-28', '2028-04-10', 142.33),
('Rabeprazole 20mg Tablet', 'RAB-1191', 'Antacid/PPI', 30, 295, 20, '2025-07-23', '2027-05-30', 227.12),
('Ranitidine 150mg Tablet', 'RAN-1192', 'Antacid', 21, 221, 50, '2026-08-20', '2028-04-02', 121.25),
('Domperidone 10mg Tablet', 'DOM-1193', 'Antiemetic', 5, 84, 50, '2025-01-21', '2027-01-03', 51.69),
('Ondansetron 4mg Tablet', 'OND-1194', 'Antiemetic', 7, 57, 20, '2025-06-12', '2027-07-19', 131.57),
('Metformin 850mg Tablet', 'MET-1195', 'Antidiabetic', 22, 287, 25, '2026-07-21', '2028-06-03', 30.86),
('Glimepiride 1mg Tablet', 'GLI-1196', 'Antidiabetic', 28, 183, 15, '2026-03-06', '2027-10-08', 90.75),
('Sitagliptin 100mg Tablet', 'SIT-1197', 'Antidiabetic', 22, 236, 40, '2025-07-04', '2027-07-09', 129.91),
('Insulin Glargine 100IU/ml Injection', 'INS-1198', 'Hormone/Injectable', 22, 114, 50, '2025-05-29', '2027-01-23', 742.64),
('Insulin Aspart 100IU/ml Injection', 'INS-1199', 'Hormone/Injectable', 26, 361, 30, '2025-08-13', '2028-10-16', 601.24),
('Amlodipine 10mg Tablet', 'AML-1200', 'Antihypertensive', 39, 376, 15, '2025-12-27', '2028-09-21', 220.07),
('Losartan 25mg Tablet', 'LOS-1201', 'Antihypertensive', 12, 370, 15, '2025-05-17', '2026-12-26', 218.35),
('Telmisartan 40mg Tablet', 'TEL-1202', 'Antihypertensive', 36, 13, 20, '2025-07-03', '2027-01-17', 179.85),
('Atenolol 25mg Tablet', 'ATE-1203', 'Antihypertensive', 37, 0, 15, '2026-06-15', '2028-05-05', 163.31),
('Ramipril 2.5mg Tablet', 'RAM-1204', 'Antihypertensive', 27, 0, 30, '2026-01-08', '2027-02-19', 147.23),
('Atorvastatin 40mg Tablet', 'ATO-1205', 'Cardiac/Statin', 39, 0, 20, '2026-02-08', '2028-04-12', 151.26),
('Rosuvastatin 20mg Tablet', 'ROS-1206', 'Cardiac/Statin', 6, 360, 20, '2025-04-19', '2026-12-28', 163.97),
('Aspirin 75mg Tablet', 'ASP-1207', 'Antiplatelet/Cardiac', 8, 3, 20, '2025-07-22', '2027-04-24', 246.77),
('Clopidogrel 75mg Tablet', 'CLO-1208', 'Antiplatelet/Cardiac', 37, 65, 20, '2025-10-17', '2027-12-22', 66.63),
('Levothyroxine 100mg Tablet', 'LEV-1209', 'Thyroid Hormone', 6, 285, 30, '2026-06-04', '2028-10-28', 78.94),
('Montelukast 10mg Tablet', 'MON-1210', 'Respiratory', 3, 421, 50, '2025-06-24', '2028-09-06', 10.76),
('Salbutamol Inhaler 100mcg', 'SAL-1211', 'Bronchodilator', 20, 361, 30, '2025-07-31', '2027-02-12', 184.52),
('Salbutamol Nebulizer Solution 5mg/ml', 'SAL-1212', 'Bronchodilator', 31, 220, 15, '2025-06-08', '2028-10-03', 171.8),
('Ipratropium + Salbutamol Nebulizer Solution', 'IPR-1213', 'Bronchodilator', 25, 335, 25, '2026-05-19', '2027-11-19', 196.3),
('Budesonide Inhaler 400mcg', 'BUD-1214', 'Respiratory/Steroid', 40, 230, 40, '2026-07-15', '2028-08-24', 243.7),
('Diclofenac 50mg Tablet', 'DIC-1215', 'Analgesic', 39, 232, 20, '2025-12-24', '2028-01-13', 209.5),
('Diclofenac Gel 1% Gel 30g', 'DIC-1216', 'Topical Analgesic', 29, 182, 25, '2025-10-26', '2028-02-18', 76.56),
('Aceclofenac 100mg Tablet', 'ACE-1217', 'Analgesic', 10, 9, 40, '2025-04-03', '2027-09-19', 204.44),
('Tramadol 50mg Capsule', 'TRA-1218', 'Analgesic', 35, 152, 30, '2025-12-12', '2029-01-19', 28.59),
('Vitamin D3 60000mg Tablet', 'VIT-1219', 'Supplement', 39, 175, 50, '2025-09-29', '2027-08-30', 21.93),
('Vitamin C 500mg Tablet', 'VIT-1220', 'Supplement', 30, 77, 25, '2025-12-13', '2027-08-08', 138.82),
('Vitamin B12 1000mg Injection', 'VIT-1221', 'Injectable Supplement', 31, 138, 20, '2025-11-10', '2027-03-17', 409.26),
('Calcium 500mg Tablet', 'CAL-1222', 'Supplement', 37, 136, 40, '2026-06-26', '2027-08-22', 144.59),
('Iron + Folic Acid 1mg Tablet', 'IRO-1223', 'Supplement', 7, 114, 15, '2025-11-26', '2027-11-01', 97.94),
('Zinc Sulphate 20mg/5ml Syrup', 'ZIN-1224', 'Supplement', 18, 139, 15, '2025-10-05', '2028-07-14', 133.71),
('Multivitamin 1mg/5ml Syrup', 'MUL-1225', 'Supplement', 18, 195, 40, '2025-03-08', '2026-08-20', 111.08),
('Multivitamin 1mg Tablet', 'MUL-1226', 'Supplement', 13, 61, 15, '2025-03-03', '2027-01-17', 248.7),
('ORS Sachets', 'ORS-1227', 'Rehydration', 32, 0, 15, '2026-08-20', '2028-08-16', 237.22),
('Clotrimazole Cream 20g', 'CLO-1228', 'Antifungal/Topical', 6, 115, 50, '2025-01-08', '2028-10-28', 70.24),
('Fluconazole 150mg Tablet', 'FLU-1229', 'Antifungal', 29, 409, 20, '2026-03-27', '2027-07-28', 213.63),
('Hydrocortisone Cream 20g', 'HYD-1230', 'Topical Steroid', 23, 59, 15, '2025-06-23', '2027-09-03', 22.34),
('Betamethasone Cream 20g', 'BET-1231', 'Topical Steroid', 7, 386, 20, '2025-07-15', '2029-01-17', 43.04),
('Povidone Iodine Solution 10% 100ml', 'POV-1232', 'Antiseptic', 31, 226, 15, '2025-09-02', '2028-04-18', 86.39),
('Silver Sulfadiazine Cream 20g', 'SIL-1233', 'Topical Antibacterial', 16, 0, 15, '2026-02-28', '2028-04-05', 203.43),
('Chlorhexidine Solution 2% 100ml', 'CHL-1234', 'Antiseptic', 11, 251, 40, '2025-10-05', '2029-01-18', 232.5),
('Ivermectin 12mg Tablet', 'IVE-1235', 'Antiparasitic', 25, 223, 30, '2025-08-09', '2027-11-08', 211.82),
('Albendazole 400mg Tablet', 'ALB-1236', 'Antiparasitic', 8, 416, 20, '2025-10-05', '2027-02-09', 160.02),
('Folic Acid 5mg Tablet', 'FOL-1237', 'Supplement', 29, 176, 30, '2026-04-03', '2027-05-21', 218.72),
('Pregabalin 75mg Capsule', 'PRE-1238', 'Neuropathic Analgesic', 22, 197, 15, '2025-11-13', '2028-03-24', 202.6),
('Gabapentin 300mg Capsule', 'GAB-1239', 'Neuropathic Analgesic', 10, 178, 50, '2025-10-03', '2028-07-08', 244.83),
('Amitriptyline 25mg Tablet', 'AMI-1240', 'Antidepressant', 17, 96, 30, '2024-04-02', '2026-08-23', 190.67),
('Sertraline 50mg Tablet', 'SER-1241', 'Antidepressant', 25, 9, 15, '2025-05-12', '2027-05-09', 78.04),
('Escitalopram 10mg Tablet', 'ESC-1242', 'Antidepressant', 33, 304, 15, '2026-05-25', '2027-10-02', 90.5),
('Alprazolam 0.5mg Tablet', 'ALP-1243', 'Anxiolytic', 3, 152, 40, '2025-01-22', '2027-05-03', 228.7),
('Clonazepam 0.5mg Tablet', 'CLO-1244', 'Anxiolytic', 12, 346, 15, '2025-03-18', '2028-12-30', 55.6),
('Ondansetron 2mg Injection', 'OND-1245', 'Antiemetic', 14, 168, 50, '2025-01-21', '2028-07-31', 154.56),
('Furosemide 40mg Tablet', 'FUR-1246', 'Diuretic', 5, 98, 50, '2026-03-03', '2028-05-26', 175.52),
('Spironolactone 50mg Tablet', 'SPI-1247', 'Diuretic', 19, 2, 30, '2025-04-28', '2026-12-28', 211.74),
('Prednisolone 10mg Tablet', 'PRE-1248', 'Steroid', 18, 63, 25, '2025-04-30', '2027-05-29', 68.1),
('Dexamethasone 4mg Injection', 'DEX-1249', 'Steroid', 23, 96, 40, '2025-09-10', '2027-04-15', 418.68),
('Loperamide 2mg Tablet', 'LOP-1250', 'Antidiarrheal', 25, 3, 25, '2025-03-18', '2028-12-30', 147.47),
('Ergocalciferol 60000mg Capsule', 'ERG-1251', 'Supplement', 34, 85, 20, '2025-08-13', '2027-07-30', 202.69),
('Mefenamic Acid 250mg Tablet', 'MEF-1252', 'Analgesic', 7, 44, 15, '2024-10-28', '2027-03-21', 83.48),
('Nimesulide 100mg Tablet', 'NIM-1253', 'Analgesic', 2, 317, 30, '2025-07-16', '2027-08-14', 210.63),
('Cough Syrup DX 1mg/5ml Syrup', 'COU-1254', 'Cold & Flu', 23, 174, 15, '2025-07-19', '2027-04-18', 218.43),
('Chlorpheniramine 4mg Tablet', 'CHL-1255', 'Antihistamine', 8, 317, 20, '2025-03-13', '2028-08-10', 37.53),
('Ambroxol 30mg/5ml Syrup', 'AMB-1256', 'Mucolytic', 37, 360, 15, '2025-12-21', '2028-01-15', 119.82),
('Bromhexine 8mg Tablet', 'BRO-1257', 'Mucolytic', 26, 218, 25, '2026-08-22', '2028-01-27', 242.86),
('Amlodipine + Atenolol 1mg Tablet', 'AML-1258', 'Antihypertensive', 37, 0, 30, '2025-05-09', '2028-07-09', 202.66),
('Paracetamol 650mg Tablet', 'PAR-1259', 'Analgesic/Antipyretic', 23, 75, 50, '2025-09-22', '2027-12-21', 68.33),
('Paracetamol 125mg/5ml Syrup', 'PAR-1260', 'Analgesic/Antipyretic', 21, 150, 15, '2025-08-27', '2027-05-04', 112.8);

-- ============================================================
-- Re-enable Safe Update Mode
-- ============================================================

SET SQL_SAFE_UPDATES = 1;

-- ============================================================
-- VERIFY COUNTS
-- ============================================================

SELECT COUNT(*) AS total_suppliers FROM suppliers;
SELECT COUNT(*) AS total_medicines FROM medicines;

-- ============================================================
-- STOCK STATUS BREAKDOWN (useful sanity check after seeding)
-- ============================================================

SELECT
    CASE
        WHEN expiry_date < CURDATE() THEN 'EXPIRED'
        WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'NEAR_EXPIRY'
        WHEN quantity = 0 THEN 'OUT_OF_STOCK'
        WHEN quantity <= reorder_level THEN 'LOW_STOCK'
        ELSE 'OK'
    END AS stock_status,
    COUNT(*) AS medicine_count
FROM medicines
GROUP BY stock_status;

-- ============================================================
-- SUPPLIER + MEDICINE JOIN
-- Useful for verifying the relationship
-- ============================================================

SELECT
    m.id AS medicine_id,
    m.name AS medicine_name,
    m.category,
    m.quantity,
    m.reorder_level,
    m.price,
    s.name AS supplier_name,
    s.contact_number,
    s.email
FROM medicines m
JOIN suppliers s
    ON m.supplier_id = s.id
ORDER BY m.id
LIMIT 50;
