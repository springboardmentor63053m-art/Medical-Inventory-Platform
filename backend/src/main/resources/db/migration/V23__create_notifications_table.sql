-- Flyway Migration V23: Create Notifications Table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON', 'EXPIRED')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'WARNING', 'INFO')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT fk_notifications_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_inventory_type ON notifications(inventory_id, type, is_active);
CREATE INDEX idx_notifications_active_read ON notifications(is_active, is_read);
