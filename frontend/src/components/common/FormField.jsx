import React from 'react';

export default function FormField({
  label,
  required,
  readOnly,
  helperText,
  error,
  icon: Icon,
  children
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
          {readOnly && <span className="ml-1 text-[10px] text-slate-400 font-semibold uppercase">(Read Only)</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        {children}
      </div>

      {helperText && !error && <p className="text-[11px] text-slate-400 font-medium">{helperText}</p>}
      {error && <p className="text-[11px] text-rose-600 font-semibold">{error}</p>}
    </div>
  );
}
