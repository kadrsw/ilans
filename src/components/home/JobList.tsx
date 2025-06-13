import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Clock, Briefcase, Home, Clock as ClockIcon, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { generateJobUrl } from '../../utils/seoUtils';
import { Pagination } from '../ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import type { JobListing } from '../../types';

interface JobListProps {
  jobs: JobListing[];
  category?: string;
  location?: string;
}

export function JobList({ jobs }: JobListProps) {
  const navigate = useNavigate();
  
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

  const handleJobClick = (job: JobListing) => {
    // Scroll pozisyonunu kaydet
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    sessionStorage.setItem('previousPath', window.location.pathname + window.location.search);
    
    navigate(generateJobUrl(job));
  };

  const isNewJob = (createdAt: number) => {
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    return createdAt > threeDaysAgo;
  };

  // Sponsored content components
  const SponsoredEvimCep = () => (
    <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
      <a
        href="https://play.google.com/store/apps/details?id=app.evimcep.android"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center gap-4 hover:opacity-90 transition-opacity"
      >
        <div className="p-3 bg-blue-500 rounded-xl">
          <Home className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-blue-900 mb-1">EvimCep</div>
          <div className="text-sm text-blue-700">Hızlı Emlak ve Konut Arama</div>
          <div className="text-xs text-blue-600 mt-1">Sponsorlu İçerik</div>
        </div>
        <ExternalLink className="h-5 w-5 text-blue-600" />
      </a>
    </div>
  );

  const SponsoredMesailerim = () => (
    <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
      <a
        href="https://play.google.com/store/apps/details?id=app.mesailerim.android"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center gap-4 hover:opacity-90 transition-opacity"
      >
        <div className="p-3 bg-green-500 rounded-xl">
          <ClockIcon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-green-900 mb-1">Mesailerim</div>
          <div className="text-sm text-green-700">Fazla Mesai Hesaplama</div>
          <div className="text-xs text-green-600 mt-1">Sponsorlu İçerik</div>
        </div>
        <ExternalLink className="h-5 w-5 text-green-600" />
      </a>
    </div>
  );

  const SponsoredGaming = () => (
    <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
      <a
        href="https://www.ultraortaklik6.com/links/?btag=1707444"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center gap-4 hover:opacity-90 transition-opacity"
      >
        <div className="p-3 bg-purple-500 rounded-xl">
          <Briefcase className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-purple-900 mb-1">Güvenilir Sanal Oyunlar</div>
          <div className="text-sm text-purple-700">Online Oyun Platformu</div>
          <div className="text-xs text-purple-600 mt-1">Sponsorlu İçerik</div>
        </div>
        <ExternalLink className="h-5 w-5 text-purple-600" />
      </a>
    </div>
  );

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">İlan Bulunamadı</h3>
          <p className="text-gray-600 mb-6">
            Bu kriterlere uygun ilan bulunamadı. Farklı arama kriterleri deneyebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* İlan sayısı bilgisi */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            {startIndex}-{endIndex}
          </span>
          {' arası gösteriliyor, toplam '}
          <span className="font-medium text-gray-900">{totalItems}</span>
          {' ilan'}
        </div>
        <div className="text-xs text-gray-500">
          Sayfa {currentPage} / {totalPages}
        </div>
      </div>

      {/* İlanlar listesi */}
      <div className="space-y-4">
        {paginatedItems.map((job, index) => {
          const showSponsored = (index + 1) % 7 === 0; // Her 7 ilandan sonra sponsorlu içerik
          
          return (
            <React.Fragment key={job.id}>
              <article className="job-card group cursor-pointer" onClick={() => handleJobClick(job)}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {job.title}
                      </h2>
                      <p className="text-base text-gray-700 font-medium mt-1">{job.company}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {isNewJob(job.createdAt) && (
                        <span className="badge badge-new">
                          Yeni
                        </span>
                      )}
                      {job.salary && (
                        <span className="badge badge-salary flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="meta-info">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    
                    <div className="meta-info">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{job.type}</span>
                    </div>
                    
                    <div className="meta-info">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{formatDate(job.createdAt)}</span>
                    </div>
                    
                    <div className="meta-info">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{job.category}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      İlan No: {job.id.slice(-8)}
                    </div>
                    <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                      Detayları Görüntüle →
                    </div>
                  </div>
                </div>
              </article>

              {showSponsored && (
                <div className="space-y-4">
                  {index % 21 === 6 && <SponsoredEvimCep />}
                  {index % 21 === 13 && <SponsoredMesailerim />}
                  {index % 21 === 20 && <SponsoredGaming />}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Sayfalama */}
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