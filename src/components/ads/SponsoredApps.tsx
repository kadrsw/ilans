import React from 'react';
import { ExternalLink, Home, Clock } from 'lucide-react';

export function SponsoredApps() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Sponsorlu Uygulamalar</h3>
      
      <a
        href="https://play.google.com/store/apps/details?id=app.evimcep.android"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:opacity-90 transition-opacity"
      >
        <Home className="h-8 w-8 text-blue-600" />
        <div>
          <div className="font-medium text-blue-900">EvimCep</div>
          <div className="text-sm text-blue-700">Hızlı Emlak ve Konut Arama</div>
        </div>
        <ExternalLink className="h-4 w-4 text-blue-600 ml-auto" />
      </a>

      <a
        href="https://play.google.com/store/apps/details?id=app.mesailerim.android"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:opacity-90 transition-opacity"
      >
        <Clock className="h-8 w-8 text-green-600" />
        <div>
          <div className="font-medium text-green-900">Mesailerim</div>
          <div className="text-sm text-green-700">Fazla Mesai Hesaplama</div>
        </div>
        <ExternalLink className="h-4 w-4 text-green-600 ml-auto" />
      </a>
    </div>
  );
}