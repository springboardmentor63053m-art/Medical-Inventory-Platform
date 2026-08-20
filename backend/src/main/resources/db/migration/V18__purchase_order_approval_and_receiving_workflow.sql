-- Extend purchase-order workflow while preserving existing data.

ALTER TABLE purchase_orders
    DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

ALTER TABLE purchase_orders
    ADD CONSTRAINT purchase_orders_status_check
    CHECK (
        status IN (
            'PENDING',
            'APPROVED',
            'PROCESSING',
            'SHIPPED',
            'RECEIVED',
            'CANCELLED'
        )
    );

ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(150),
    ADD COLUMN IF NOT EXISTS approved_by VARCHAR(150),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS processed_by VARCHAR(150),
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS shipped_by VARCHAR(150),
    ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS received_by VARCHAR(150),
    ADD COLUMN IF NOT EXISTS received_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(150),
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS status_updated_by VARCHAR(150),
    ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP;

ALTER TABLE purchase_order_items
    ADD COLUMN IF NOT EXISTS received_quantity INTEGER,
    ADD COLUMN IF NOT EXISTS received_batch_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS received_expiry_date DATE,
    ADD COLUMN IF NOT EXISTS received_storage_location VARCHAR(100);

ALTER TABLE purchase_order_items
    DROP CONSTRAINT IF EXISTS purchase_order_items_received_quantity_check;

ALTER TABLE purchase_order_items
    ADD CONSTRAINT purchase_order_items_received_quantity_check
    CHECK (
        received_quantity IS NULL
        OR received_quantity > 0
    );

CREATE INDEX IF NOT EXISTS idx_purchase_orders_status
    ON purchase_orders(status);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by
    ON purchase_orders(created_by);