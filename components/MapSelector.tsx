
import React, { useEffect, useRef, useState } from 'react';

declare const L: any;

interface MapSelectorProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({ onLocationSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  useEffect(() => {
    if (typeof L === 'undefined') {
      console.error('Leaflet is not loaded');
      return;
    }
    
    if (mapContainerRef.current && !mapRef.current) {
        
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current).setView([20, 0], 2);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng).addTo(map);
        }
        onLocationSelect(lat, lng);
      });
      
      setTimeout(() => {
        map.invalidateSize();
        setIsMapInitialized(true);
      }, 100);
    }
  }, [onLocationSelect]);

  return (
    <div className={`w-full max-w-4xl h-96 rounded-2xl overflow-hidden shadow-lg transition-opacity duration-500 bg-white/10 ${isMapInitialized ? 'opacity-100' : 'opacity-0'}`}>
        <div ref={mapContainerRef} className="w-full h-full" aria-label="World map for location selection"></div>
    </div>
  );
};

export default MapSelector;
