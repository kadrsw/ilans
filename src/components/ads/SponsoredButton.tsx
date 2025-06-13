import React from 'react';
import { ExternalLink, Gamepad2 } from 'lucide-react';

export function SponsoredButton() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Sponsorlu İçerik</h3>
      <a
        href="https://www.ultraortaklik6.com/links/?btag=1707444"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:opacity-90 transition-opacity"
      >
        <Gamepad2 className="h-8 w-8 text-purple-600" />
        <div>
          <div className="font-medium text-purple-900">Güvenilir Sanal Oyunlar</div>
          <div className="text-sm text-purple-700">Online Oyun Platformu</div>
        </div>
        <ExternalLink className="h-4 w-4 text-purple-600 ml-auto" />
      </a>
    </div>
  );
}