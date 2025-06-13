import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination<T>(
  items: T[],
  options: PaginationOptions = {}
) {
  const { itemsPerPage = 20, initialPage = 1 } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL'den sayfa numarasını al
  const currentPage = parseInt(searchParams.get('sayfa') || '1', 10);
  
  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // Mevcut sayfa için öğeleri hesapla
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);
  
  // Sayfa değiştirme fonksiyonu
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const newSearchParams = new URLSearchParams(searchParams);
    if (page === 1) {
      newSearchParams.delete('sayfa');
    } else {
      newSearchParams.set('sayfa', page.toString());
    }
    setSearchParams(newSearchParams);
    
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
      if (currentPage <= 4) {
        // Başlangıçta
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
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
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  return {
    currentPage,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    goToPage,
    getPageNumbers,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, items.length)
  };
}