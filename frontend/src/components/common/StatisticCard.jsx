import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatisticCard({
  title,
  value,
  icon: Icon,
  iconBg = 'bg-blue-50 text-blue-600 border-blue-100',
  badge
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group">
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold flex-shrink-0 transition-transform group-hover:scale-105 ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        {badge && (
          <span
            className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
              badge.type === 'danger'
                ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                : badge.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                : badge.type === 'purple'
                ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
            }`}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{value}</h3>
        <p className="text-xs font-bold text-slate-500 mt-1.5">{title}</p>
      </div>
    </div>
  );
}
