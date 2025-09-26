import React from 'react';
import { Briefcase, RefreshCw, MapPin, AlertCircle } from 'lucide-react';
import { Pagination } from '../ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { JobCard } from './JobCard';
import { Button } from '../ui/Button';
import type { JobListing } from '../../types';

interface JobListProps {
  jobs: JobListing[];
  onJobDeleted?: () => void;
  hasMore?: boolean;
  loadMoreJobs?: () => void;
  loadingMore?: boolean;
  isShowingSimilar?: boolean;
  selectedCity?: string;
  onClearFilters?: () => void;
}

export function JobList({ 
  jobs, 
  onJobDeleted, 
  hasMore, 
  loadMoreJobs, 
  loadingMore, 
  isShowingSimilar,
  selectedCity,
  onClearFilters 
}: JobListProps) {
  // Sayfalama hook'u
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    goToPage,
    getPageNumbers,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex
  } = usePagination(jobs, { itemsPerPage: 20 });

  const handleJobDeleted = () => {
    if (onJobDeleted) {
      onJobDeleted();
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">İlan Bulunamadı</h3>
          <p className="text-gray-600 mb-6">
            Bu kriterlere uygun ilan bulunamadı. Farklı arama kriterleri deneyebilirsiniz.
          </p>
          <div className="space-y-3">
            {onClearFilters && (
              <Button
                onClick={onClearFilters}
                className="btn-primary"
              >
                <RefreshCw className="h-4 w-4" />
                Filtreleri Temizle
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="btn-outline"
            >
              <RefreshCw className="h-4 w-4" />
              Sayfayı Yenile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Similar Jobs Warning */}
      {isShowingSimilar && selectedCity && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800 mb-1">
                {selectedCity}'da ilan bulunamadı
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Seçtiğiniz kriterlere uygun {selectedCity} ilanı bulunamadı. 
                Bunun yerine diğer şehirlerdeki benzer ilanları gösteriyoruz.
              </p>
              <div className="flex flex-wrap gap-2">
                {onClearFilters && (
                  <button
                    onClick={onClearFilters}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    <MapPin className="h-3 w-3" />
                    Tüm Şehirleri Göster
                  </button>
                )}
                <button
                  onClick={() => window.location.href = `/${selectedCity.toLowerCase()}-is-ilanlari`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-medium transition-colors"
                >
                  <MapPin className="h-3 w-3" />
                  {selectedCity} Tüm İlanları
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Results Header */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-red-600" />
              {isShowingSimilar && selectedCity ? 
                `${selectedCity} Benzeri İlanlar` : 
                'Güncel İş İlanları'
              }
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold text-red-600">{startIndex}-{endIndex}</span>
              {' arası gösteriliyor, toplam '}
              <span className="font-semibold text-red-600">{totalItems}</span>
              {' ilan'}
              {isShowingSimilar && selectedCity && (
                <span className="text-yellow-600 ml-2">
                  (Diğer şehirlerden)
                </span>
              )}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-semibold">Canlı</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{totalItems}</div>
            <div className="text-xs text-gray-500">Toplam İlan</div>
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 font-medium mb-2 w-full">🔥 Popüler Aramalar:</span>
            {[
              'Yazılım Geliştirici',
              'Satış Temsilcisi', 
              'Muhasebeci',
              'Garson',
              'Kurye',
              'Güvenlik'
            ].map((term) => (
              <button
                key={term}
                className="px-3 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-full text-xs font-medium transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {paginatedItems.map((job, index) => (
          <JobCard key={job.id} job={job} onDeleted={handleJobDeleted} />
        ))}
      </div>

      {/* Load More Button (if applicable) */}
      {hasMore && loadMoreJobs && (
        <div className="text-center py-6">
          <Button
            onClick={loadMoreJobs}
            isLoading={loadingMore}
            className="btn-outline"
          >
            {loadingMore ? 'Yükleniyor...' : 'Daha Fazla İlan Yükle'}
          </Button>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={goToPage}
        getPageNumbers={getPageNumbers}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}