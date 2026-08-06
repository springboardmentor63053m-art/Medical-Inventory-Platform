-- ============================================
-- Sample data for MediStock (optional)
-- Run after the backend has started once (so Hibernate has created tables).
-- Create users via /api/auth/register instead of inserting rows directly,
-- so passwords get BCrypt-hashed correctly by the app.
-- ============================================

USE medistock_db;

INSERT INTO suppliers (name, contact_number, email, address) VALUES
('Sunrise Pharma Distributors', '9876543210', 'contact@sunrisepharma.com', '12 MG Road, Pune, MH'),
('Wellness Medical Supplies', '9123456780', 'sales@wellnessmed.com', '45 Baner Road, Pune, MH'),
('CareCross Healthcare Ltd', '9988776655', 'info@carecross.com', '78 FC Road, Pune, MH');

INSERT INTO medicines (name, batch_number, category, supplier_id, quantity, reorder_level, manufacturing_date, expiry_date, price) VALUES
('Paracetamol 500mg', 'BATCH-A101', 'Analgesic', 1, 150, 30, '2025-01-10', '2027-01-10', 25.50),
('Amoxicillin 250mg', 'BATCH-B202', 'Antibiotic', 2, 12, 20, '2025-03-05', '2026-09-15', 85.00),
('Cetirizine 10mg', 'BATCH-C303', 'Antihistamine', 1, 200, 40, '2025-02-20', '2027-06-01', 18.75),
('Insulin Glargine', 'BATCH-D404', 'Hormone', 3, 5, 15, '2025-05-01', '2026-08-20', 650.00),
('Ibuprofen 400mg', 'BATCH-E505', 'Analgesic', 2, 0, 25, '2024-11-15', '2026-08-25', 32.00),
('Metformin 500mg', 'BATCH-F606', 'Antidiabetic', 3, 90, 30, '2025-04-12', '2027-04-12', 45.20);

-- After registering users through the app (recommended roles to create for
-- testing all three dashboards):
--   admin@medistock.com      / Password123  -> role ADMIN
--   pharmacist@medistock.com / Password123  -> role PHARMACIST
--   staff@medistock.com      / Password123  -> role STAFF
