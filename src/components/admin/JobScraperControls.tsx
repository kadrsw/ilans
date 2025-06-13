import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { getScrapingStatus, checkNewJobs } from '../../services/jobScraper';

export function JobScraperControls() {
  const [status, setStatus] = useState<{
    lastRun?: number;
    isRunning?: boolean;
    error?: string;
  }>({});
  const [newJobs, setNewJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const currentStatus = await getScrapingStatus();
      if (currentStatus) {
        setStatus(currentStatus);
      }
      setLoading(false);
    };

    const checkJobCount = async () => {
      const count = await checkNewJobs();
      setNewJobs(count);
    };

    checkStatus();
    checkJobCount();

    // Her 5 dakikada bir güncelle
    const interval = setInterval(() => {
      checkStatus();
      checkJobCount();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Otomatik İlan Çekme Durumu</h3>
          <p className="text-sm text-gray-600">
            Her gün 09:00 ve 17:00'de otomatik çalışır
          </p>
        </div>

        {status.isRunning ? (
          <div className="flex items-center text-blue-600">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Çalışıyor...
          </div>
        ) : status.error ? (
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Hata
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            Hazır
          </div>
        )}
      </div>

      {status.lastRun && (
        <div className="text-sm text-gray-600">
          Son çalışma: {new Date(status.lastRun).toLocaleString('tr-TR')}
        </div>
      )}

      {newJobs > 0 && (
        <div className="text-sm text-green-600">
          Son 1 saatte {newJobs} yeni ilan eklendi
        </div>
      )}

      {status.error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
          {status.error}
        </div>
      )}
    </div>
  );
}