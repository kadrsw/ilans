import React from 'react';
import { Share2, Heart, Copy, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface JobActionsProps {
  jobId: string;
  jobTitle: string;
}

export function JobActions({ jobId, jobTitle }: JobActionsProps) {
  const { user } = useAuthContext();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isFavorited = isFavorite(jobId);

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error('Favorilere eklemek için giriş yapmalısınız');
      return;
    }

    try {
      if (isFavorited) {
        await removeFromFavorites(jobId);
        toast.success('İlan favorilerden kaldırıldı');
      } else {
        await addToFavorites({
          id: jobId,
          title: jobTitle,
        });
        toast.success('İlan favorilere eklendi');
      }
    } catch (error) {
      console.error('Error managing favorites:', error);
      toast.error('Favoriler güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    try {
      if (navigator.share && window.isSecureContext) {
        await navigator.share({
          title: jobTitle,
          text: `${jobTitle} - İş İlanı`,
          url
        });
      } else {
        // Fallback to copying URL if share API is not available or not in secure context
        await navigator.clipboard.writeText(url);
        toast.success('İlan linki kopyalandı');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to copying URL if sharing fails
      try {
        await navigator.clipboard.writeText(url);
        toast.success('İlan linki kopyalandı');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        toast.error('Link paylaşılamadı');
      }
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('İlan linki kopyalandı');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Link kopyalanamadı');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={handleFavoriteClick}
        className={`flex items-center gap-2 ${
          isFavorited ? 'text-red-600 hover:bg-red-50' : ''
        }`}
      >
        <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
        {isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
      </Button>

      <Button
        variant="outline"
        onClick={handleShare}
        className="flex items-center gap-2"
      >
        <Share2 className="h-5 w-5" />
        Paylaş
      </Button>

      <Button
        variant="outline"
        onClick={handleCopyLink}
        className="flex items-center gap-2"
      >
        <Copy className="h-5 w-5" />
        Linki Kopyala
      </Button>

      <Button
        variant="outline"
        onClick={() => window.open(window.location.href, '_blank')}
        className="flex items-center gap-2"
      >
        <ExternalLink className="h-5 w-5" />
        Yeni Sekmede Aç
      </Button>
    </div>
  );
}