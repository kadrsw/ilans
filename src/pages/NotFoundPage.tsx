import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sayfa Bulunamadı</h2>
        <p className="text-gray-600 mb-8">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>
        
        <div className="space-y-4">
          <Link 
            to="/"
            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Home className="h-5 w-5" />
            Ana Sayfaya Dön
          </Link>
          
          <Link
            to="/is-ilanlari"
            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Search className="h-5 w-5" />
            İş İlanlarını İncele
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700 mx-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Önceki Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}