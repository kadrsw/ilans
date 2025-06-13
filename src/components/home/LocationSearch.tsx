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
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={inputValue}
        placeholder="Şehir seçin"
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
      />

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {filteredCities.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">Şehir bulunamadı</div>
          ) : (
            filteredCities.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className="w-full text-left px-4 py-2 text-gray-900 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
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