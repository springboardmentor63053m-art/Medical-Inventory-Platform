-- Migration V25: Add cost_price and selling_price to medicines table
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS selling_price NUMERIC(10, 2) DEFAULT 0.00;

-- Backfill existing medicines:
-- selling_price defaults to unit_price
-- cost_price defaults to 70% of unit_price (realistic pharmaceutical wholesale cost)
UPDATE medicines 
SET selling_price = unit_price 
WHERE selling_price IS NULL OR selling_price = 0;

UPDATE medicines 
SET cost_price = ROUND(unit_price * 0.70, 2) 
WHERE cost_price IS NULL OR cost_price = 0;
