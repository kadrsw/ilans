import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useMyJobs } from '../hooks/useMyJobs';
import { useJobActions } from '../hooks/useJobActions';

export function MyJobsPage() {
  const navigate = useNavigate();
  const { jobs, loading, error } = useMyJobs();
  const { deleteJob, isDeleting } = useJobActions();
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const handleDeleteClick = (jobId: string) => {
    if (window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      deleteJob(jobId).then((success) => {
        if (success) {
          setJobToDelete(null);
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">İlanlarım</h1>
        <Button onClick={() => navigate('/ilan-ver')}>
          Yeni İlan Oluştur
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-2">Henüz bir ilanınız bulunmuyor</h2>
            <p className="text-gray-600 mb-6">
              İlk ilanınızı oluşturarak iş arayanlarla buluşun
            </p>
            <Button 
              onClick={() => navigate('/ilan-ver')}
              className="w-full sm:w-auto"
            >
              İlk İlanınızı Oluşturun
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const expiresIn = Math.ceil((job.createdAt + (60 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000));
            const isExpiringSoon = expiresIn <= 7;
            
            return (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                    
                    <div className="mt-3 space-y-2">
                      <div className="text-sm text-gray-500">
                        Kategori: {job.category} - {job.subCategory}
                      </div>
                      <div className="text-sm text-gray-500">
                        Lokasyon: {job.location}
                      </div>
                      <div className="text-sm text-gray-500">
                        Çalışma Şekli: {job.type}
                      </div>
                      {job.salary && (
                        <div className="text-sm font-medium text-green-600">
                          Maaş: {job.salary}
                        </div>
                      )}
                      
                      {isExpiringSoon && (
                        <div className="flex items-center gap-1 text-sm text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>
                            {expiresIn} gün sonra otomatik silinecek
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/ilan-duzenle/${job.id}`)}
                      className="flex items-center gap-1"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="hidden sm:inline">Düzenle</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteClick(job.id)}
                      isLoading={isDeleting && jobToDelete === job.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Sil</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}