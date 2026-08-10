-- Normalize any legacy PENDING_VERIFICATION order and prescription statuses to PENDING_REVIEW
UPDATE prescription_orders
SET status = 'PENDING_REVIEW'
WHERE status = 'PENDING_VERIFICATION';

UPDATE prescriptions
SET status = 'PENDING_REVIEW'
WHERE status = 'PENDING_VERIFICATION';
