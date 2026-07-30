import React from 'react';

export default function ProgressBar({ current, target, minThreshold = 10, unit = 'Units' }) {
  const currNum = Number(current || 0);
  const reorderNum = Number(minThreshold || 10);
  // Calculate percentage relative to 2x reorder threshold or currNum
  const maxCap = Math.max(reorderNum * 3, currNum, 1);
  const percentage = Math.min(100, Math.max(0, Math.round((currNum / maxCap) * 100)));

  let colorClass = 'bg-emerald-500';
  let statusText = 'Healthy';

  if (currNum === 0) {
    colorClass = 'bg-rose-500';
    statusText = 'Depleted';
  } else if (currNum <= reorderNum) {
    colorClass = 'bg-amber-500';
    statusText = 'Low Stock';
  }

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
        <span className="font-bold text-slate-900">{currNum} {unit}</span>
        <span className="text-slate-400">Min {reorderNum}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60 flex">
        <div
          className={`h-full ${colorClass} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
