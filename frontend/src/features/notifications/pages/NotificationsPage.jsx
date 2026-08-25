import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNotifications } from '../hooks/useNotifications';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  CheckCheck,
  Filter,
  Info,
  Loader2,
} from 'lucide-react';

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    unreadCount,
    stockAlertCount,
    expiryAlertCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  const [filterType, setFilterType] = useState('ALL');

  const handleMarkAsRead = (id) => {
    markAsRead(id);
    toast.success('Notification marked as read');
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id) => {
    dismissNotification(id);
    toast.info('Notification dismissed');
  };

  const filteredNotifications =
    notifications.filter((notification) => {
      if (filterType === 'UNREAD') {
        return !notification.read;
      }

      if (filterType === 'STOCK') {
        return (
          notification.type === 'LOW_STOCK' ||
          notification.type === 'OUT_OF_STOCK'
        );
      }

      if (filterType === 'EXPIRY') {
        return (
          notification.type === 'EXPIRING_SOON' ||
          notification.type === 'EXPIRED'
        );
      }

      return true;
    });

  const getIcon = (type) => {
    switch (type) {
      case 'OUT_OF_STOCK':
        return (
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        );

      case 'LOW_STOCK':
        return (
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        );

      case 'EXPIRED':
        return (
          <Clock className="w-5 h-5 text-red-600 flex-shrink-0" />
        );

      case 'EXPIRING_SOON':
        return (
          <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
        );

      default:
        return (
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
        );
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'OUT_OF_STOCK':
        return 'Out of Stock';

      case 'LOW_STOCK':
        return 'Low Stock';

      case 'EXPIRED':
        return 'Expired';

      case 'EXPIRING_SOON':
        return 'Expiring Soon';

      default:
        return 'Information';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'OUT_OF_STOCK':
      case 'EXPIRED':
        return 'bg-red-50 text-red-700 border-red-200';

      case 'LOW_STOCK':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'EXPIRING_SOON':
        return 'bg-orange-50 text-orange-700 border-orange-200';

      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const formatGeneratedAt = (generatedAt) => {
    if (!generatedAt) {
      return 'Active database alert';
    }

    const date = new Date(generatedAt);

    if (Number.isNaN(date.getTime())) {
      return 'Active database alert';
    }

    return `Generated ${date.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications &amp; Alerts
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Live database alerts for stock shortages,
            out-of-stock medicines and expiry conditions
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
          <Filter className="w-4 h-4" />
        </div>

        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notifications ({notifications.length})
        </button>

        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'UNREAD'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>

        <button
          onClick={() => setFilterType('STOCK')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'STOCK'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          Stock Alerts ({stockAlertCount})
        </button>

        <button
          onClick={() => setFilterType('EXPIRY')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterType === 'EXPIRY'
              ? 'bg-rose-600 text-white'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Expiry Alerts ({expiryAlertCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />

            <span>
              Loading notifications from database...
            </span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No notifications found in this view.
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-5 transition flex items-start justify-between gap-4 ${
                notification.read
                  ? 'bg-white opacity-80'
                  : 'bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 mt-0.5">
                  {getIcon(notification.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {notification.title}
                    </h3>

                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getTypeBadgeClass(
                        notification.type
                      )}`}
                    >
                      {getTypeLabel(notification.type)}
                    </span>

                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap mt-2 text-[10px] text-slate-400 font-medium">
                    <span>
                      {formatGeneratedAt(
                        notification.generatedAt
                      )}
                    </span>

                    {notification.batchNumber && (
                      <>
                        <span>•</span>
                        <span>
                          Batch: {notification.batchNumber}
                        </span>
                      </>
                    )}

                    {notification.quantity !== null &&
                      notification.quantity !== undefined && (
                        <>
                          <span>•</span>
                          <span>
                            Quantity: {notification.quantity}
                          </span>
                        </>
                      )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!notification.read && (
                  <button
                    onClick={() =>
                      handleMarkAsRead(notification.id)
                    }
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() =>
                    handleDelete(notification.id)
                  }
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}