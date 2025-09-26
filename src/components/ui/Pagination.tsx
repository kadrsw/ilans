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
    <div className="bg-white px-4 py-6 sm:px-6 rounded-xl shadow-sm border border-gray-200">
      {/* Mobile View */}
      <div className="flex justify-between items-center sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={clsx(
            'flex items-center px-4 py-3 border-2 text-sm font-semibold rounded-xl touch-target transition-all duration-200',
            hasPrevPage
              ? 'text-gray-700 bg-white border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
              : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Önceki
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 font-medium">
            Sayfa {currentPage} / {totalPages}
          </span>
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={clsx(
            'flex items-center px-4 py-3 border-2 text-sm font-semibold rounded-xl touch-target transition-all duration-200',
            hasNextPage
              ? 'text-gray-700 bg-white border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
              : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
          )}
        >
          Sonraki
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-red-600">{startIndex}</span>
            {' - '}
            <span className="font-semibold text-red-600">{endIndex}</span>
            {' arası, toplam '}
            <span className="font-semibold text-red-600">{totalItems}</span>
            {' ilan gösteriliyor'}
          </p>
        </div>
        
        <div>
          <nav className="flex items-center space-x-1" aria-label="Pagination">
            {/* Previous Button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className={clsx(
                'flex items-center px-3 py-2 rounded-lg border-2 text-sm font-semibold touch-target transition-all duration-200',
                hasPrevPage
                  ? 'text-gray-700 bg-white border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                  : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-4 py-2 text-gray-500 font-medium">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={clsx(
                      'px-4 py-2 rounded-lg border-2 text-sm font-semibold touch-target transition-all duration-200',
                      currentPage === page
                        ? 'bg-red-600 border-red-600 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                    )}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next Button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className={clsx(
                'flex items-center px-3 py-2 rounded-lg border-2 text-sm font-semibold touch-target transition-all duration-200',
                hasNextPage
                  ? 'text-gray-700 bg-white border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                  : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}