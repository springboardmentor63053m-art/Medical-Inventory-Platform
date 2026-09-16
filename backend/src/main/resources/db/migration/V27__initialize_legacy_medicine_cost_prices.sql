-- Existing medicines originally had only one unit price.
-- For demo data, initialize cost price at 80% of selling price.
-- Rows already having different cost and selling prices are preserved.
UPDATE medicines
SET cost_price = ROUND(selling_price * 0.80, 2),
    updated_at = CURRENT_TIMESTAMP
WHERE cost_price = selling_price
  AND selling_price > 0;