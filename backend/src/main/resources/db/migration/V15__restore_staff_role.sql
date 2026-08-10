-- Flyway Migration V15: Restore STAFF as a Distinct Operational Role

INSERT INTO roles (name, description)
VALUES ('STAFF', 'Operational Inventory Staff')
ON CONFLICT (name) DO NOTHING;

-- Map staff accounts to STAFF role
UPDATE user_roles
SET role_id = (SELECT id FROM roles WHERE name = 'STAFF')
WHERE user_id IN (
    SELECT id FROM users WHERE LOWER(email) IN (
        'staff@medistock.com',
        'staff.member@medistock.com',
        'staff.test@medistock.com'
    )
);
