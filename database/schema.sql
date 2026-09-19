-- =========================================================
-- MEDISTOCK — Medical Inventory Management System
-- Database Schema (PostgreSQL)
-- =========================================================

-- Optional: Create Database
-- CREATE DATABASE medistock_db;
-- \c medistock_db;

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS expiry_tracking CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS stock_logs CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =========================================================
-- 1. ROLES
-- =========================================================
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 2. USERS
-- =========================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id BIGINT NOT NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- =========================================================
-- 3. MEDICINES
-- =========================================================
CREATE TABLE medicines (
    id BIGSERIAL PRIMARY KEY,
    medicine_code VARCHAR(50) NOT NULL UNIQUE,
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    category VARCHAR(100),
    manufacturer VARCHAR(200),
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    batch_number VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medicines_code ON medicines(medicine_code);
CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_medicines_name ON medicines(medicine_name);

-- =========================================================
-- 4. SUPPLIERS
-- =========================================================
CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    supplier_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_email ON suppliers(email);
CREATE INDEX idx_suppliers_status ON suppliers(status);

-- =========================================================
-- 5. INVENTORY
-- =========================================================
CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    maximum_stock INT NOT NULL DEFAULT 0,
    location VARCHAR(200),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    CONSTRAINT uq_inventory_medicine UNIQUE (medicine_id)
);

CREATE INDEX idx_inventory_medicine ON inventory(medicine_id);

-- =========================================================
-- 6. STOCK LOGS
-- =========================================================
CREATE TABLE stock_logs (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    previous_quantity INT,
    new_quantity INT,
    performed_by VARCHAR(150),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stocklogs_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    CONSTRAINT chk_action_type CHECK (action_type IN ('IN', 'OUT', 'ADJUSTMENT', 'STOCK_IN', 'STOCK_OUT', 'RETURN'))
);

CREATE INDEX idx_stocklogs_medicine ON stock_logs(medicine_id);
CREATE INDEX idx_stocklogs_action ON stock_logs(action_type);
CREATE INDEX idx_stocklogs_created ON stock_logs(created_at);

-- =========================================================
-- 7. PURCHASE ORDERS
-- =========================================================
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_date DATE NOT NULL,
    expected_delivery DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT chk_po_status CHECK (status IN ('PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'))
);

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_order_date ON purchase_orders(order_date);

-- =========================================================
-- 8. PURCHASE ORDER ITEMS
-- =========================================================
CREATE TABLE purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_poi_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

CREATE INDEX idx_poi_order ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_poi_medicine ON purchase_order_items(medicine_id);

-- =========================================================
-- 9. EXPIRY TRACKING
-- =========================================================
CREATE TABLE expiry_tracking (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    expiry_date DATE NOT NULL,
    batch_number VARCHAR(100),
    quantity INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'SAFE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expiry_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    CONSTRAINT chk_expiry_status CHECK (status IN ('SAFE', 'EXPIRING_SOON', 'EXPIRED'))
);

CREATE INDEX idx_expiry_medicine ON expiry_tracking(medicine_id);
CREATE INDEX idx_expiry_date ON expiry_tracking(expiry_date);
CREATE INDEX idx_expiry_status ON expiry_tracking(status);

-- =========================================================
-- 10. NOTIFICATIONS
-- =========================================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notif_type CHECK (notification_type IN ('EXPIRY_ALERT', 'LOW_STOCK', 'PURCHASE_ALERT')),
    CONSTRAINT chk_notif_status CHECK (status IN ('UNREAD', 'READ'))
);

CREATE INDEX idx_notif_type ON notifications(notification_type);
CREATE INDEX idx_notif_status ON notifications(status);
CREATE INDEX idx_notif_created ON notifications(created_at);
