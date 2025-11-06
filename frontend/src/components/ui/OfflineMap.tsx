import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Download, Check } from 'lucide-react';

// Leaflet types
interface OfflineMapProps {
  center?: [number, number];
  zoom?: number;
  locations?: Array<{
    name: string;
    lat: number;
    lng: number;
    description?: string;
  }>;
  groupId?: string;
  autoCache?: boolean;
}

export function OfflineMap({ 
  center = [0, 0], 
  zoom = 13, 
  locations = [],
  groupId,
  autoCache = true 
}: OfflineMapProps) {
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tilesCached, setTilesCached] = useState(false);
  const [cachingProgress, setCachingProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import Leaflet (client-side only)
    import('leaflet').then((L) => {
      if (mapRef.current) return; // Already initialized

      // Initialize map
      const map = L.map('map').setView(center, zoom);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add markers for locations
      locations.forEach((location) => {
        const marker = L.marker([location.lat, location.lng]).addTo(map);
        if (location.name || location.description) {
          marker.bindPopup(`
            <div>
              <strong>${location.name}</strong>
              ${location.description ? `<p>${location.description}</p>` : ''}
            </div>
          `);
        }
      });

      mapRef.current = map;
      setMapLoaded(true);

      // Auto-cache tiles for offline use
      if (autoCache && groupId) {
        cacheMapTiles(map, groupId);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, locations, groupId, autoCache]);

  const cacheMapTiles = async (map: any, groupId: string) => {
    console.log('[OfflineMap] Starting tile cache for group', groupId);
    
    const bounds = map.getBounds();
    const currentZoom = map.getZoom();
    const tilesToCache: string[] = [];

    // Calculate tiles to cache (current view + 1 zoom level up/down)
    for (let z = Math.max(0, currentZoom - 1); z <= Math.min(19, currentZoom + 1); z++) {
      const nwTile = latLngToTile(bounds.getNorthWest().lat, bounds.getNorthWest().lng, z);
      const seTile = latLngToTile(bounds.getSouthEast().lat, bounds.getSouthEast().lng, z);

      for (let x = nwTile.x; x <= seTile.x; x++) {
        for (let y = nwTile.y; y <= seTile.y; y++) {
          const tileUrl = `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
          tilesToCache.push(tileUrl);
        }
      }
    }

    console.log(`[OfflineMap] Caching ${tilesToCache.length} tiles...`);

    // Cache tiles using Cache API
    try {
      const cache = await caches.open('map-tiles-v1');
      let cached = 0;

      for (const tileUrl of tilesToCache) {
        try {
          const response = await fetch(tileUrl);
          if (response.ok) {
            await cache.put(tileUrl, response);
            cached++;
            setCachingProgress(Math.round((cached / tilesToCache.length) * 100));
          }
        } catch (error) {
          console.warn('[OfflineMap] Failed to cache tile:', tileUrl);
        }
      }

      console.log(`[OfflineMap] Cached ${cached}/${tilesToCache.length} tiles`);
      setTilesCached(true);

      // Store cached map info in IndexedDB
      if (typeof window !== 'undefined') {
        const { offlineDB, STORES } = await import('../../lib/offlineDB');
        await offlineDB.put(STORES.tripPackages, {
          groupId,
          mapBounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          },
          zoom: currentZoom,
          tileCount: cached,
          cachedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('[OfflineMap] Error caching tiles:', error);
    }
  };

  const latLngToTile = (lat: number, lng: number, zoom: number) => {
    const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom)
    );
    return { x, y };
  };

  return (
    <div className="relative">
      <div id="map" className="h-96 w-full rounded-lg border border-slate-200 shadow-sm"></div>
      
      {autoCache && groupId && (
        <div className="absolute top-4 right-4 z-[1000]">
          {!tilesCached && cachingProgress > 0 && (
            <div className="bg-white rounded-lg shadow-lg px-4 py-2 border border-blue-200">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-sm text-blue-900">
                  Caching map... {cachingProgress}%
                </span>
              </div>
            </div>
          )}
          {tilesCached && (
            <div className="bg-green-50 rounded-lg shadow-lg px-4 py-2 border border-green-200">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-900">
                  Map cached for offline
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
    </div>
  );
}

// Export a dynamic version to avoid SSR issues
export const DynamicOfflineMap = dynamic(
  () => Promise.resolve(OfflineMap),
  { ssr: false }
);
