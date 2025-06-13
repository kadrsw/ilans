import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { turkishCities } from '../data/turkishCities';

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function LocationSelect({ value, onChange, error }: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = turkishCities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (city: string) => {
    onChange(city);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : value}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Şehir seçin"
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {filteredCities.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">Şehir bulunamadı</div>
          ) : (
            filteredCities.map((city) => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-gray-900"
              >
                {city}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}