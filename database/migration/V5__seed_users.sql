-- Flyway Migration V5: Seed Default System Users with Password@123

-- 1. Insert Default System Users
INSERT INTO users (first_name, last_name, email, password, phone, enabled, account_non_locked) VALUES
('System', 'Admin', 'admin@medistock.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+91-9999900001', TRUE, TRUE),
('Senior', 'Pharmacist', 'pharmacist@medistock.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+91-9999900002', TRUE, TRUE),
('Inventory', 'Staff', 'staff@medistock.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+91-9999900003', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- 2. Associate Users with Roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'admin@medistock.com' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'pharmacist@medistock.com' AND r.name = 'PHARMACIST'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'staff@medistock.com' AND r.name = 'STAFF'
ON CONFLICT DO NOTHING;
