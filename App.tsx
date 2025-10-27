
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fetchCoordinatesForCity, fetchCurrentWeather, fetchCitySuggestions, fetchCityFromCoordinates } from './services/weatherService';
import type { WeatherData, GeoLocation } from './types';
import WeatherDisplay from './components/WeatherDisplay';
import MapSelector from './components/MapSelector';

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);


const getBackgroundColor = (weatherCode: number | undefined, isDay: number | undefined): string => {
    if (weatherCode === undefined || isDay === undefined) {
      return 'from-gray-700 to-gray-900';
    }
    const isRaining = weatherCode >= 51 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 82;
    const isCloudy = weatherCode >= 1 && weatherCode <= 3 || weatherCode >= 45 && weatherCode <= 48;

    if (isDay) {
        if (isRaining) return 'from-rain-start to-rain-end';
        if (isCloudy) return 'from-day-cloudy-start to-day-cloudy-end';
        return 'from-day-clear-start to-day-clear-end';
    } else {
        if (isRaining) return 'from-rain-start to-rain-end';
        if (isCloudy) return 'from-night-cloudy-start to-night-cloudy-end';
        return 'from-night-clear-start to-night-clear-end';
    }
};


const App: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  
  type SearchMode = 'text' | 'map';
  const [searchMode, setSearchMode] = useState<SearchMode>('text');

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (city.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const handler = setTimeout(() => {
      fetchCitySuggestions(city).then(results => {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [city]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleSearch = useCallback(async (location: GeoLocation) => {
    setShowSuggestions(false);
    setCity(location.name);
    setLoading(true);
    setError(null);
    setWeatherData(null);
    try {
      const data = await fetchCurrentWeather(location.latitude, location.longitude);
      setWeatherData({ ...data, name: location.name, country: location.country });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(suggestions.length > 0) {
          handleSearch(suggestions[0]);
      } else if (city.trim()) {
          setLoading(true);
          setError(null);
          setWeatherData(null);
          fetchCoordinatesForCity(city).then(location => {
              if (location) {
                  handleSearch(location);
              } else {
                  setError(`Could not find city: ${city}`);
                  setLoading(false);
              }
          }).catch(err => {
            if (err instanceof Error) {
              setError(err.message);
            } else {
              setError('An unknown error occurred.');
            }
            setLoading(false);
          });
      }
  };
  
  const handleMapLocationSelect = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    try {
        const locationInfo = await fetchCityFromCoordinates(lat, lon);
        if (!locationInfo) {
            throw new Error(`Could not determine location for the selected coordinates.`);
        }
        const data = await fetchCurrentWeather(lat, lon);
        setWeatherData({ ...data, name: locationInfo.name, country: locationInfo.country });
        setCity(locationInfo.name);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
        setLoading(false);
        setSearchMode('text');
    }
  }, []);
  
  const backgroundClass = getBackgroundColor(weatherData?.current.weather_code, weatherData?.current.is_day);

  return (
    <main className={`min-h-screen w-full flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gradient-to-br ${backgroundClass} text-white font-sans transition-colors duration-1000`}>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <header className="text-center mb-8 mt-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Weather Now</h1>
          <p className="text-lg sm:text-xl text-white/80 mt-2">Your quick check for current weather</p>
        </header>
        
        <div className="flex items-center justify-center gap-4 mb-6">
            <button 
                onClick={() => setSearchMode('text')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300 ${searchMode === 'text' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                aria-pressed={searchMode === 'text'}
            >
                <SearchIcon className="w-5 h-5" />
                <span>Search City</span>
            </button>
            <button 
                onClick={() => setSearchMode('map')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300 ${searchMode === 'map' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                aria-pressed={searchMode === 'map'}
            >
                <MapPinIcon className="w-5 h-5" />
                <span>Pick on Map</span>
            </button>
        </div>

        {searchMode === 'text' ? (
          <div className="w-full max-w-md animate-fade-in">
            <form onSubmit={handleFormSubmit} className="w-full max-w-md mb-8">
              <div ref={searchContainerRef} className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  placeholder="Enter city name..."
                  className="w-full pl-4 pr-12 py-3 rounded-full bg-white/20 placeholder-white/60 text-white border-2 border-transparent focus:border-white focus:bg-white/30 focus:outline-none transition-all duration-300"
                  autoComplete="off"
                />
                <button type="submit" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-50 transition-colors">
                  {loading && !weatherData ? <LoaderIcon /> : <SearchIcon />}
                </button>

                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute top-full mt-2 w-full bg-white/30 backdrop-blur-md rounded-lg shadow-xl z-10 overflow-hidden">
                    {suggestions.map(s => (
                      <li
                        key={s.id}
                        onClick={() => handleSearch(s)}
                        className="px-4 py-3 cursor-pointer hover:bg-white/20 transition-colors"
                        role="option"
                        aria-selected="false"
                      >
                        {s.name}, {s.country}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-4xl mb-8 animate-fade-in">
              <p className="text-center mb-4 text-white/80">Click on the map to select a location.</p>
              <MapSelector onLocationSelect={handleMapLocationSelect} />
          </div>
        )}

        <div className="w-full max-w-md flex-grow">
          {error && <div className="text-center p-4 bg-red-500/50 rounded-lg">{error}</div>}
          {loading && (
              <div className="flex flex-col items-center justify-center p-4 text-white/70">
                <LoaderIcon className="w-8 h-8"/>
                <p className="mt-2">Fetching weather data...</p>
              </div>
          )}
          {!loading && !error && !weatherData && searchMode === 'text' && (
              <div className="text-center p-4 text-white/70">
                  <p>Enter a city to get the latest weather conditions.</p>
              </div>
          )}
          {!loading && weatherData && <WeatherDisplay data={weatherData} />}
        </div>
      </div>
    </main>
  );
};

export default App;