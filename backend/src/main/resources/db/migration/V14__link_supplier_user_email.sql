-- Normalize supplier account email mapping for SUP-101 to match authenticated supplier user
UPDATE suppliers 
SET email = 'supplier@medistock.com' 
WHERE supplier_code = 'SUP-101';
