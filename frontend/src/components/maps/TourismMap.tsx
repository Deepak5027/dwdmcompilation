import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TAMIL_NADU_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';
import { SpatialDestination } from '../../types';
import { formatCompactNumber, formatRating } from '../../utils/format';
import { MapPin, Navigation, Layers, Compass } from 'lucide-react';

// Fix Leaflet standard marker icon paths in Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface TourismMapProps {
  destinations: SpatialDestination[];
  selectedDestinationId?: string;
  onSelectDestination?: (id: string) => void;
  height?: string;
  showHeatmap?: boolean;
}

// Controller to smoothly pan to selected destination
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 9, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export const TourismMap: React.FC<TourismMapProps> = ({
  destinations,
  selectedDestinationId,
  onSelectDestination,
  height = '500px',
  showHeatmap = false,
}) => {
  const [mapMode, setMapMode] = useState<'standard' | 'density'>('standard');

  const selectedPoint = destinations.find((d) => d.destination_id === selectedDestinationId);
  const activeCenter: [number, number] = selectedPoint
    ? [selectedPoint.latitude, selectedPoint.longitude]
    : TAMIL_NADU_CENTER;

  // Custom marker icon creation with dynamic category badges
  const createCustomIcon = (category: string) => {
    let color = '#0D9488'; // teal default
    if (category.toLowerCase().includes('temple')) color = '#F59E0B'; // amber
    if (category.toLowerCase().includes('hill')) color = '#10B981'; // emerald
    if (category.toLowerCase().includes('beach')) color = '#0284C7'; // sky
    if (category.toLowerCase().includes('heritage')) color = '#4338CA'; // indigo

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm">
      {/* Map Control Toolbar Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 p-1.5 flex items-center gap-1 text-xs">
        <button
          onClick={() => setMapMode('standard')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            mapMode === 'standard' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Destinations
        </button>
        <button
          onClick={() => setMapMode('density')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            mapMode === 'density' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Density Radii
        </button>
      </div>

      <MapContainer
        center={TAMIL_NADU_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedPoint && <MapController center={activeCenter} />}

        {destinations.map((d) => {
          if (mapMode === 'density' || showHeatmap) {
            const radius = Math.min(30, Math.max(10, (d.visitor_count / 50000) * 25));
            return (
              <CircleMarker
                key={d.destination_id}
                center={[d.latitude, d.longitude]}
                radius={radius}
                pathOptions={{
                  fillColor: d.visitor_count > 35000 ? '#EF4444' : '#0D9488',
                  fillOpacity: 0.45,
                  stroke: true,
                  color: d.visitor_count > 35000 ? '#DC2626' : '#0F766E',
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="p-2 font-sans">
                    <h4 className="font-bold text-xs text-slate-900">{d.destination_name}</h4>
                    <p className="text-[11px] text-slate-500">{d.district} &bull; {d.tourism_category}</p>
                    <p className="text-xs font-semibold text-teal-700 mt-1">
                      {formatCompactNumber(d.visitor_count)} Annual Visitors
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }

          return (
            <Marker
              key={d.destination_id}
              position={[d.latitude, d.longitude]}
              icon={createCustomIcon(d.tourism_category)}
              eventHandlers={{
                click: () => onSelectDestination && onSelectDestination(d.destination_id),
              }}
            >
              <Popup>
                <div className="p-3 font-sans max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      {d.tourism_category}
                    </span>
                    <span className="text-xs font-bold text-amber-500">
                      ★ {formatRating(d.average_rating)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight mb-0.5">{d.destination_name}</h4>
                  <p className="text-[11px] text-slate-500 mb-2">{d.district}, Tamil Nadu</p>
                  
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Monthly Footfall</span>
                    <span className="font-bold text-slate-800">{formatCompactNumber(d.visitor_count)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1">
                    <span className="text-slate-400">Cluster Cohort</span>
                    <span className="font-semibold text-indigo-600">{d.cluster_label || 'Cluster 1'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

