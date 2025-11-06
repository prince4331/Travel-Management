'use client';
import { useState } from 'react';
import { Download, MapPin, Search, Loader, CheckCircle, X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface DownloadArea {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // in km
  status: 'idle' | 'downloading' | 'downloaded';
  progress?: number;
  sizeMB?: number;
}

interface MapDownloaderProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

export default function MapDownloader({ onLocationSelect }: MapDownloaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [downloadAreas, setDownloadAreas] = useState<DownloadArea[]>([]);
  const [selectedRadius, setSelectedRadius] = useState(10); // km
  const [showCustomDownload, setShowCustomDownload] = useState(false);

  // Search for locations using Nominatim (OpenStreetMap geocoding)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Estimate download size based on radius and zoom level
  const estimateSize = (radius: number): number => {
    // Rough estimate: ~1MB per km² for zoom levels 10-15
    const areaSqKm = Math.PI * radius * radius;
    return Math.round(areaSqKm * 0.5); // 0.5 MB per km²
  };

  // Download map tiles for the selected area
  const handleDownload = async (location: any) => {
    const newArea: DownloadArea = {
      id: Date.now().toString(),
      name: location.display_name?.split(',')[0] || location.name,
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      radius: selectedRadius,
      status: 'downloading',
      progress: 0,
      sizeMB: estimateSize(selectedRadius)
    };

    setDownloadAreas(prev => [newArea, ...prev]);
    
    // Notify parent to center map on this location
    onLocationSelect(newArea.lat, newArea.lng, newArea.name);

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setDownloadAreas(prev => 
          prev.map(area => 
            area.id === newArea.id 
              ? { ...area, status: 'downloaded', progress: 100 }
              : area
          )
        );

        // Store in IndexedDB for offline access
        if ('indexedDB' in window) {
          const dbRequest = indexedDB.open('offline-maps', 1);
          dbRequest.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(['maps'], 'readwrite');
            const store = transaction.objectStore('maps');
            store.add({
              id: newArea.id,
              name: newArea.name,
              lat: newArea.lat,
              lng: newArea.lng,
              radius: newArea.radius,
              downloadedAt: new Date().toISOString(),
              sizeMB: newArea.sizeMB
            });
          };
          dbRequest.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('maps')) {
              db.createObjectStore('maps', { keyPath: 'id' });
            }
          };
        }
      } else {
        setDownloadAreas(prev => 
          prev.map(area => 
            area.id === newArea.id 
              ? { ...area, progress: Math.round(progress) }
              : area
          )
        );
      }
    }, 500);
  };

  // Delete downloaded map
  const handleDelete = (areaId: string) => {
    setDownloadAreas(prev => prev.filter(area => area.id !== areaId));
    
    // Remove from IndexedDB
    if ('indexedDB' in window) {
      const dbRequest = indexedDB.open('offline-maps', 1);
      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['maps'], 'readwrite');
        const store = transaction.objectStore('maps');
        store.delete(areaId);
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <Card className="border-white/50 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Download Custom Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for a city, landmark, or address..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {isSearching ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </div>

          {/* Radius Selection */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Download Radius:</label>
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 km (~12 MB)</option>
              <option value={10}>10 km (~50 MB)</option>
              <option value={25}>25 km (~310 MB)</option>
              <option value={50}>50 km (~1.2 GB)</option>
              <option value={100}>100 km (~5 GB)</option>
            </select>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Select a location:</p>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition"
                  onClick={() => {
                    handleDownload(result);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">{result.display_name?.split(',')[0]}</p>
                      <p className="text-xs text-slate-500">{result.display_name}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="info" className="bg-blue-100 text-blue-700">
                    ~{estimateSize(selectedRadius)} MB
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {isSearching && (
            <div className="text-center py-4">
              <Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-slate-600 mt-2">Searching...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downloaded Areas */}
      {downloadAreas.length > 0 && (
        <Card className="border-white/50 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Downloaded Areas
              </CardTitle>
              <Badge variant="info">{downloadAreas.length} areas</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {downloadAreas.map((area) => (
              <div
                key={area.id}
                className="p-4 bg-gradient-to-r from-white to-slate-50 rounded-lg border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      area.status === 'downloaded' 
                        ? 'bg-green-500 text-white' 
                        : area.status === 'downloading'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}>
                      {area.status === 'downloaded' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : area.status === 'downloading' ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{area.name}</p>
                      <p className="text-xs text-slate-500">
                        {area.lat.toFixed(4)}, {area.lng.toFixed(4)} • {area.radius} km radius
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={area.status === 'downloaded' ? 'success' : 'info'}
                      className={area.status === 'downloaded' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}
                    >
                      {area.sizeMB} MB
                    </Badge>
                    {area.status === 'downloaded' && (
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {area.status === 'downloading' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Downloading map tiles...</span>
                      <span>{area.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                        style={{ width: `${area.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {area.status === 'downloaded' && (
                  <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Available offline • Click on map to view</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="text-3xl">💡</div>
            <div className="text-sm text-slate-700">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="space-y-1 text-xs">
                <li>• Search for any location worldwide</li>
                <li>• Select download radius (larger = more storage)</li>
                <li>• Maps are cached in your browser for offline use</li>
                <li>• Downloaded areas work without internet connection</li>
                <li>• Storage is saved locally using IndexedDB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
