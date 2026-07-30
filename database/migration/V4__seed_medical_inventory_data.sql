-- Flyway Migration V4: Seed Medical Inventory Data

-- 1. Insert Categories (5 Categories)
INSERT INTO categories (name, description) VALUES
('Antibiotics', 'Antibacterial medications to fight infections'),
('Pain Relief', 'Analgesic and anti-inflammatory medications'),
('Vitamins', 'Dietary supplements and multivitamin tablets'),
('Antihistamines', 'Allergy and antihistamine medications'),
('Diabetes', 'Blood sugar control and insulin management medications');

-- 2. Insert Medicines (15 Medicines)
INSERT INTO medicines (category_id, medicine_code, name, generic_name, manufacturer, dosage, unit_price, reorder_level, description, status) VALUES
(1, 'MED-001', 'Amoxicillin 250mg', 'Amoxicillin Trihydrate', 'Cipla Ltd', '250mg', 12.50, 50, 'Broad-spectrum antibiotic capsule', 'ACTIVE'),
(1, 'MED-002', 'Azithromycin 500mg', 'Azithromycin', 'Pfizer Inc', '500mg', 28.00, 30, 'Macrolide antibiotic tablet', 'ACTIVE'),
(2, 'MED-003', 'Paracetamol 500mg', 'Acetaminophen', 'Sun Pharma', '500mg', 5.00, 100, 'Antipyretic and analgesic tablet', 'ACTIVE'),
(2, 'MED-004', 'Ibuprofen 400mg', 'Ibuprofen', 'Dr. Reddys Labs', '400mg', 8.50, 80, 'Nonsteroidal anti-inflammatory drug', 'ACTIVE'),
(2, 'MED-005', 'Dolo 650', 'Paracetamol 650mg', 'Micro Labs', '650mg', 6.00, 150, 'Fever and pain reducer tablet', 'ACTIVE'),
(2, 'MED-006', 'Crocin 500mg', 'Paracetamol', 'GSK Consumer', '500mg', 5.50, 100, 'Fast fever relief tablet', 'ACTIVE'),
(2, 'MED-007', 'Diclofenac 50mg', 'Diclofenac Sodium', 'Novartis', '50mg', 11.00, 40, 'Pain reliever for joint and muscular pain', 'ACTIVE'),
(3, 'MED-008', 'Vitamin C 500mg', 'Ascorbic Acid', 'Abbott Labs', '500mg', 7.00, 60, 'Immunity booster chewable tablet', 'ACTIVE'),
(3, 'MED-009', 'Zinc Tablets 50mg', 'Zinc Gluconate', 'Apollo Healthcare', '50mg', 9.00, 50, 'Essential mineral supplement', 'ACTIVE'),
(3, 'MED-010', 'Calcium Tablets 500mg', 'Calcium Carbonate', 'Torrent Pharma', '500mg', 14.00, 40, 'Bone health calcium supplement', 'ACTIVE'),
(4, 'MED-011', 'Cetirizine 10mg', 'Cetirizine Hydrochloride', 'Zydus Cadila', '10mg', 4.50, 75, 'Anti-allergy antihistamine tablet', 'ACTIVE'),
(4, 'MED-012', 'Omeprazole 20mg', 'Omeprazole', 'AstraZeneca', '20mg', 15.00, 40, 'Proton pump inhibitor for acid reflux', 'ACTIVE'),
(4, 'MED-013', 'Pantoprazole 40mg', 'Pantoprazole Sodium', 'Lupin Ltd', '40mg', 18.00, 40, 'Gastro-resistant tablet for heartburn', 'ACTIVE'),
(5, 'MED-014', 'Metformin 500mg', 'Metformin Hydrochloride', 'Sanofi', '500mg', 10.00, 90, 'Oral antidiabetic medication', 'ACTIVE'),
(3, 'MED-015', 'ORS Powder', 'Oral Rehydration Salts', 'Cipla Ltd', '21.8g', 4.00, 200, 'Rehydration electrolyte sachet', 'ACTIVE');

-- 3. Insert Suppliers (5 Suppliers)
INSERT INTO suppliers (supplier_code, supplier_name, contact_person, phone, email, address, city, state, country) VALUES
('SUP-001', 'Cipla Healthcare Ltd', 'Rajesh Sharma', '+91-9876543210', 'orders@cipla.com', '123 Pharma Park', 'Mumbai', 'Maharashtra', 'India'),
('SUP-002', 'Sun Pharmaceutical Ltd', 'Anil Mehta', '+91-9812345678', 'supply@sunpharma.com', '45 Industrial Estate', 'Vadodara', 'Gujarat', 'India'),
('SUP-003', 'Dr. Reddys Laboratories', 'Suresh Kumar', '+91-9988776655', 'sales@drreddys.com', '78 BioTech Zone', 'Hyderabad', 'Telangana', 'India'),
('SUP-004', 'Pfizer India Corp', 'David Miller', '+1-800-555-0199', 'distrib@pfizer.com', '900 Global Trade Sq', 'New York', 'NY', 'USA'),
('SUP-005', 'Apollo Healthcare Supplies', 'Priya Nair', '+91-9445566778', 'logistics@apollohealth.com', '12 Greams Road', 'Chennai', 'Tamil Nadu', 'India');

-- 4. Insert Inventory Items (15 Inventory items matching all medicines)
INSERT INTO inventory (medicine_id, quantity, minimum_stock, batch_number, expiry_date, storage_location) VALUES
(1, 250, 50, 'BT-AMX-2026', '2027-08-30', 'Shelf-A1'),
(2, 180, 30, 'BT-AZI-2026', '2027-06-15', 'Shelf-A2'),
(3, 850, 100, 'BT-PCT-2026', '2028-01-20', 'Shelf-B1'),
(4, 400, 80, 'BT-IBU-2026', '2027-11-10', 'Shelf-B2'),
(5, 600, 150, 'BT-DOL-2026', '2028-03-15', 'Shelf-B3'),
(6, 500, 100, 'BT-CRO-2026', '2027-12-01', 'Shelf-B4'),
(7, 150, 40, 'BT-DIC-2026', '2026-12-30', 'Shelf-B5'),
(8, 350, 60, 'BT-VTC-2026', '2028-05-18', 'Shelf-C1'),
(9, 200, 50, 'BT-ZNC-2026', '2027-10-05', 'Shelf-C2'),
(10, 180, 40, 'BT-CLC-2026', '2027-09-22', 'Shelf-C3'),
(11, 450, 75, 'BT-CET-2026', '2028-02-14', 'Shelf-D1'),
(12, 220, 40, 'BT-OME-2026', '2027-04-10', 'Shelf-D2'),
(13, 300, 40, 'BT-PAN-2026', '2027-07-25', 'Shelf-D3'),
(14, 500, 90, 'BT-MET-2026', '2028-06-30', 'Shelf-E1'),
(15, 1000, 200, 'BT-ORS-2026', '2028-11-15', 'Shelf-E2');

-- 5. Insert Purchase Orders (5 Purchase Orders)
INSERT INTO purchase_orders (supplier_id, order_number, order_date, expected_delivery, status, total_amount) VALUES
(1, 'PO-2026-001', '2026-07-01', '2026-07-07', 'RECEIVED', 3125.00),
(2, 'PO-2026-002', '2026-07-10', '2026-07-16', 'RECEIVED', 4250.00),
(3, 'PO-2026-003', '2026-07-15', '2026-07-22', 'APPROVED', 6800.00),
(4, 'PO-2026-004', '2026-07-20', '2026-07-28', 'APPROVED', 5600.00),
(5, 'PO-2026-005', '2026-07-25', '2026-08-02', 'PENDING', 2150.00);

-- 6. Insert Purchase Order Items (Order items for POs)
INSERT INTO purchase_order_items (purchase_order_id, medicine_id, quantity, unit_price, subtotal) VALUES
(1, 1, 100, 12.50, 1250.00),
(1, 15, 468, 4.00, 1875.00),
(2, 3, 500, 5.00, 2500.00),
(2, 5, 291, 6.00, 1750.00),
(3, 4, 400, 8.50, 3400.00),
(3, 7, 309, 11.00, 3400.00),
(4, 2, 200, 28.00, 5600.00),
(5, 8, 200, 7.00, 1400.00),
(5, 11, 166, 4.50, 750.00);

-- 7. Insert Stock Transactions (At least 20 transactions)
INSERT INTO stock_transactions (medicine_id, transaction_type, quantity, reference_number, remarks, transaction_date) VALUES
(1, 'IN', 200, 'TXN-1001', 'Initial stock intake from Cipla', '2026-07-02 09:00:00'),
(1, 'OUT', 15, 'TXN-1002', 'Dispensed for OPD Prescription #101', '2026-07-03 10:30:00'),
(2, 'IN', 150, 'TXN-1003', 'Batch receipt Pfizer shipment', '2026-07-04 11:15:00'),
(2, 'OUT', 10, 'TXN-1004', 'Dispensed for OPD Prescription #105', '2026-07-05 14:20:00'),
(3, 'IN', 500, 'TXN-1005', 'Bulk intake Paracetamol 500mg', '2026-07-06 08:45:00'),
(3, 'OUT', 50, 'TXN-1006', 'Ward transfer - Emergency Ward', '2026-07-07 16:00:00'),
(4, 'IN', 300, 'TXN-1007', 'Stock purchase delivery', '2026-07-08 09:30:00'),
(4, 'OUT', 20, 'TXN-1008', 'Dispensed for Prescription #112', '2026-07-09 11:45:00'),
(5, 'IN', 400, 'TXN-1009', 'Dolo 650 initial batch intake', '2026-07-10 10:00:00'),
(5, 'OUT', 30, 'TXN-1010', 'Ward transfer - ICU Ward', '2026-07-11 13:15:00'),
(6, 'IN', 300, 'TXN-1011', 'Crocin stock intake', '2026-07-12 15:00:00'),
(6, 'OUT', 25, 'TXN-1012', 'Dispensed for Prescription #120', '2026-07-13 09:10:00'),
(7, 'IN', 100, 'TXN-1013', 'Diclofenac intake', '2026-07-14 11:00:00'),
(8, 'IN', 250, 'TXN-1014', 'Vitamin C batch receipt', '2026-07-15 14:30:00'),
(9, 'IN', 150, 'TXN-1015', 'Zinc tablets intake', '2026-07-16 10:20:00'),
(10, 'IN', 120, 'TXN-1016', 'Calcium tablets intake', '2026-07-17 12:00:00'),
(11, 'IN', 300, 'TXN-1017', 'Cetirizine stock receipt', '2026-07-18 16:45:00'),
(12, 'IN', 150, 'TXN-1018', 'Omeprazole stock intake', '2026-07-19 09:40:00'),
(13, 'IN', 200, 'TXN-1019', 'Pantoprazole batch receipt', '2026-07-20 11:50:00'),
(14, 'IN', 400, 'TXN-1020', 'Metformin intake', '2026-07-21 14:10:00'),
(15, 'IN', 800, 'TXN-1021', 'ORS powder bulk intake', '2026-07-22 15:30:00'),
(1, 'ADJUSTMENT', 5, 'TXN-1022', 'Damaged foil packaging adjustment', '2026-07-23 17:00:00');

-- 8. Insert Inventory Audit Records
INSERT INTO inventory_audit (medicine_id, previous_quantity, new_quantity, updated_by, reason, audit_date) VALUES
(1, 255, 250, NULL, 'Quarterly physical stock reconciliation', '2026-07-24 10:00:00'),
(3, 900, 850, NULL, 'Monthly inventory verification', '2026-07-24 11:30:00'),
(5, 630, 600, NULL, 'Damaged box discard adjustment', '2026-07-25 14:00:00'),
(15, 1050, 1000, NULL, 'Discrepancy count correction', '2026-07-26 16:15:00');
