-- Migration V21: Extend customers table with email, address, total_purchases, lifetime_spend, and last_purchase_at

ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_purchases BIGINT DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS lifetime_spend NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_purchase_at TIMESTAMP;
