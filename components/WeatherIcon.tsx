
import React from 'react';
import { Sun, Moon, Cloud, CloudSun, CloudMoon, CloudRain, CloudDrizzle, CloudLightning, Snowflake, CloudFog, CloudHail } from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay: boolean;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, isDay, className }) => {
  const IconComponent = (() => {
    switch (code) {
      case 0: // Clear sky
        return isDay ? Sun : Moon;
      case 1: // Mainly clear
        return isDay ? CloudSun : CloudMoon;
      case 2: // Partly cloudy
      case 3: // Overcast
        return Cloud;
      case 45: // Fog
      case 48: // Depositing rime fog
        return CloudFog;
      case 51: // Drizzle: Light
      case 53: // Drizzle: Moderate
      case 55: // Drizzle: Dense
        return CloudDrizzle;
      case 56: // Freezing Drizzle: Light
      case 57: // Freezing Drizzle: Dense
        return CloudDrizzle;
      case 61: // Rain: Slight
      case 63: // Rain: Moderate
      case 65: // Rain: Heavy
      case 80: // Rain showers: Slight
      case 81: // Rain showers: Moderate
      case 82: // Rain showers: Violent
        return CloudRain;
      case 66: // Freezing Rain: Light
      case 67: // Freezing Rain: Heavy
        return CloudRain;
      case 71: // Snow fall: Slight
      case 73: // Snow fall: Moderate
      case 75: // Snow fall: Heavy
      case 77: // Snow grains
      case 85: // Snow showers: Slight
      case 86: // Snow showers: Heavy
        return Snowflake;
      case 95: // Thunderstorm: Slight or moderate
        return CloudLightning;
      case 96: // Thunderstorm with slight hail
      case 99: // Thunderstorm with heavy hail
        return CloudHail;
      default:
        return Cloud;
    }
  })();

  return <IconComponent className={className} />;
};
