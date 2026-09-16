-- Keep the newest active notification for each inventory condition.
-- Older duplicates remain in history but are marked as resolved.
WITH ranked_active_notifications AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY inventory_id, type
            ORDER BY created_at DESC NULLS LAST, id DESC
        ) AS row_number
    FROM notifications
    WHERE is_active = TRUE
)
UPDATE notifications AS notification
SET is_active = FALSE,
    resolved_at = COALESCE(notification.resolved_at, CURRENT_TIMESTAMP),
    updated_at = CURRENT_TIMESTAMP
FROM ranked_active_notifications AS ranked
WHERE notification.id = ranked.id
  AND ranked.row_number > 1;

-- Prevent more than one active notification for the same condition.
CREATE UNIQUE INDEX IF NOT EXISTS uq_notifications_active_inventory_type
    ON notifications (inventory_id, type)
    WHERE is_active = TRUE;