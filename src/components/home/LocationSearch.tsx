import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { turkishCities } from '../../data/turkishCities';

interface LocationSearchProps {
  onLocationChange: (location: string) => void;
}

export function LocationSearch({ onLocationChange }: LocationSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredCities = turkishCities.filter(city =>
    city.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onLocationChange(value);
    setShowSuggestions(true);
  };

  const handleCitySelect = (city: string) => {
    setInputValue(city);
    onLocationChange(city);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        value={inputValue}
        placeholder="Şehir seçin... (İstanbul, Ankara, İzmir, Bursa, Antalya)"
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm"
      />

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border-2 border-gray-200 max-h-64 overflow-y-auto">
          {filteredCities.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">🏙️ Şehir bulunamadı</div>
          ) : (
            filteredCities.slice(0, 10).map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className="w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:outline-none transition-colors text-sm font-medium touch-target"
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