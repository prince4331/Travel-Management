import { useMemo, useState } from "react";
import dynamic from 'next/dynamic';
import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAppStore } from "../store/useAppStore";
import { OfflinePackage } from "../types";
import { Download, MapPin, Trash2, CheckCircle, Loader, Map as MapIcon } from 'lucide-react';

// Dynamically import map to avoid SSR issues
const InteractiveMap = dynamic(() => import('../components/ui/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-sm text-slate-600">Loading map...</p>
      </div>
    </div>
  )
});

const MapDownloader = dynamic(() => import('../components/ui/MapDownloader'), {
  ssr: false
});

const offlineCatalog: OfflinePackage[] = [
  { id: "alps", name: "Swiss Alps terrain", region: "Europe", sizeMB: 512, status: "available", updatedAt: new Date().toISOString() },
  { id: "everest", name: "Everest base camp", region: "Asia", sizeMB: 430, status: "available", updatedAt: new Date().toISOString() },
  { id: "patagonia", name: "Patagonia trekking routes", region: "South America", sizeMB: 610, status: "available", updatedAt: new Date().toISOString() },
  { id: "sahara", name: "Sahara Desert routes", region: "Africa", sizeMB: 380, status: "available", updatedAt: new Date().toISOString() },
  { id: "iceland", name: "Iceland Ring Road", region: "Europe", sizeMB: 290, status: "available", updatedAt: new Date().toISOString() },
  { id: "amazon", name: "Amazon Rainforest trails", region: "South America", sizeMB: 450, status: "available", updatedAt: new Date().toISOString() },
  { id: "himalayas", name: "Himalayas trekking", region: "Asia", sizeMB: 580, status: "available", updatedAt: new Date().toISOString() },
  { id: "newzealand", name: "New Zealand South Island", region: "Oceania", sizeMB: 340, status: "available", updatedAt: new Date().toISOString() },
];

export default function MapsPage() {
  const { groups, updateOfflinePackage } = useAppStore();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [customMapCenter, setCustomMapCenter] = useState<[number, number] | null>(null);
  const [customMapZoom, setCustomMapZoom] = useState<number>(2);
  const [enableMapSelection, setEnableMapSelection] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [downloadRadius, setDownloadRadius] = useState(10);
  const allPackages = useMemo(() => Object.values(groups).flatMap((group) => group.offlinePackages), [groups]);
  const firstGroup = useMemo(() => Object.values(groups)[0], [groups]);

  const handleDownload = async (pkg: OfflinePackage) => {
    if (!firstGroup) return;
    setDownloading(pkg.id);
    updateOfflinePackage(firstGroup.id, { ...pkg, status: "downloading", updatedAt: new Date().toISOString() });
    
    // Simulate download progress
    setTimeout(() => {
      updateOfflinePackage(firstGroup.id, { ...pkg, status: "downloaded", updatedAt: new Date().toISOString() });
      setDownloading(null);
    }, 2000);
  };

  const handleDelete = (pkg: OfflinePackage) => {
    if (!firstGroup) return;
    updateOfflinePackage(firstGroup.id, { ...pkg, status: "available", updatedAt: new Date().toISOString() });
  };

  const totalDownloadedSize = allPackages
    .filter(pkg => pkg.status === "downloaded")
    .reduce((sum, pkg) => sum + pkg.sizeMB, 0);

  const regionColors: { [key: string]: string } = {
    'Europe': 'from-blue-500 to-cyan-500',
    'Asia': 'from-purple-500 to-pink-500',
    'South America': 'from-green-500 to-teal-500',
    'Africa': 'from-orange-500 to-red-500',
    'Oceania': 'from-indigo-500 to-blue-500'
  };

  // Map locations for popular destinations
  const mapLocations = [
    { id: 'alps', name: 'Swiss Alps', lat: 46.5547, lng: 7.9785, description: 'Stunning mountain terrain' },
    { id: 'everest', name: 'Everest Base Camp', lat: 27.9881, lng: 86.9250, description: 'World\'s highest peak base' },
    { id: 'patagonia', name: 'Patagonia', lat: -50.0, lng: -73.0, description: 'Beautiful trekking routes' },
    { id: 'sahara', name: 'Sahara Desert', lat: 23.4162, lng: 25.6628, description: 'Vast desert landscape' },
    { id: 'iceland', name: 'Iceland', lat: 64.9631, lng: -19.0208, description: 'Ring road adventure' },
    { id: 'amazon', name: 'Amazon Rainforest', lat: -3.4653, lng: -62.2159, description: 'Dense jungle trails' },
    { id: 'himalayas', name: 'Himalayas', lat: 28.5, lng: 84.0, description: 'Epic mountain trekking' },
    { id: 'newzealand', name: 'New Zealand', lat: -45.0, lng: 170.0, description: 'South Island beauty' }
  ];

  // Get selected map location
  const selectedLocation = mapLocations.find(loc => loc.id === selectedMap) || mapLocations[0];
  const mapCenter: [number, number] = customMapCenter || (selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [20, 0]);
  const mapZoom = customMapCenter ? customMapZoom : (selectedMap ? 6 : 2);

  const handleCustomLocationSelect = (lat: number, lng: number, name: string) => {
    setCustomMapCenter([lat, lng]);
    setCustomMapZoom(10);
    setSelectedMap(null); // Clear preset selection
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedMapLocation({ lat, lng, name: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})` });
  };

  const handleDownloadSelectedArea = () => {
    if (selectedMapLocation) {
      handleCustomLocationSelect(selectedMapLocation.lat, selectedMapLocation.lng, selectedMapLocation.name);
      // Trigger download similar to search results
      const estimateSize = (radius: number) => Math.round(Math.PI * radius * radius * 0.5);
      alert(`Downloading ${downloadRadius} km around ${selectedMapLocation.name}\nEstimated size: ~${estimateSize(downloadRadius)} MB`);
      setSelectedMapLocation(null);
      setEnableMapSelection(false);
    }
  };

  return (
    <AppLayout
      title="Maps & offline kits"
      description="Prepare OpenStreetMap tiles, vector guides, and medical intel packs for offline use."
      actions={
        <div className="flex gap-2 items-center">
          <Badge variant="success" className="bg-gradient-to-r from-green-400 to-blue-500 text-white border-0">
            ✨ Mesh-ready
          </Badge>
          {totalDownloadedSize > 0 && (
            <Badge variant="info" className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0">
              📦 {totalDownloadedSize} MB cached
            </Badge>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Interactive Map Preview */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-blue-600" />
                <CardTitle>🗺️ Interactive Map Viewer</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {selectedMap && (
                  <Badge variant="info" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    📍 {selectedLocation?.name}
                  </Badge>
                )}
                <Button
                  size="sm"
                  onClick={() => setEnableMapSelection(!enableMapSelection)}
                  className={enableMapSelection 
                    ? "bg-gradient-to-r from-green-500 to-teal-600 text-white" 
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  }
                >
                  {enableMapSelection ? '✓ Click Map to Select' : '🖱️ Select from Map'}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-slate-600">
                {enableMapSelection 
                  ? '👆 Click anywhere on the map to select download area' 
                  : 'Click "Select from Map" then click any location to download'
                }
              </p>
              {enableMapSelection && (
                <select
                  value={downloadRadius}
                  onChange={(e) => setDownloadRadius(parseInt(e.target.value))}
                  className="text-xs px-2 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <InteractiveMap
              locations={selectedMap ? [selectedLocation] : mapLocations}
              center={mapCenter}
              zoom={mapZoom}
              height="500px"
              enableDownloadSelection={enableMapSelection}
              downloadRadius={downloadRadius}
              onLocationClick={handleMapClick}
            />
            {selectedMapLocation && enableMapSelection && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl p-4 border border-blue-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-900 mb-2">
                    📍 Selected: {selectedMapLocation.lat.toFixed(4)}, {selectedMapLocation.lng.toFixed(4)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedMapLocation(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownloadSelectedArea}
                      className="bg-gradient-to-r from-green-500 to-teal-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download This Area
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100">
            <div className="flex gap-2 text-xs flex-wrap">
              <span className="px-3 py-1 bg-white rounded-full shadow-sm">📍 GPS Ready</span>
              <span className="px-3 py-1 bg-white rounded-full shadow-sm">🔄 Auto-sync offline</span>
              <span className="px-3 py-1 bg-white rounded-full shadow-sm">📱 Mobile optimized</span>
              <span className="px-3 py-1 bg-white rounded-full shadow-sm">🗺️ OpenStreetMap</span>
              <span className="px-3 py-1 bg-white rounded-full shadow-sm">✈️ Works offline</span>
            </div>
          </div>
        </Card>

        {/* Custom Map Downloader */}
        <MapDownloader onLocationSelect={handleCustomLocationSelect} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/50 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🌍</span>
                  Recommended downloads
                </CardTitle>
                <Badge variant="default">{offlineCatalog.length} available</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!firstGroup && (
                <div className="text-center py-8 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-700 mb-3">⚠️ Create a group to download offline packages</p>
                  <Button size="sm" variant="secondary" asChild>
                    <a href="/groups/create">Create Group</a>
                  </Button>
                </div>
              )}
              {offlineCatalog.map((pkg) => {
                const gradient = regionColors[pkg.region] || 'from-gray-500 to-gray-600';
                const isDownloaded = allPackages.some(p => p.id === pkg.id && p.status === "downloaded");
                
                return (
                  <div 
                    key={pkg.id} 
                    className={`flex items-center justify-between rounded-xl border p-4 text-sm transition-all cursor-pointer ${
                      selectedMap === pkg.id 
                        ? 'border-blue-400 bg-blue-50 shadow-md' 
                        : 'border-white/50 bg-white/50 hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedMap(pkg.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl shadow-lg`}>
                        🗺️
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{pkg.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            📍 {pkg.region}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            💾 {pkg.sizeMB} MB
                          </span>
                        </div>
                      </div>
                    </div>
                    {isDownloaded ? (
                      <Badge variant="success" className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Downloaded
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(pkg);
                        }}
                        disabled={!firstGroup || downloading === pkg.id}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                      >
                        {downloading === pkg.id ? (
                          <>
                            <Loader className="w-3 h-3 mr-1 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
          
          <Card className="border-white/50 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  Installed packages
                </CardTitle>
                {allPackages.length > 0 && (
                  <Badge variant="info">{allPackages.length} installed</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {allPackages.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-6xl mb-4">📥</div>
                  <p className="font-medium mb-2">No packages installed yet</p>
                  <p className="text-sm">Download maps from the recommendations to get started</p>
                </div>
              ) : (
                allPackages.map((pkg) => {
                  const gradient = regionColors[pkg.region] || 'from-gray-500 to-gray-600';
                  
                  return (
                    <div 
                      key={pkg.id} 
                      className="flex items-center justify-between rounded-xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 px-4 py-3 shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md`}>
                          {pkg.status === "downloaded" ? "✓" : pkg.status === "downloading" ? "⏳" : "📦"}
                        </div>
                        <div>
                          <span className="font-medium text-slate-900">{pkg.name}</span>
                          <p className="text-xs text-slate-500">{pkg.region} • {pkg.sizeMB} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            pkg.status === "downloaded" ? "success" : 
                            pkg.status === "downloading" ? "info" : 
                            "default"
                          }
                          className={
                            pkg.status === "downloaded" ? "bg-green-500 text-white" :
                            pkg.status === "downloading" ? "bg-blue-500 text-white" :
                            ""
                          }
                        >
                          {pkg.status === "downloading" && <Loader className="w-3 h-3 mr-1 animate-spin" />}
                          {pkg.status}
                        </Badge>
                        {pkg.status === "downloaded" && (
                          <button
                            onClick={() => handleDelete(pkg)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {allPackages.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Total storage used:</span>
                    <span className="font-bold text-blue-600">{totalDownloadedSize} MB</span>
                  </div>
                  <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${Math.min((totalDownloadedSize / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Available: {2000 - totalDownloadedSize} MB of 2 GB</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="border-white/50 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-xl">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">🛰️</div>
                <h3 className="font-bold text-slate-900 mb-1">Offline Navigation</h3>
                <p className="text-sm text-slate-600">Works without internet using GPS and cached tiles</p>
              </div>
              <div>
                <div className="text-4xl mb-2">🔄</div>
                <h3 className="font-bold text-slate-900 mb-1">Auto-sync</h3>
                <p className="text-sm text-slate-600">Updates automatically when connected to WiFi</p>
              </div>
              <div>
                <div className="text-4xl mb-2">🗺️</div>
                <h3 className="font-bold text-slate-900 mb-1">OpenStreetMap</h3>
                <p className="text-sm text-slate-600">High-quality, community-maintained maps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
