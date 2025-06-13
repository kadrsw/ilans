import React from 'react';
import { AdBanner } from './AdBanner';

export function AdSidebar() {
  return (
    <div className="space-y-6">
      <AdBanner 
        slot="1234567890"
        format="vertical"
        className="min-h-[600px]"
      />
      <AdBanner 
        slot="0987654321"
        format="rectangle"
        className="min-h-[250px]"
      />
    </div>
  );
}