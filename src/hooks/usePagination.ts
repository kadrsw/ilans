import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

interface PaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination<T>(
  items: T[],
  options: PaginationOptions = {}
) {
  const { itemsPerPage = 20, initialPage = 1 } = options;
  
  // Ensure items is always an array
  const safeItems = items || [];

  // Safe router hooks usage
  let searchParams: URLSearchParams;
  let setSearchParams: (params: URLSearchParams) => void;
  
  try {
    const [params, setParams] = useSearchParams();
    searchParams = params;
    setSearchParams = setParams;
  } catch (error) {
    // Fallback when not in router context
    searchParams = new URLSearchParams(window.location.search);
    setSearchParams = () => {};
  }
  
  // URL'den sayfa numarasını al
  const pageParam = searchParams.get('sayfa');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  
  // KRİTİK: Sayfalama öncesi ilanların sırasını kontrol et
  useEffect(() => {
    if (safeItems.length > 0) {
      // İlk 5 ilanın tarihlerini kontrol et
      console.log('📊 Sayfalama öncesi ilk 5 ilan:', safeItems.slice(0, 5).map(item => ({
        id: (item as any).id,
        title: (item as any).title,
        createdAt: new Date((item as any).createdAt).toLocaleString('tr-TR'),
        timestamp: (item as any).createdAt
      })));
      
      // Son 5 ilanın tarihlerini kontrol et
      console.log('📊 Sayfalama öncesi son 5 ilan:', safeItems.slice(-5).map(item => ({
        id: (item as any).id,
        title: (item as any).title,
        createdAt: new Date((item as any).createdAt).toLocaleString('tr-TR'),
        timestamp: (item as any).createdAt
      })));
      
      // Tarih sıralamasını kontrol et
      const sortedCorrectly = safeItems.every((item, index) => {
        if (index === 0) return true;
        const currentTimestamp = (item as any).createdAt || 0;
        const prevTimestamp = (safeItems[index - 1] as any).createdAt || 0;
        return currentTimestamp <= prevTimestamp; // Azalan sıralama (yeni->eski)
      });
      
      console.log(`📊 Sayfalama öncesi sıralama doğru mu: ${sortedCorrectly ? '✅ EVET' : '❌ HAYIR'}`);
    }
  }, [safeItems]);
  
  // Toplam sayfa sayısını hesapla
  const totalPages = Math.max(1, Math.ceil(safeItems.length / itemsPerPage));
  
  // Geçerli sayfa numarasını doğrula
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  
  // Mevcut sayfa için öğeleri hesapla
  const paginatedItems = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return safeItems.slice(startIndex, endIndex);
  }, [safeItems, validCurrentPage, itemsPerPage]);
  
  // Sayfa değiştirme fonksiyonu
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    try {
      const newSearchParams = new URLSearchParams(searchParams);
      if (page === 1) {
        newSearchParams.delete('sayfa');
      } else {
        newSearchParams.set('sayfa', page.toString());
      }
      setSearchParams(newSearchParams);
    } catch (error) {
      // Fallback for when not in router context
      const url = new URL(window.location.href);
      if (page === 1) {
        url.searchParams.delete('sayfa');
      } else {
        url.searchParams.set('sayfa', page.toString());
      }
      window.history.pushState({}, '', url.toString());
    }
    
    // Sayfanın üstüne scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Sayfa numaralarını hesapla (1, 2, 3, ... formatında)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7; // Mobilde daha az göster
    
    if (totalPages <= maxVisiblePages) {
      // Tüm sayfaları göster
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Akıllı sayfalama
      if (validCurrentPage <= 4) {
        // Başlangıçta
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        // Sonda
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ortada
        pages.push(1);
        pages.push('...');
        for (let i = validCurrentPage - 1; i <= validCurrentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  // Başlangıç ve bitiş indeksleri
  const startIndex = (validCurrentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(validCurrentPage * itemsPerPage, safeItems.length);
  
  return {
    currentPage: validCurrentPage,
    totalPages,
    totalItems: safeItems.length,
    paginatedItems,
    goToPage,
    getPageNumbers,
    hasNextPage: validCurrentPage < totalPages,
    hasPrevPage: validCurrentPage > 1,
    startIndex,
    endIndex
  };
}