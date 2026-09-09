-- Migration V24: Normalize legacy enum data in store_purchases, prescription_orders, and prescriptions

-- 1. Fix store_purchases with empty or null payment_method to default 'CASH'
UPDATE store_purchases
SET payment_method = 'CASH'
WHERE payment_method IS NULL OR TRIM(payment_method) = '';

-- 2. Normalize prescription_orders status values to canonical lifecycle
UPDATE prescription_orders
SET status = 'VERIFIED'
WHERE status = 'APPROVED';

UPDATE prescription_orders
SET status = 'FULFILLED'
WHERE status = 'COMPLETED';

-- 3. Normalize prescriptions table status if legacy values exist
UPDATE prescriptions
SET status = 'VERIFIED'
WHERE status = 'APPROVED';
