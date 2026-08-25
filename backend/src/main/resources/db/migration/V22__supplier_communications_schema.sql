-- Migration V22: Supplier Communications Schema (Conversations, Messages, Attachments)

CREATE TABLE IF NOT EXISTS supplier_conversations (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL UNIQUE,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversation_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS supplier_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_user_id BIGINT,
    sender_name VARCHAR(150) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    message_type VARCHAR(30) DEFAULT 'SUPPLIER_MESSAGE',
    content TEXT NOT NULL,
    purchase_order_id BIGINT,
    is_read_by_admin BOOLEAN DEFAULT FALSE,
    is_read_by_supplier BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES supplier_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_user FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_message_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS supplier_message_attachments (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_message FOREIGN KEY (message_id) REFERENCES supplier_messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_supplier_messages_conv ON supplier_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_supplier_messages_po ON supplier_messages(purchase_order_id);
