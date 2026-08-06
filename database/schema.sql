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
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(150),
    address VARCHAR(255)
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
    CONSTRAINT fk_medicine_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE INDEX idx_medicine_name ON medicines(name);
CREATE INDEX idx_medicine_category ON medicines(category);
CREATE INDEX idx_medicine_expiry ON medicines(expiry_date);

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
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(60) NOT NULL,
    details VARCHAR(255),
    timestamp DATETIME NOT NULL,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_purchase_date ON purchases(purchase_date);
CREATE INDEX idx_movement_timestamp ON stock_movements(timestamp);
CREATE INDEX idx_notification_role ON notifications(target_role);
