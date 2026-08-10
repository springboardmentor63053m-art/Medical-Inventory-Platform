-- Flyway Migration V17: Seed & Link User Accounts for All 10 Canonical Supplier Companies

-- 1. Ensure SUPPLIER role exists
INSERT INTO roles (name, description) VALUES ('SUPPLIER', 'Supplier Partner Role') ON CONFLICT (name) DO NOTHING;

-- 2. Insert User Accounts for remaining 9 Supplier Companies
INSERT INTO users (employee_id, first_name, last_name, email, password, phone, enabled, account_non_locked) VALUES
('SUP002', 'Rajesh', 'Sharma (Cipla)', 'orders@cipla.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+91 22-6644-8000', TRUE, TRUE),
('SUP003', 'Emma', 'Watson (AstraZeneca)', 'orders@astrazeneca.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+44 20-3749-5000', TRUE, TRUE),
('SUP004', 'Hans', 'Mueller (Bayer)', 'orders@bayer.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+49 214-301', TRUE, TRUE),
('SUP005', 'Michael', 'Brown (Abbott)', 'orders@abbott.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+1 224-667-6100', TRUE, TRUE),
('SUP006', 'Rakesh', 'Verma (Alkem)', 'sales@alkem.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+91 22-3982-9999', TRUE, TRUE),
('SUP007', 'Kiran', 'Mazumdar (Biocon)', 'orders@biocon.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+91 80-2808-2808', TRUE, TRUE),
('SUP008', 'Venkatesh', 'Rao (Aurobindo)', 'info@aurobindo.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+91 40-6672-5000', TRUE, TRUE),
('SUP009', 'John', 'Smith (Baxter)', 'supply@baxter.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+1 224-948-2000', TRUE, TRUE),
('SUP010', 'Hubertus', 'von Baumbach (Boehringer)', 'supply@boehringer.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+49 6132-770', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Assign SUPPLIER Role to all 10 Supplier Accounts
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, (SELECT id FROM roles WHERE name = 'SUPPLIER')
FROM users u
WHERE u.email IN (
    'supplier@medistock.com',
    'orders@cipla.com',
    'orders@astrazeneca.com',
    'orders@bayer.com',
    'orders@abbott.com',
    'sales@alkem.com',
    'orders@biocon.com',
    'info@aurobindo.com',
    'supply@baxter.com',
    'supply@boehringer.com'
)
ON CONFLICT DO NOTHING;
