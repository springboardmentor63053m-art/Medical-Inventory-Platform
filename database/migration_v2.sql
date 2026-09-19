-- =========================================================
-- MEDISTOCK — Migration V2
-- New Features: Supplier Role, Messaging, Prescriptions, Sales
-- =========================================================

-- 1. Add SUPPLIER role
INSERT INTO roles (role_name, description) VALUES
('SUPPLIER', 'Supplier role - manage own orders, send medicine, communicate with admin')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Link users to suppliers (for supplier login)
ALTER TABLE users ADD COLUMN IF NOT EXISTS supplier_id BIGINT NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

-- 3. Messages table (Admin ↔ Supplier communication)
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    purchase_order_id BIGINT NULL,
    subject VARCHAR(200),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
    CONSTRAINT fk_msg_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
);

CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_msg_order ON messages(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_msg_read ON messages(is_read);

-- 4. Customers table (for walk-in purchases)
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(full_name);

-- 5. Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT,
    reviewed_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    CONSTRAINT fk_prescription_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_prescription_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT chk_prescription_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX IF NOT EXISTS idx_prescription_customer ON prescriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_prescription_status ON prescriptions(status);

-- 6. Sales table
CREATE TABLE IF NOT EXISTS sales (
    id BIGSERIAL PRIMARY KEY,
    sale_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    prescription_id BIGINT NULL,
    sale_type VARCHAR(20) NOT NULL DEFAULT 'WALK_IN',
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    sold_by BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sale_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_sale_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
    CONSTRAINT fk_sale_soldby FOREIGN KEY (sold_by) REFERENCES users(id),
    CONSTRAINT chk_sale_type CHECK (sale_type IN ('WALK_IN', 'PRESCRIPTION')),
    CONSTRAINT chk_sale_status CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_sale_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_type ON sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_sale_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sale_created ON sales(created_at);

-- 7. Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_si_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    CONSTRAINT fk_si_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

CREATE INDEX IF NOT EXISTS idx_si_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_si_medicine ON sale_items(medicine_id);

-- 8. Expand purchase_orders status constraint
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS chk_po_status;
ALTER TABLE purchase_orders ADD CONSTRAINT chk_po_status
    CHECK (status IN ('PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'RECEIVED', 'CANCELLED'));

-- 9. Expand notifications type constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS chk_notif_type;
ALTER TABLE notifications ADD CONSTRAINT chk_notif_type
    CHECK (notification_type IN ('EXPIRY_ALERT', 'LOW_STOCK', 'PURCHASE_ALERT', 'PRESCRIPTION_ALERT', 'MESSAGE_ALERT', 'SALE_ALERT'));
