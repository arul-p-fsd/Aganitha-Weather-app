
import React from 'react';
import type { WeatherData } from '../types';
import { WEATHER_CODE_MAP } from '../constants';
import { WeatherIcon } from './WeatherIcon';
import InfoCard from './InfoCard';

import { Droplets, Thermometer, Wind, Sunrise, Sunset, Umbrella } from 'lucide-react';

const WeatherDisplay: React.FC<{ data: WeatherData }> = ({ data }) => {
  const { name, country, current } = data;
  const weatherDescription = WEATHER_CODE_MAP[current.weather_code] || 'Unknown';

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 text-white animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">{name}</h2>
        <p className="text-lg text-white/80">{country}</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around mb-6">
        <div className="flex-shrink-0 text-center">
            <WeatherIcon code={current.weather_code} isDay={current.is_day === 1} className="w-28 h-28 mx-auto" />
            <p className="text-xl capitalize mt-2">{weatherDescription}</p>
        </div>
        <div className="text-center md:text-left mt-6 md:mt-0">
          <p className="text-7xl font-extrabold">{Math.round(current.temperature_2m)}°</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <InfoCard
          icon={<Thermometer size={24} />}
          label="Feels like"
          value={`${Math.round(current.apparent_temperature)}°`}
        />
        <InfoCard
          icon={<Droplets size={24} />}
          label="Humidity"
          value={`${current.relative_humidity_2m}%`}
        />
        <InfoCard
          icon={<Wind size={24} />}
          label="Wind"
          value={`${current.wind_speed_10m.toFixed(1)} km/h`}
        />
        <InfoCard
          icon={<Umbrella size={24} />}
          label="Precipitation"
          value={`${current.precipitation} mm`}
        />
        <InfoCard
          icon={current.is_day ? <Sunrise size={24} /> : <Sunset size={24} />}
          label="Day/Night"
          value={current.is_day ? 'Day' : 'Night'}
        />
      </div>
    </div>
  );
};

export default WeatherDisplay;
