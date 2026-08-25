export const READ_STORAGE_KEY =
  'medistock-read-notification-ids';

export const DISMISSED_STORAGE_KEY =
  'medistock-dismissed-notification-ids';

export const NOTIFICATIONS_UPDATED_EVENT =
  'medistock-notifications-updated';

export const getStoredNotificationIds = (key) => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(key) || '[]'
    );

    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export const saveStoredNotificationIds = (
  key,
  ids
) => {
  localStorage.setItem(
    key,
    JSON.stringify([...new Set(ids)])
  );
};

export const prepareNotifications = (
  activeNotifications
) => {
  const notifications = Array.isArray(
    activeNotifications
  )
    ? activeNotifications
    : [];

  const readIds = new Set(
    getStoredNotificationIds(READ_STORAGE_KEY)
  );

  const dismissedIds = new Set(
    getStoredNotificationIds(
      DISMISSED_STORAGE_KEY
    )
  );

  return notifications
    .filter(
      (notification) =>
        !dismissedIds.has(notification.id)
    )
    .map((notification) => ({
      ...notification,
      read: readIds.has(notification.id),
    }));
};

export const publishNotifications = (
  notifications
) => {
  window.dispatchEvent(
    new CustomEvent(
      NOTIFICATIONS_UPDATED_EVENT,
      {
        detail: Array.isArray(notifications)
          ? notifications
          : [],
      }
    )
  );
};