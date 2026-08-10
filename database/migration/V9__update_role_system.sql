-- Flyway Migration V9: Restructure Role System to exactly 4 Roles (ADMIN, PHARMACIST, USER, SUPPLIER)

-- 1. Ensure SUPPLIER role exists in roles table
INSERT INTO roles (name, description) VALUES
('SUPPLIER', 'Supplier Partner Role')
ON CONFLICT (name) DO NOTHING;

-- 2. Migrate existing user_roles: STAFF -> PHARMACIST
INSERT INTO user_roles (user_id, role_id)
SELECT ur.user_id, (SELECT id FROM roles WHERE name = 'PHARMACIST')
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'STAFF'
ON CONFLICT DO NOTHING;

DELETE FROM user_roles
WHERE role_id = (SELECT id FROM roles WHERE name = 'STAFF');

-- 3. Migrate existing user_roles: SYSTEM_ADMINISTRATOR -> ADMIN
INSERT INTO user_roles (user_id, role_id)
SELECT ur.user_id, (SELECT id FROM roles WHERE name = 'ADMIN')
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'SYSTEM_ADMINISTRATOR'
ON CONFLICT DO NOTHING;

DELETE FROM user_roles
WHERE role_id = (SELECT id FROM roles WHERE name = 'SYSTEM_ADMINISTRATOR');

-- 4. Delete obsolete roles from roles table
DELETE FROM roles WHERE name IN ('STAFF', 'SYSTEM_ADMINISTRATOR');

-- 5. Seed default supplier demo user
INSERT INTO users (employee_id, first_name, last_name, email, password, phone, enabled, account_non_locked)
VALUES ('SUP001', 'Apex', 'Supplier', 'supplier@medistock.com', '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG', '+1 800-555-0105', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'supplier@medistock.com' AND r.name = 'SUPPLIER'
ON CONFLICT DO NOTHING;
