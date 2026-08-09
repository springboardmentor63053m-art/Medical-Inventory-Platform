-- Migration V8: Prescription Management, Prescription Orders & Store Walk-in Purchases Schema

-- 1. Add prescription_required column to medicines table
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS prescription_required BOOLEAN DEFAULT TRUE;

-- 2. Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    doctor_name VARCHAR(150),
    patient_name VARCHAR(150) NOT NULL,
    prescription_file_url TEXT,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prescription_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create prescription_orders table
CREATE TABLE IF NOT EXISTS prescription_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    prescription_id BIGINT,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION',
    delivery_address TEXT,
    contact_phone VARCHAR(30),
    pharmacist_notes TEXT,
    verified_by VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL
);

-- 4. Create prescription_order_items table
CREATE TABLE IF NOT EXISTS prescription_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_p_order_item_order FOREIGN KEY (order_id) REFERENCES prescription_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_p_order_item_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- 5. Create store_purchases table (In-Store Pharmacist Counter Sales / Walk-in)
CREATE TABLE IF NOT EXISTS store_purchases (
    id BIGSERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30),
    pharmacist_id BIGINT,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'CASH',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_purchase_pharmacist FOREIGN KEY (pharmacist_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Create store_purchase_items table
CREATE TABLE IF NOT EXISTS store_purchase_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_store_item_purchase FOREIGN KEY (purchase_id) REFERENCES store_purchases(id) ON DELETE CASCADE,
    CONSTRAINT fk_store_item_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);
