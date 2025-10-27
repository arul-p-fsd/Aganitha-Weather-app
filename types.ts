
export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface GeoLocationResponse {
  results: GeoLocation[];
}

export interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
}

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  current: CurrentWeather;
}

export interface WeatherData extends WeatherApiResponse {
  name: string;
  country: string;
}
