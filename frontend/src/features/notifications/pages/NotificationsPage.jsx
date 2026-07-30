import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  CheckCheck,
  Filter,
  Info
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'LOW_STOCK',
    title: 'Low Stock Alert: Amoxicillin 500mg',
    message: 'Current quantity is 15 units, which is below the minimum reorder threshold of 20 units.',
    timestamp: '10 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'EXPIRY',
    title: 'Expiring Stock: Paracetamol Batch #BT-9021',
    message: 'Batch BT-9021 (450 units) is expiring on 2026-08-15. Please review stock rotation.',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'SYSTEM',
    title: 'System Maintenance Complete',
    message: 'Database index optimization completed successfully. System performance upgraded.',
    timestamp: 'Yesterday at 11:30 PM',
    read: true,
  },
  {
    id: 4,
    type: 'LOW_STOCK',
    title: 'Low Stock Alert: Metformin 850mg',
    message: 'Current quantity is 8 units (Min: 15). Please place a new purchase order.',
    timestamp: '2 days ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'UNREAD' | 'LOW_STOCK' | 'EXPIRY'

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success('Notification marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.info('Notification dismissed');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType === 'LOW_STOCK') return n.type === 'LOW_STOCK';
    if (filterType === 'EXPIRY') return n.type === 'EXPIRY';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'EXPIRY':
        return <Clock className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated alerts for inventory shortages, expiration warnings, and system updates
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" /> Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notifications ({notifications.length})
        </button>

        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'UNREAD'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>

        <button
          onClick={() => setFilterType('LOW_STOCK')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'LOW_STOCK'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          Low Stock Alerts
        </button>

        <button
          onClick={() => setFilterType('EXPIRY')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'EXPIRY'
              ? 'bg-rose-600 text-white'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Expiry Warnings
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No notifications found in this view.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 transition flex items-start justify-between gap-4 ${
                notif.read ? 'bg-white opacity-80' : 'bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 font-medium mt-2 block">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
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
