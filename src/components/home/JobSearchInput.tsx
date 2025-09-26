import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { jobCategories } from '../../data/jobCategories';

interface JobSearchInputProps {
  onSearch: (search: string) => void;
  onFocus?: () => void;
}

export function JobSearchInput({ onSearch, onFocus }: JobSearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Flatten all job titles from categories
  const allJobTitles = jobCategories.flatMap(category => 
    category.subCategories.map(sub => sub.name)
  );

  // Popular search terms - İsinolsun.com inspired
  const popularSearchTerms = [
    'DME Group Çağrı Merkezi',
    'Getir Kurye',
    'Dominos Pizza',
    'Burger King',
    'Yüksek Maaşlı İş',
    'Dolgun Maaşlı İş',
    'Home Office Çağrı Merkezi',
    'Evde Paketleme',
    'Bahçelievler Kurye',
    'Akkuyu Nükleer Santral',
    'Yatılı İş',
    'Part Time Garson',
    'Aşçı Yardımcısı',
    'Özel Güvenlik',
    'Muhasebe Personeli',
    'Trendyol Kurye',
    'Migros Kasiyer',
    'BIM Personeli',
    'A101 Çalışanı',
    'Deneyimsiz İş'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch(value);

    if (value.length >= 2) {
      const filtered = allJobTitles.filter(title =>
        title.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (onFocus) onFocus();
    if (inputValue.length >= 2) {
      setShowSuggestions(true);
    } else if (inputValue.length === 0) {
      setSuggestions(popularSearchTerms);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder="İş ara... (Yazılım Geliştirici, Garson, Kurye, Mühendis)"
        onChange={handleInputChange}
        onFocus={handleFocus}
        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm"
      />
      
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border-2 border-gray-200 py-2 max-h-64 overflow-y-auto"
        >
          {inputValue.length === 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 font-semibold border-b border-gray-100 bg-red-50">
              🔥 Popüler İş Aramaları
            </div>
          )}
          
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:outline-none transition-colors text-sm font-medium touch-target"
              >
                {suggestion}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">Sonuç bulunamadı</div>
          )}
        </div>
      )}
    </div>
  );
}