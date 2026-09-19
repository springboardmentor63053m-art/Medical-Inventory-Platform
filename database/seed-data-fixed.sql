-- =========================================================
-- MEDISTOCK — Fixed Seed Data (matches Hibernate-generated schema)
-- =========================================================

-- ROLES
INSERT INTO roles (role_name, description) VALUES
('ADMIN',         'Full system access - manage users, medicines, suppliers, inventory, orders, reports'),
('PHARMACIST',    'Manage medicines, update inventory, create purchase orders, view reports'),
('STORE_MANAGER', 'Manage inventory, stock, view purchase orders, receive deliveries'),
('VIEWER',        'Read-only access - view dashboard, medicines, reports');

-- USERS  (password = BCrypt of 'password123')
-- users table has: full_name (NOT NULL), first_name, last_name, email, password, phone, status, role_id
INSERT INTO users (full_name, first_name, last_name, email, password, phone, status, role_id) VALUES
('Admin User',     'Admin', 'User',       'admin@medistock.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543210', 'ACTIVE', 1),
('John Pharmacist','John',  'Pharmacist', 'john@medistock.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543211', 'ACTIVE', 2),
('Jane Manager',   'Jane',  'Manager',    'jane@medistock.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543212', 'ACTIVE', 3),
('Bob Viewer',     'Bob',   'Viewer',     'bob@medistock.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543213', 'ACTIVE', 4),
('Alice Smith',    'Alice', 'Smith',      'alice@medistock.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543214', 'ACTIVE', 2);

-- MEDICINES
-- medicines table has: brand (NOT NULL), name (NOT NULL), medicine_code, medicine_name,
--   generic_name, category, manufacturer, unit_price, selling_price, batch_number, description
INSERT INTO medicines (brand, name, medicine_code, medicine_name, generic_name, category, manufacturer, unit_price, selling_price, batch_number, description) VALUES
('Cipla Ltd',  'Paracetamol 500mg',  'MED001', 'Paracetamol 500mg',  'Acetaminophen',       'Analgesic',       'Cipla Ltd',  2.50, 5.00,  'BATCH-2025-001', 'Pain reliever and fever reducer'),
('Sun Pharma', 'Amoxicillin 250mg',  'MED002', 'Amoxicillin 250mg',  'Amoxicillin',         'Antibiotic',      'Sun Pharma', 8.00, 15.00, 'BATCH-2025-002', 'Broad-spectrum antibiotic'),
('Dr Reddys',  'Metformin 500mg',    'MED003', 'Metformin 500mg',    'Metformin HCl',       'Antidiabetic',    'Dr Reddys',  3.00, 6.50,  'BATCH-2025-003', 'Oral diabetes medicine for type 2 diabetes'),
('Ranbaxy',    'Atorvastatin 10mg',  'MED004', 'Atorvastatin 10mg',  'Atorvastatin Calcium','Cardiovascular',  'Ranbaxy',    5.00, 12.00, 'BATCH-2025-004', 'Used to lower cholesterol and triglycerides'),
('Cipla Ltd',  'Omeprazole 20mg',    'MED005', 'Omeprazole 20mg',    'Omeprazole',          'Gastrointestinal','Cipla Ltd',  4.00, 9.00,  'BATCH-2025-005', 'Proton pump inhibitor for acid reflux'),
('Sun Pharma', 'Cetirizine 10mg',    'MED006', 'Cetirizine 10mg',    'Cetirizine HCl',      'Antihistamine',   'Sun Pharma', 1.50, 4.00,  'BATCH-2025-006', 'Antihistamine for allergic reactions'),
('Bayer',      'Aspirin 75mg',       'MED007', 'Aspirin 75mg',       'Acetylsalicylic Acid','Cardiovascular',  'Bayer',      2.00, 5.50,  'BATCH-2025-007', 'Blood thinner and pain reliever'),
('Cipla Ltd',  'Ibuprofen 400mg',    'MED008', 'Ibuprofen 400mg',    'Ibuprofen',           'Analgesic',       'Cipla Ltd',  3.50, 7.00,  'BATCH-2025-008', 'Nonsteroidal anti-inflammatory drug'),
('Zydus',      'Azithromycin 500mg', 'MED009', 'Azithromycin 500mg', 'Azithromycin',        'Antibiotic',      'Zydus',      12.00,25.00, 'BATCH-2025-009', 'Macrolide antibiotic'),
('Dr Reddys',  'Losartan 50mg',      'MED010', 'Losartan 50mg',      'Losartan Potassium',  'Cardiovascular',  'Dr Reddys',  6.00, 14.00, 'BATCH-2025-010', 'Used to treat high blood pressure');

-- SUPPLIERS
INSERT INTO suppliers (supplier_name, contact_person, email, phone, address, city, state, country, status) VALUES
('Cipla Distributors',   'Rajesh Kumar',  'rajesh@cipla.com',      '9800000001', '123 Pharma Street', 'Mumbai',    'Maharashtra', 'India', 'ACTIVE'),
('Sun Pharma Supply',    'Priya Sharma',  'priya@sunpharma.com',   '9800000002', '456 Medical Ave',   'Ahmedabad', 'Gujarat',     'India', 'ACTIVE'),
('Dr Reddys Wholesale',  'Vikram Singh',  'vikram@drreddys.com',   '9800000003', '789 Health Road',   'Hyderabad', 'Telangana',   'India', 'ACTIVE'),
('Ranbaxy Pharma',       'Sanjay Gupta',  'sanjay@ranbaxy.com',    '9800000004', '321 Medicine Lane', 'Delhi',     'Delhi',       'India', 'ACTIVE'),
('Bayer Healthcare',     'Meena Patel',   'meena@bayer.com',       '9800000005', '654 Drug Street',   'Pune',      'Maharashtra', 'India', 'ACTIVE'),
('Zydus Pharma',         'Arjun Mehta',   'arjun@zydus.com',       '9800000006', '987 Pharma Park',   'Vadodara',  'Gujarat',     'India', 'ACTIVE');

-- INVENTORY (medicine_id 1-10 correspond to MED001-MED010)
INSERT INTO inventory (medicine_id, quantity, minimum_stock, maximum_stock, location, last_updated) VALUES
(1, 500, 50,  1000, 'Shelf A1', NOW()),
(2, 200, 30,  500,  'Shelf B1', NOW()),
(3, 350, 40,  800,  'Shelf C1', NOW()),
(4, 120, 20,  300,  'Shelf D1', NOW()),
(5, 80,  25,  200,  'Shelf E1', NOW()),
(6, 450, 60,  900,  'Shelf F1', NOW()),
(7, 300, 40,  600,  'Shelf G1', NOW()),
(8, 150, 30,  400,  'Shelf H1', NOW()),
(9, 60,  20,  150,  'Shelf I1', NOW()),
(10, 90, 25,  250,  'Shelf J1', NOW());

-- EXPIRY TRACKING
INSERT INTO expiry_tracking (medicine_id, expiry_date, batch_number, quantity, status) VALUES
(1, '2026-12-31', 'BATCH-2025-001', 500, 'SAFE'),
(2, '2026-06-30', 'BATCH-2025-002', 200, 'SAFE'),
(3, '2025-09-30', 'BATCH-2025-003', 350, 'EXPIRING_SOON'),
(4, '2027-03-31', 'BATCH-2025-004', 120, 'SAFE'),
(5, '2025-08-15', 'BATCH-2025-005', 80,  'EXPIRING_SOON'),
(6, '2024-12-31', 'BATCH-2025-006', 30,  'EXPIRED');
