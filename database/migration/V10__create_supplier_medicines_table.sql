-- Flyway Migration V10: Create Supplier-Medicines Many-to-Many Junction Table

CREATE TABLE IF NOT EXISTS supplier_medicines (
    supplier_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (supplier_id, medicine_id),
    CONSTRAINT fk_sm_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    CONSTRAINT fk_sm_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_supplier_medicines_supplier ON supplier_medicines(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_medicines_medicine ON supplier_medicines(medicine_id);
