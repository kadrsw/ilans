import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  getPageNumbers: () => (number | string)[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  getPageNumbers,
  hasNextPage,
  hasPrevPage
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
      {/* Mobil görünüm */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={clsx(
            'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
            hasPrevPage
              ? 'text-gray-700 bg-white hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Önceki
        </button>
        
        <span className="text-sm text-gray-700 flex items-center">
          Sayfa {currentPage} / {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={clsx(
            'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
            hasNextPage
              ? 'text-gray-700 bg-white hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          )}
        >
          Sonraki
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Desktop görünüm */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">{startIndex}</span>
            {' - '}
            <span className="font-medium">{endIndex}</span>
            {' arası, toplam '}
            <span className="font-medium">{totalItems}</span>
            {' ilan'}
          </p>
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Önceki butonu */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className={clsx(
                'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium',
                hasPrevPage
                  ? 'text-gray-500 bg-white hover:bg-gray-50'
                  : 'text-gray-300 bg-gray-100 cursor-not-allowed'
              )}
            >
              <span className="sr-only">Önceki</span>
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Sayfa numaraları */}
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={clsx(
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Sonraki butonu */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className={clsx(
                'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium',
                hasNextPage
                  ? 'text-gray-500 bg-white hover:bg-gray-50'
                  : 'text-gray-300 bg-gray-100 cursor-not-allowed'
              )}
            >
              <span className="sr-only">Sonraki</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}