import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { manualSitemapUpdate } from '../../services/sitemapService';

export function SitemapControls() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleManualUpdate = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const success = await manualSitemapUpdate();
      
      if (success) {
        setLastUpdate(new Date());
        alert('✅ Sitemap başarıyla güncellendi ve Google\'a bildirildi!');
      } else {
        setError('Sitemap güncelleme başarısız oldu');
      }
    } catch (err) {
      setError('Sitemap güncelleme sırasında hata oluştu');
      console.error('Sitemap update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <RefreshCw className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Sitemap Yönetimi</h3>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Sitemap'i manuel olarak güncelleyebilir ve Google'a bildirebilirsiniz. 
          Yeni ilanlar otomatik olarak sitemap'e eklenir.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleManualUpdate}
            isLoading={isUpdating}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Sitemap'i Güncelle
          </Button>

          <a
            href="https://isilanlarim.org/sitemap-jobs.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Sitemap'i Görüntüle
          </a>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Google Console
          </a>
        </div>

        {lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Son güncelleme: {lastUpdate.toLocaleString('tr-TR')}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Otomatik Güncelleme</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Yeni ilan eklendiğinde sitemap otomatik güncellenir</li>
            <li>• İlan güncellendiğinde sitemap yenilenir</li>
            <li>• İlan silindiğinde sitemap'ten kaldırılır</li>
            <li>• Google'a otomatik bildirim gönderilir</li>
          </ul>
        </div>
      </div>
    </div>
  );
}