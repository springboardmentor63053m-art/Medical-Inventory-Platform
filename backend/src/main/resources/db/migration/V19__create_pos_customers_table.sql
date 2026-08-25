-- Migration V19: POS Customers table with Normalized Phone Unique Index & Foreign Key in Store Purchases

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    normalized_phone VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_normalized_phone ON customers(normalized_phone);

ALTER TABLE store_purchases ADD COLUMN IF NOT EXISTS customer_id BIGINT;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_store_purchase_customer'
    ) THEN
        ALTER TABLE store_purchases 
        ADD CONSTRAINT fk_store_purchase_customer 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
    END IF;
END $$;
