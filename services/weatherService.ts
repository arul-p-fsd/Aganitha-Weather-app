
import type { GeoLocation, GeoLocationResponse, WeatherApiResponse } from '../types';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const REVERSE_GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/reverse';


export const fetchCoordinatesForCity = async (city: string): Promise<GeoLocation | null> => {
  const response = await fetch(`${GEOCODING_API_URL}?name=${encodeURIComponent(city)}&count=1`);
  if (!response.ok) {
    throw new Error('Failed to fetch location data.');
  }
  const data: GeoLocationResponse = await response.json();
  return data.results?.[0] || null;
};

export const fetchCitySuggestions = async (query: string): Promise<GeoLocation[]> => {
  if (!query) return [];
  const response = await fetch(`${GEOCODING_API_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
  if (!response.ok) {
    console.error('Failed to fetch city suggestions.');
    return [];
  }
  const data: GeoLocationResponse = await response.json();
  return data.results || [];
};

export const fetchCityFromCoordinates = async (latitude: number, longitude: number): Promise<{ name: string; country: string } | null> => {
  const response = await fetch(`${REVERSE_GEOCODING_API_URL}?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
  if (!response.ok) {
    throw new Error('Failed to fetch location data from coordinates.');
  }
  const data = await response.json();
  if (data.error) {
    console.error('Reverse geocoding error:', data.error);
    return null;
  }
  const address = data.address;
  const cityName = address.city || address.town || address.village || address.hamlet || address.county;
  if (!cityName) {
    return null;
  }
  return { name: cityName, country: address.country };
};


export const fetchCurrentWeather = async (latitude: number, longitude: number): Promise<WeatherApiResponse> => {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
    timezone: 'auto',
  });

  const response = await fetch(`${WEATHER_API_URL}?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data.');
  }
  const data: WeatherApiResponse = await response.json();
  return data;
};