ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_file BYTEA;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_file_name VARCHAR(255);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_content_type VARCHAR(100);