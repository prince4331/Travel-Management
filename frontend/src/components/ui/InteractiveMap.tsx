'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
}

interface InteractiveMapProps {
  locations?: MapLocation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  enableDownloadSelection?: boolean;
  downloadRadius?: number;
  onLocationClick?: (lat: number, lng: number) => void;
}

// Component to handle map clicks for download selection
function MapClickHandler({ 
  onLocationClick, 
  enableDownloadSelection,
  downloadRadius = 10
}: { 
  onLocationClick?: (lat: number, lng: number) => void;
  enableDownloadSelection?: boolean;
  downloadRadius?: number;
}) {
  const [clickedLocation, setClickedLocation] = useState<[number, number] | null>(null);

  useMapEvents({
    click: (e) => {
      if (enableDownloadSelection && onLocationClick) {
        const { lat, lng } = e.latlng;
        setClickedLocation([lat, lng]);
        onLocationClick(lat, lng);
      }
    },
  });

  if (!enableDownloadSelection || !clickedLocation) return null;

  return (
    <>
      <Circle
        center={clickedLocation}
        radius={downloadRadius * 1000} // Convert km to meters
        pathOptions={{
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 0.2,
          weight: 2,
        }}
      />
      <Marker position={clickedLocation}>
        <Popup>
          <div className="p-2">
            <h3 className="font-bold text-slate-900 mb-1">📍 Selected Location</h3>
            <p className="text-sm text-slate-600 mb-2">
              Click "Download This Area" to save offline
            </p>
            <div className="text-xs text-slate-500">
              {clickedLocation[0].toFixed(4)}, {clickedLocation[1].toFixed(4)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Coverage: {downloadRadius} km radius
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

// Component to handle map view updates
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveMap({
  locations = [],
  center = [20, 0], // Default center (world view)
  zoom = 2,
  height = '500px',
  enableDownloadSelection = false,
  downloadRadius = 10,
  onLocationClick
}: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden shadow-xl border border-white/50">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <ChangeView center={center} zoom={zoom} />
        
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map click handler for download selection */}
        {enableDownloadSelection && (
          <MapClickHandler 
            onLocationClick={onLocationClick}
            enableDownloadSelection={enableDownloadSelection}
            downloadRadius={downloadRadius}
          />
        )}

        {/* Markers for locations */}
        {locations.map((location) => (
          <Marker key={location.id} position={[location.lat, location.lng]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-slate-900 mb-1">{location.name}</h3>
                {location.description && (
                  <p className="text-sm text-slate-600">{location.description}</p>
                )}
                <div className="mt-2 text-xs text-slate-500">
                  📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
