-- ============================================================
--  MEDICAL INVENTORY MANAGEMENT PLATFORM
--  Sample Data — Realistic Demo/Test Data
-- ============================================================

USE medical_inventory_db;

-- ============================================================
-- Roles
-- ============================================================
INSERT INTO roles (name, description) VALUES
('ADMIN',              'Full system access — User management, all modules, configuration'),
('PHARMACIST',         'Medicine dispensing, sales, stock lookup'),
('INVENTORY_MANAGER',  'Procurement, supplier management, stock control'),
('STAFF',              'Read-only access to inventory and dashboard');

-- ============================================================
-- Users (passwords are BCrypt of 'Admin@123', 'Pharma@123', 'Inv@12345', 'Staff@123')
-- ============================================================
INSERT INTO users (username, email, password, role_id, is_active) VALUES
('admin',      'admin@medicalinv.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7a', 1, TRUE),
('dr_patel',   'patel@medicalinv.com',   '$2a$10$WvF1HXZV8Q0BOYmS1TuDpO9NqnkDN15Riv.5/M7IHZKl48AGbYFNi', 2, TRUE),
('ravi_inv',   'ravi@medicalinv.com',    '$2a$10$e5V85kWK8nImHRaegKSbBukVK8eLCCsxlP8L5z1Pf5MdSHxM6fLSq', 3, TRUE),
('priya_staff','priya@medicalinv.com',   '$2a$10$Bx/zXDjfOLzZRNxh48VL7uO7VLmKHJPJBlO5dNXrXZXnT4UoYZBHa', 4, TRUE),
('sneha_ph',   'sneha@medicalinv.com',   '$2a$10$WvF1HXZV8Q0BOYmS1TuDpO9NqnkDN15Riv.5/M7IHZKl48AGbYFNi', 2, TRUE);

-- ============================================================
-- Employees
-- ============================================================
INSERT INTO employees (user_id, first_name, last_name, email, phone, department, designation, date_of_joining, status) VALUES
(1, 'Arjun',  'Sharma',  'admin@medicalinv.com',  '9876543210', 'Administration', 'System Administrator',   '2022-01-15', 'ACTIVE'),
(2, 'Rajesh', 'Patel',   'patel@medicalinv.com',  '9876543211', 'Pharmacy',       'Senior Pharmacist',      '2022-03-01', 'ACTIVE'),
(3, 'Ravi',   'Kumar',   'ravi@medicalinv.com',   '9876543212', 'Inventory',      'Inventory Manager',      '2022-06-10', 'ACTIVE'),
(4, 'Priya',  'Nair',    'priya@medicalinv.com',  '9876543213', 'General',        'Administrative Staff',   '2023-02-20', 'ACTIVE'),
(5, 'Sneha',  'Reddy',   'sneha@medicalinv.com',  '9876543214', 'Pharmacy',       'Junior Pharmacist',      '2023-07-01', 'ACTIVE');

-- ============================================================
-- Categories
-- ============================================================
INSERT INTO categories (name, description, parent_id, is_active) VALUES
('Antibiotics',         'Medicines that fight bacterial infections',                           NULL, TRUE),
('Analgesics',          'Pain-relief medicines',                                               NULL, TRUE),
('Antipyretics',        'Fever-reducing medicines',                                            NULL, TRUE),
('Antacids',            'Medicines for acidity and gastric relief',                            NULL, TRUE),
('Vitamins & Minerals', 'Dietary supplements and vitamins',                                    NULL, TRUE),
('Antidiabetics',       'Medicines for diabetes management',                                   NULL, TRUE),
('Antihypertensives',   'Medicines for blood pressure management',                             NULL, TRUE),
('Antihistamines',      'Medicines for allergies',                                             NULL, TRUE),
('Penicillin Group',    'Penicillin-based antibiotics',                                        1,    TRUE),
('NSAIDs',              'Non-Steroidal Anti-Inflammatory Drugs',                               2,    TRUE);

-- ============================================================
-- Suppliers (10 Records)
-- ============================================================
INSERT INTO suppliers (id, name, contact_person, email, phone, address, city, state, pincode, gst_number, license_number, is_active) VALUES
(1,  'Sun Pharma Distributors',     'Rajesh Kumar',  'rajesh@sunpharma.com',    '+91 9876543210', 'Plot 12, MIDC Industrial Area',           'Mumbai',    'Maharashtra',   '400093', '27AABCS1234A1Z5', 'MH-DL-2021-001', TRUE),
(2,  'Cipla MedCorp',              'Priya Sharma',  'contact@ciplamed.com',    '+91 9123456789', '22, Hosur Road, Electronic City',        'Bengaluru', 'Karnataka',     '560100', '29AABCC5678B1Z3', 'KA-DL-2020-045', TRUE),
(3,  'Dr. Reddy\'s Pharma Supply', 'Venkat Reddy',  'venkat@drreddys.com',     '+91 9988776655', '8-2-337, Road No. 3, Banjara Hills',      'Hyderabad', 'Telangana',     '500034', '36AAACR4567C1Z1', 'TS-DL-2019-088', TRUE),
(4,  'Mankind Pharma Ltd',         'Suresh Patel',  'suresh@mankind.in',       '+91 9811223344', 'A-35, Sector 60, Noida',                 'Noida',     'Uttar Pradesh', '201301', '09AAAIM3456D1Z2', 'UP-DL-2022-012', TRUE),
(5,  'Lupin Healthcare Distributors','Meena Joshi', 'meena@lupinhc.com',       '+91 9765432100', 'Kalpataru Point, Sion-Trombay Road',     'Mumbai',    'Maharashtra',   '400071', '27AAACL5678E1Z4', 'MH-DL-2020-078', TRUE),
(6,  'Alkem Laboratories',         'Amit Singhania','amit@alkem.com',          '+91 9654321098', 'Devashish, Premises Co-op Society',       'Mumbai',    'Maharashtra',   '400059', '27AAACA6789F1Z6', 'MH-DL-2021-033', TRUE),
(7,  'Abbott India Pharma',        'Kavitha Nair',  'kavitha@abbottindia.com', '+91 9543210987', '3/F, Godrej BKC, Bandra Kurla Complex',   'Mumbai',    'Maharashtra',   '400051', '27AAACA7890G1Z7', 'MH-DL-2018-099', TRUE),
(8,  'Torrent Pharmaceuticals',    'Bhavesh Mehta', 'bhavesh@torrentpharma.com','+91 9432109876', 'Torrent House, Off Ashram Road',          'Ahmedabad', 'Gujarat',       '380009', '24AAACT8901H1Z8', 'GJ-DL-2020-056', TRUE),
(9,  'Himalaya Drug Company',      'Deepak Rao',    'deepak@himalayawellness.com','+91 9321098765','Makali, Tumkur Road',                     'Bengaluru', 'Karnataka',     '562123', '29AAACH9012I1Z9', 'KA-DL-2019-021', TRUE),
(10, 'Zydus Healthcare Ltd',       'Pooja Verma',   'pooja@zydus.com',         '+91 9210987654', 'Zydus Corporate Park, SG Highway',        'Ahmedabad', 'Gujarat',       '382210', '24AAACZ0123J1Z0', 'GJ-DL-2021-077', TRUE);

-- ============================================================
-- Medicines (10 Records)
-- ============================================================
INSERT INTO medicines (id, name, generic_name, brand_name, category_id, supplier_id, unit, hsn_code, description, unit_price, mrp, reorder_level, status) VALUES
(1,  'Amoxicillin 500mg',          'Amoxicillin Trihydrate', 'Mox 500',   1, 1,  'Capsules', '3004.10', 'Broad-spectrum antibacterial medication',   12.50,  15.00, 100, 'ACTIVE'),
(2,  'Paracetamol 650mg',          'Acetaminophen',          'Dolo 650',  2, 2,  'Tablets',  '3004.90', 'Analgesic and antipyretic fever reducer',    2.00,   3.50, 200, 'ACTIVE'),
(3,  'Atorvastatin 10mg',          'Atorvastatin Calcium',   'Lipitor',   3, 3,  'Tablets',  '3004.90', 'Statin for cardiovascular & cholesterol',     8.00,  10.50,  50, 'ACTIVE'),
(4,  'Metformin 500mg',            'Metformin Hydrochloride','Glycomet',  4, 4,  'Tablets',  '3004.90', 'Blood sugar management for Type 2 Diabetes', 3.50,   5.00, 150, 'ACTIVE'),
(5,  'Vitamin D3 60000 IU',        'Cholecalciferol',        'D-Rise',    5, 5,  'Capsules', '3004.50', 'Nutritional vitamin D supplement',          18.00,  25.00,  80, 'ACTIVE'),
(6,  'Azithromycin 500mg',         'Azithromycin Dihydrate', 'Zithromax', 1, 6,  'Tablets',  '3004.10', 'Macrolide antibiotic for respiratory infection',22.00, 30.00,  60, 'ACTIVE'),
(7,  'Amlodipine 5mg',             'Amlodipine Besylate',    'Norvasc',   3, 7,  'Tablets',  '3004.90', 'Calcium channel blocker for hypertension',   5.00,   7.50, 120, 'ACTIVE'),
(8,  'Insulin Glargine 100IU/mL',  'Insulin Glargine',       'Lantus',    4, 8,  'Vials',    '3004.31', 'Long-acting insulin analogue for diabetes', 350.00, 420.00,  30, 'ACTIVE'),
(9,  'Ibuprofen 400mg',            'Ibuprofen',              'Brufen',    2, 9,  'Tablets',  '3004.90', 'NSAID pain reliever and anti-inflammatory',   3.00,   4.50, 180, 'ACTIVE'),
(10, 'Multivitamin & Multimineral','Multivitamin Complex',   'Supradyn',  5, 10, 'Tablets',  '3004.50', 'Daily essential multivitamin complex',       9.00,  13.00, 100, 'ACTIVE');

-- ============================================================
-- Inventory (10 Records)
-- ============================================================
INSERT INTO inventory (id, medicine_id, batch_number, quantity, min_quantity, manufacturing_dt, expiry_date, location) VALUES
(1,  1,  'AMX-2026-001', 500, 100, '2026-01-01', '2027-01-30', 'Shelf A1'),
(2,  2,  'DOL-2026-088',  45, 200, '2026-01-10', '2026-08-29', 'Shelf B2'),
(3,  3,  'LIP-2026-012', 300,  50, '2026-02-01', '2027-08-04', 'Shelf C3'),
(4,  4,  'GLI-2026-045', 620, 150, '2026-01-15', '2027-05-01', 'Shelf D1'),
(5,  5,  'DRS-2026-019', 200,  80, '2026-02-10', '2028-01-26', 'Shelf E2'),
(6,  6,  'ZIT-2026-033',  25,  60, '2026-01-20', '2026-08-19', 'Shelf A3'),
(7,  7,  'NOR-2026-007', 480, 120, '2026-03-01', '2027-09-08', 'Shelf C1'),
(8,  8,  'LAN-2026-062',  18,  30, '2026-02-15', '2026-11-02', 'Refrigerator R1'),
(9,  9,  'BRU-2026-041', 750, 180, '2026-01-05', '2027-05-31', 'Shelf B4'),
(10, 10, 'SUP-2026-028', 310, 100, '2026-03-10', '2028-08-03', 'Shelf F1');

-- ============================================================
-- Purchases
-- ============================================================
INSERT INTO purchases (invoice_number, supplier_id, purchase_date, total_amount, discount, tax_amount, net_amount, status, created_by) VALUES
('INV-2024-0001', 1, '2024-01-20', 8500.00,  500.00,  360.00,  8360.00,  'RECEIVED',  3),
('INV-2024-0002', 2, '2024-02-10', 12000.00, 600.00,  540.00,  11940.00, 'RECEIVED',  3),
('INV-2024-0003', 3, '2024-03-05', 6800.00,  200.00,  324.00,  6924.00,  'RECEIVED',  3),
('INV-2024-0004', 4, '2024-04-12', 15000.00, 750.00,  676.50,  14926.50, 'RECEIVED',  1),
('INV-2024-0005', 5, '2024-05-18', 9200.00,  400.00,  432.00,  9232.00,  'RECEIVED',  3),
('INV-2024-0006', 1, '2024-06-22', 11000.00, 550.00,  495.00,  10945.00, 'RECEIVED',  3),
('INV-2024-0007', 2, '2024-07-08', 7600.00,  380.00,  342.00,  7562.00,  'RECEIVED',  1),
('INV-2024-0008', 3, '2026-07-15', 13500.00, 675.00,  607.50,  13432.50, 'PENDING',   3);

-- ============================================================
-- Purchase Items
-- ============================================================
INSERT INTO purchase_items (purchase_id, medicine_id, batch_number, quantity, unit_cost, total_cost, expiry_date) VALUES
(1, 1,  'AMX-2024-001', 500, 7.50,  3750.00, '2026-01-14'),
(1, 4,  'PAR-2024-004', 600, 2.00,  1200.00, '2026-08-31'),
(1, 9,  'VTC-2024-009', 700, 2.50,  1750.00, '2026-12-31'),
(2, 2,  'AZI-2024-002', 300, 26.00, 7800.00, '2026-01-31'),
(2, 5,  'IBU-2024-005', 500, 4.20,  2100.00, '2026-02-14'),
(3, 7,  'OME-2024-007', 400, 8.00,  3200.00, '2026-03-31'),
(3, 11, 'MET-2024-011', 500, 4.00,  2000.00, '2026-02-28'),
(4, 10, 'VTD-2024-010', 200, 32.00, 6400.00, '2026-01-31'),
(4, 17, 'ATO-2024-017', 250, 16.00, 4000.00, '2026-02-04'),
(4, 14, 'TEL-2024-014', 300, 12.00, 3600.00, '2026-02-19'),
(5, 13, 'AML-2024-013', 400, 7.00,  2800.00, '2026-03-31'),
(5, 15, 'CET-2024-015', 450, 3.50,  1575.00, '2026-03-09'),
(6, 3,  'CIP-2024-003', 350, 10.50, 3675.00, '2026-01-09'),
(6, 8,  'PAN-2024-008', 300, 10.50, 3150.00, '2026-03-14'),
(7, 6,  'DIC-2024-006', 250, 5.80,  1450.00, '2025-08-31'),
(7, 12, 'GLI-2024-012', 200, 13.50, 2700.00, '2025-09-30'),
(7, 18, 'DOX-2024-018', 150, 20.00, 3000.00, '2025-10-31');

-- ============================================================
-- Sales
-- ============================================================
INSERT INTO sales (sale_number, customer_name, customer_phone, sale_date, total_amount, discount, tax_amount, net_amount, payment_method, status, created_by) VALUES
('SALE-2024-0001', 'Anita Desai',    '9001122334', '2024-02-01', 285.00, 0.00,   14.25,  299.25,  'CASH',      'COMPLETED', 2),
('SALE-2024-0002', 'Ramesh Verma',   '9002233445', '2024-02-05', 540.00, 20.00,  26.00,  546.00,  'CARD',      'COMPLETED', 2),
('SALE-2024-0003', 'Kavita Joshi',   '9003344556', '2024-02-15', 124.00, 0.00,   6.20,   130.20,  'UPI',       'COMPLETED', 5),
('SALE-2024-0004', 'Mohan Pillai',   '9004455667', '2024-03-02', 670.00, 30.00,  32.00,  672.00,  'CASH',      'COMPLETED', 2),
('SALE-2024-0005', 'Sunita Bose',    '9005566778', '2024-03-18', 320.00, 0.00,   16.00,  336.00,  'UPI',       'COMPLETED', 5),
('SALE-2024-0006', 'Arun Krishnan',  '9006677889', '2024-04-10', 180.00, 0.00,   9.00,   189.00,  'CASH',      'COMPLETED', 2),
('SALE-2024-0007', 'Divya Menon',    '9007788990', '2024-05-01', 1100.00,50.00,  52.50,  1102.50, 'CARD',      'COMPLETED', 5),
('SALE-2024-0008', 'Vikram Singh',   '9008899001', '2024-05-20', 450.00, 0.00,   22.50,  472.50,  'UPI',       'COMPLETED', 2),
('SALE-2024-0009', 'Meera Agarwal',  '9009900112', '2024-06-08', 240.00, 10.00,  11.50,  241.50,  'CASH',      'COMPLETED', 5),
('SALE-2024-0010', 'Kiran Rao',      '9010011223', '2024-06-25', 780.00, 0.00,   39.00,  819.00,  'INSURANCE', 'COMPLETED', 2);

-- ============================================================
-- Sale Items
-- ============================================================
INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, total_price) VALUES
(1,  4,  30, 4.00,   120.00),
(1,  9,  15, 5.00,    75.00),
(1,  15, 10, 6.50,    65.00),
(1,  7,   3, 8.50,    25.00), -- adjusted price
(2,  2,  10, 45.00,  450.00),
(2,  10,  2, 55.00,   90.00),
(3,  4,  20, 4.00,    80.00),
(3,  5,   6, 8.00,    44.00),
(4,  11, 60, 7.50,   450.00),
(4,  13, 30, 7.33,   220.00),
(5,  17, 10, 28.00,  280.00),
(5,  1,   5, 8.00,    40.00),
(6,  15, 20, 6.50,   130.00),
(6,  16, 10, 8.50,    85.00),
(7,  14, 30, 22.00,  660.00),
(7,  8,  20, 18.00,  360.00),
(7,  19, 10, 17.00,   80.00),
(8,  3,  20, 18.50,  370.00),
(8,  6,  10, 8.00,    80.00),
(9,  9,  20, 5.00,   100.00),
(9,  20, 15, 9.33,   140.00),
(10, 12, 20, 25.00,  500.00),
(10, 17, 10, 28.00,  280.00);

-- ============================================================
-- Stock Movements (key records — purchases + sales)
-- ============================================================
INSERT INTO stock_movements (medicine_id, movement_type, quantity, quantity_before, quantity_after, reference_type, reference_id, reason, performed_by) VALUES
(1,  'PURCHASE_IN',   500, 0,   500, 'PURCHASE', 1, 'Initial stock from INV-2024-0001', 3),
(4,  'PURCHASE_IN',   600, 0,   600, 'PURCHASE', 1, 'Initial stock from INV-2024-0001', 3),
(9,  'PURCHASE_IN',   700, 0,   700, 'PURCHASE', 1, 'Initial stock from INV-2024-0001', 3),
(2,  'PURCHASE_IN',   300, 0,   300, 'PURCHASE', 2, 'Initial stock from INV-2024-0002', 3),
(5,  'PURCHASE_IN',   500, 0,   500, 'PURCHASE', 2, 'Initial stock from INV-2024-0002', 3),
(4,  'SALE_OUT',       30, 600, 570, 'SALE',     1, 'Sale SALE-2024-0001',              2),
(9,  'SALE_OUT',       15, 700, 685, 'SALE',     1, 'Sale SALE-2024-0001',              2),
(2,  'SALE_OUT',       10, 300, 290, 'SALE',     2, 'Sale SALE-2024-0002',              2),
(11, 'SALE_OUT',       60, 600, 540, 'SALE',     4, 'Sale SALE-2024-0004',              2),
(17, 'SALE_OUT',       10, 200, 190, 'SALE',     5, 'Sale SALE-2024-0005',              5),
(6,  'ADJUSTMENT_IN',  50, 180, 230, NULL,      NULL,'Stock count adjustment — physical count 2024-04', 1),
(18, 'EXPIRED_OUT',    30, 150, 120, NULL,      NULL,'Batch DOX-2023-OLD expired — removed from stock',  1);

-- ============================================================
-- Alerts
-- ============================================================
INSERT INTO alerts (alert_type, medicine_id, message, status) VALUES
('LOW_STOCK',      18, 'Doxycycline 100mg Capsules stock (120) is below reorder level (30). Immediate reorder recommended.',                                          'ACTIVE'),
('EXPIRY_30_DAYS', 6,  'Diclofenac 50mg Tablets (Batch: DIC-2024-006) expires on 2025-08-31. Only 2 months remaining.',                                              'ACTIVE'),
('EXPIRY_30_DAYS', 12, 'Glimepiride 2mg Tablets (Batch: GLI-2024-012) expires on 2025-09-30. Please review and initiate return/disposal.',                           'ACTIVE'),
('EXPIRY_30_DAYS', 18, 'Doxycycline 100mg Capsules (Batch: DOX-2024-018) expires on 2025-10-31. Consider promotions or return to supplier.',                         'ACKNOWLEDGED'),
('LOW_STOCK',      2,  'Azithromycin 250mg Tablets stock (200) approaching reorder level (30). Consider placing a new purchase order with HealthFirst Supplies.',     'RESOLVED'),
('LOW_STOCK',      10, 'Vitamin D3 60000 IU Capsules stock (150) is approaching reorder level (30). Demand is high this quarter.',                                    'ACTIVE');
