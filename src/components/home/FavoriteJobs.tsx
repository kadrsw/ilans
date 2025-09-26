import React from 'react';
import { Heart, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { generateJobUrl } from '../../utils/seoUtils';
import { formatDate, getTimeAgo } from '../../utils/dateUtils';

export function FavoriteJobs() {
  const { favorites, loading, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Heart className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Henüz favori ilanınız yok</p>
        <p className="text-xs text-gray-500 mt-2">
          İlanlarda kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {favorites.slice(0, 5).map((job) => (
        <div key={job.id} className="relative group">
          <button
            onClick={() => navigate(generateJobUrl(job))}
            className="w-full text-left p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 pr-8"
          >
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{job.title}</h3>
            <p className="text-xs text-gray-500">
              {formatDate(job.addedAt || job.createdAt)} ({getTimeAgo(job.addedAt || job.createdAt)})
            </p>
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeFromFavorites(job.id);
            }}
            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Favorilerden çıkar"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      ))}
      
      {favorites.length > 5 && (
        <button
          onClick={() => navigate('/favoriler')}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
        >
          Tüm favorileri görüntüle ({favorites.length})
        </button>
      )}
    </div>
  );
}