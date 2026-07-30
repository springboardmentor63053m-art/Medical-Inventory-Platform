import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = 'max-w-[700px]',
  footerActions
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`bg-white w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden border border-slate-200/90 animate-in fade-in zoom-in-95 my-auto max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-900 font-sans">
          {children}
        </div>

        {/* Footer */}
        {footerActions && (
          <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 flex-shrink-0">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
}
