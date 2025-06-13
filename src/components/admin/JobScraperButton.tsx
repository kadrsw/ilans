import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useJobScraper } from '../../hooks/useJobScraper';

export function JobScraperButton() {
  const { startScraping, isLoading, error } = useJobScraper();

  const handleClick = async () => {
    const success = await startScraping();
    if (success) {
      alert('Örnek iş ilanları başarıyla eklendi');
    }
  };

  return (
    <div>
      <Button
        onClick={handleClick}
        isLoading={isLoading}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Örnek İlanları Ekle
      </Button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}