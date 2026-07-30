import React from 'react';

export default function StatusBadge({ status, label, size = 'normal' }) {
  const normalized = (status || label || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-500';
  let displayLabel = label || normalized;

  if (['ACTIVE', 'HEALTHY', 'DELIVERED', 'APPROVED'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['LOW_STOCK', 'LOW STOCK', 'PENDING', 'ATTENTION'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['EXPIRING', 'EXPIRING SOON', 'EXPIRED', 'DEPLETED', 'OUT_OF_STOCK', 'CANCELLED', 'DISABLED'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (['LOCKED', 'DRAFT'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (['ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMINISTRATOR'].includes(normalized)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  }

  const py = size === 'small' ? 'py-0.5 px-2 text-[10px]' : 'py-1 px-2.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${py} ${styles} transition-all`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{displayLabel}</span>
    </span>
  );
}
