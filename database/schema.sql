-- ============================================
-- MediStock Database Schema (MySQL / PostgreSQL compatible)
-- Note: In dev, Hibernate auto-creates these tables (ddl-auto=update).
-- This file is provided for manual setup / reference / production migrations.
-- ============================================

CREATE DATABASE IF NOT EXISTS medistock_db;
USE medistock_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Only populated for role = 'SUPPLIER': links this login to the single
    -- supplier record it's allowed to see (own profile, own supplied
    -- medicines, own purchase/order activity only). FK added below, once
    -- the suppliers table exists.
    supplier_id BIGINT NULL,
    -- Active-user tracking (Admin "Active Users" panel). last_activity_at is
    -- refreshed on every authenticated request; session_active flips false
    -- on explicit logout.
    last_login_at DATETIME NULL,
    last_activity_at DATETIME NULL,
    session_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(150),
    address VARCHAR(255)
);

-- Add the supplier FK guarded by an existence check, so this file is safe
-- to run even when the tables/constraint were already created by
-- Hibernate's ddl-auto=update (or by an earlier run of this same script).
-- Plain "ALTER TABLE ... ADD CONSTRAINT" has no IF NOT EXISTS option in
-- MySQL, so without this guard, re-running the script errors out with
-- "Duplicate foreign key constraint name" the moment the FK already exists.
DELIMITER $$
DROP PROCEDURE IF EXISTS medistock_add_fk_user_supplier $$
CREATE PROCEDURE medistock_add_fk_user_supplier()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND CONSTRAINT_NAME = 'fk_user_supplier'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT fk_user_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
    END IF;
END $$
DELIMITER ;

CALL medistock_add_fk_user_supplier();
DROP PROCEDURE IF EXISTS medistock_add_fk_user_supplier;

-- Password reset tokens (requirement 21). Only the SHA-256 hash of the raw
-- token is stored; the raw token is emailed/logged and never persisted.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_reset_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    supplier_id BIGINT,
    quantity INT NOT NULL,
    reorder_level INT NOT NULL DEFAULT 20,
    manufacturing_date DATE,
    expiry_date DATE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    -- Soft-delete flag. Medicines with historical purchases/sales/stock
    -- movements are deactivated instead of physically deleted, so audit
    -- history, past bills, and past purchase orders stay intact.
    active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Optional real product photo URLs (packaging box + blister sheet).
    -- Nullable — the UI falls back to a category-illustrated visual when
    -- either is unset.
    image_url VARCHAR(500),
    sheet_image_url VARCHAR(500),
    CONSTRAINT fk_medicine_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- CREATE INDEX idx_medicine_name ON medicines(name);
-- CREATE INDEX idx_medicine_category ON medicines(category);
-- CREATE INDEX idx_medicine_expiry ON medicines(expiry_date);

CREATE TABLE IF NOT EXISTS purchases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    supplier_id BIGINT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    purchased_by BIGINT,
    purchase_date DATETIME NOT NULL,
    note VARCHAR(255),
    -- Optional purchase-order/invoice references (requirement 13's minimum
    -- recommended additions). Nullable so existing rows and callers that
    -- don't supply them are unaffected.
    po_number VARCHAR(60),
    invoice_number VARCHAR(60),
    -- Purchase-order workflow (requirement 13): Admin creates (PENDING) ->
    -- Supplier accepts/rejects -> Supplier dispatches -> Admin receives
    -- (stock only updates at RECEIVED). Existing/manually-inserted rows
    -- default to RECEIVED since they represent stock already on hand.
    order_status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED',
    responded_date DATETIME NULL,
    dispatched_date DATETIME NULL,
    received_date DATETIME NULL,
    supplier_note VARCHAR(255),
    CONSTRAINT fk_purchase_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    CONSTRAINT fk_purchase_user FOREIGN KEY (purchased_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    quantity_change INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    performed_by BIGINT,
    timestamp DATETIME NOT NULL,
    note VARCHAR(255),
    CONSTRAINT fk_movement_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    CONSTRAINT fk_movement_user FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(30) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(500) NOT NULL,
    target_role VARCHAR(20) NOT NULL DEFAULT 'ALL',
    related_medicine_id BIGINT,
    -- Legacy shared flag, no longer used to decide read/unread (see
    -- notification_reads below) — kept only so existing rows/columns aren't
    -- dropped. Per-user read state lives in notification_reads instead.
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL
);

-- Per-user notification read state (requirement 17). A row here means
-- "this user has read this notification"; its absence means unread. This
-- replaces the single shared `notifications.read` flag, which incorrectly
-- hid a notification for every user once any one user marked it read.
CREATE TABLE IF NOT EXISTS notification_reads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at DATETIME NOT NULL,
    CONSTRAINT fk_notification_read_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_read_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_notification_read UNIQUE (notification_id, user_id)
);
-- CREATE INDEX idx_notification_read_user ON notification_reads(user_id);

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(60) NOT NULL,
    details VARCHAR(255),
    timestamp DATETIME NOT NULL,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CREATE INDEX idx_purchase_date ON purchases(purchase_date);
-- CREATE INDEX idx_movement_timestamp ON stock_movements(timestamp);
-- CREATE INDEX idx_notification_role ON notifications(target_role);

-- ============================================
-- Sales / billing (MediStock -> Customer). Deliberately separate from
-- `purchases` (Supplier -> MediStock) so the two directions are never
-- conflated (see requirement 12).
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(30) UNIQUE,
    customer_name VARCHAR(120) NOT NULL,
    sold_by BIGINT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    sale_date DATETIME NOT NULL,
    -- Optional additional sale fields (requirement 14's recommended list).
    customer_phone VARCHAR(20),
    payment_method VARCHAR(30),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PAID',
    CONSTRAINT fk_sale_user FOREIGN KEY (sold_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sale_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_sale_item_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    CONSTRAINT fk_sale_item_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
);

-- CREATE INDEX idx_sale_date ON sales(sale_date);
-- CREATE INDEX idx_sale_item_sale ON sale_items(sale_id);
