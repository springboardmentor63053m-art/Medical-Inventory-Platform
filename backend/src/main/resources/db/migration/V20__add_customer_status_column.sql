-- Migration V20: Add status column to customers table for Customer Management module

ALTER TABLE customers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
