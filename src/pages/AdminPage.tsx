import React from 'react';
import { Navigate } from 'react-router-dom';
import { Settings, RefreshCw, Users, FileText, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { JobScraperControls } from '../components/admin/JobScraperControls';
import { SitemapControls } from '../components/admin/SitemapControls';

export function AdminPage() {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Paneli</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* İş İlanı Yönetimi */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">İş İlanı Yönetimi</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              İş ilanlarını otomatik veya manuel olarak çekebilirsiniz.
              Otomatik çekme her 12 saatte bir çalışır.
            </p>
            
            <JobScraperControls />
          </div>
        </div>

        {/* Sitemap Yönetimi */}
        <SitemapControls />

        {/* İstatistikler */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">İstatistikler</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Toplam İlan</div>
              <div className="text-2xl font-bold text-blue-600">-</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Aktif İlan</div>
              <div className="text-2xl font-bold text-green-600">-</div>
            </div>
          </div>
        </div>

        {/* Admin Bilgileri */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Admin Bilgileri</h2>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">E-posta:</span>
              <div className="font-medium">{user.email}</div>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">Rol:</span>
              <div className="font-medium">Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Bilgileri */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">SEO Durumu</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">Sitemap Durumu</div>
            <div className="text-lg font-bold text-green-600">Aktif</div>
            <div className="text-xs text-gray-500 mt-1">Otomatik güncelleme</div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Google Indexing</div>
            <div className="text-lg font-bold text-blue-600">Çalışıyor</div>
            <div className="text-xs text-gray-500 mt-1">Otomatik bildirim</div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Schema Markup</div>
            <div className="text-lg font-bold text-purple-600">Aktif</div>
            <div className="text-xs text-gray-500 mt-1">JobPosting schema</div>
          </div>
        </div>
      </div>
    </div>
  );
}