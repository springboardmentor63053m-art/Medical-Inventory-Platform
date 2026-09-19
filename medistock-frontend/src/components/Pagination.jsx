import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }) => {
  if (totalPages <= 1 && (!pageSize || !onPageSizeChange)) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderTop: '1px solid #e2e8f0',
      background: '#f8fafc',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      {pageSize && onPageSizeChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="input-field"
            style={{ width: 'auto', padding: '4px 8px' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8', marginRight: '8px' }}>
          Page {currentPage + 1} of {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="btn btn-secondary btn-sm"
          style={{ opacity: currentPage === 0 ? 0.5 : 1 }}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="btn btn-secondary btn-sm"
          style={{ opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
