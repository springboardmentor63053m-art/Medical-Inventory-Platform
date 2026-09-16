ALTER TABLE medicines
    ADD COLUMN cost_price NUMERIC(10, 2),
    ADD COLUMN selling_price NUMERIC(10, 2);

UPDATE medicines
SET cost_price = unit_price,
    selling_price = unit_price;

ALTER TABLE medicines
    ALTER COLUMN cost_price SET NOT NULL,
    ALTER COLUMN selling_price SET NOT NULL;

ALTER TABLE medicines
    ADD CONSTRAINT chk_medicines_cost_price_non_negative
        CHECK (cost_price >= 0),
    ADD CONSTRAINT chk_medicines_selling_price_non_negative
        CHECK (selling_price >= 0),
    ADD CONSTRAINT chk_medicines_selling_not_below_cost
        CHECK (selling_price >= cost_price);