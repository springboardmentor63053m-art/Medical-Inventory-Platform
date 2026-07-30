-- Flyway Migration V3: Create Medical Inventory Management Schema

-- 1. Categories Table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Medicines Table
CREATE TABLE medicines (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    medicine_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150),
    manufacturer VARCHAR(150) NOT NULL,
    dosage VARCHAR(50),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    reorder_level INT NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medicines_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 3. Suppliers Table
CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    supplier_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inventory Table
CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    minimum_stock INT NOT NULL DEFAULT 10 CHECK (minimum_stock >= 0),
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    storage_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- 5. Purchase Orders Table
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- 6. Purchase Order Items Table
CREATE TABLE purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT fk_poi_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

-- 7. Stock Transactions Table
CREATE TABLE stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'ADJUSTMENT', 'RETURN')),
    quantity INT NOT NULL,
    reference_number VARCHAR(50),
    remarks TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

-- 8. Inventory Audit Table
CREATE TABLE inventory_audit (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    updated_by BIGINT,
    reason VARCHAR(255),
    audit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    CONSTRAINT fk_audit_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Database Indexes for Optimization
CREATE INDEX idx_medicines_code ON medicines(medicine_code);
CREATE INDEX idx_medicines_name ON medicines(name);
CREATE INDEX idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX idx_inventory_batch ON inventory(batch_number);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);
