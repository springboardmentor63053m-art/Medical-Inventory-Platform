-- Flyway Migration V16: Add B-Tree Indexes on Foreign Keys for Performance Optimization

CREATE INDEX IF NOT EXISTS idx_inventory_medicine_id ON inventory(medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicines_category_id ON medicines(category_id);
CREATE INDEX IF NOT EXISTS idx_supplier_medicines_supplier ON supplier_medicines(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_medicines_medicine ON supplier_medicines(medicine_id);
CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_items_medicine ON purchase_order_items(medicine_id);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
