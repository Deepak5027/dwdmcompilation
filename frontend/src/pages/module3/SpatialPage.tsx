import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSpatialDestinations, getHotspots, calculateDistance } from '../../services/api';
import { DataCard } from '../../components/cards/DataCard';
import { TourismMap } from '../../components/maps/TourismMap';
import { DataTable } from '../../components/tables/DataTable';
import { formatCompactNumber, formatRating } from '../../utils/format';
import { SpatialDestination, TableColumn } from '../../types';
import { Map, Navigation, Compass, MapPin, ArrowRight, ShieldCheck, Layers } from 'lucide-react';

export const SpatialPage: React.FC = () => {
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | undefined>(undefined);
  const [originId, setOriginId] = useState('TN-CHE-01');
  const [destinationId, setDestinationId] = useState('TN-MAM-01');
  const [distanceResult, setDistanceResult] = useState<{ origin: string; destination: string; distance_km: number } | null>(null);

  // Fetch Spatial Destinations
  const { data: destinationsData, isLoading: isDestLoading } = useQuery({
    queryKey: ['spatialDestinations'],
    queryFn: async () => {
      const res = await getSpatialDestinations();
      return res.data.data;
    },
  });

  // Fetch Hotspots
  const { data: hotspotsData } = useQuery({
    queryKey: ['spatialHotspots'],
    queryFn: async () => {
      const res = await getHotspots();
      return res.data.data;
    },
  });

  // Distance Mutation
  const distanceMutation = useMutation({
    mutationFn: async () => {
      const res = await calculateDistance(originId, destinationId);
      return res.data.data;
    },
    onSuccess: (data) => {
      setDistanceResult(data);
    },
  });

  const columns: TableColumn<SpatialDestination>[] = [
    {
      key: 'destination_name',
      label: 'Destination Name',
      render: (val, row) => (
        <div
          onClick={() => setSelectedDestinationId(row.destination_id)}
          className="cursor-pointer group"
        >
          <span className="font-bold text-slate-800 text-xs group-hover:text-teal-600 transition-colors">
            {String(val)}
          </span>
          <span className="text-[11px] text-slate-400 block">{row.district} &bull; {row.tourism_category}</span>
        </div>
      ),
    },
    {
      key: 'coordinates',
      label: 'Geographic Coordinates',
      render: (_, row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.latitude.toFixed(4)}°N, {row.longitude.toFixed(4)}°E
        </span>
      ),
    },
    {
      key: 'visitor_count',
      label: 'Annual Footfall',
      render: (val) => (
        <span className="font-bold text-slate-700 text-xs font-mono">
          {formatCompactNumber(Number(val))}
        </span>
      ),
    },
    {
      key: 'average_rating',
      label: 'Rating',
      render: (val) => (
        <span className="text-xs font-bold text-amber-600">
          ★ {formatRating(Number(val))}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Title */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Map className="w-3.5 h-3.5 text-teal-600" />
            <span>Module 3 &bull; Spatial Tourism Analytics</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Demonstration Spatial Coordinates
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Spatial Tourism Analytics & Geographic Hotspots
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Demonstration Tamil Nadu destination coordinates, density heatmap radius overlays, regional hotspot corridors, and Haversine geodesic distance matrices computed from MySQL warehouse records.
        </p>
      </div>

      {/* Main Interactive Map */}
      <DataCard
        title="Interactive Tamil Nadu Tourism Map"
        subtitle="Click any destination node to inspect telemetry or toggle density radius overlays"
      >
        <TourismMap
          destinations={destinationsData || []}
          selectedDestinationId={selectedDestinationId}
          onSelectDestination={(id) => setSelectedDestinationId(id)}
          height="520px"
        />
      </DataCard>

      {/* Distance Calculator & Hotspot Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Haversine Geodesic Distance Matrix Tool */}
        <div className="lg:col-span-1">
          <DataCard
            title="Haversine Geodesic Distance Tool"
            subtitle="Calculates great-circle distance accounting for Earth curvature"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Origin Destination</label>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  {destinationsData?.map((d) => (
                    <option key={d.destination_id} value={d.destination_id}>
                      {d.destination_name} ({d.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Destination Target</label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  {destinationsData?.map((d) => (
                    <option key={d.destination_id} value={d.destination_id}>
                      {d.destination_name} ({d.district})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => distanceMutation.mutate()}
                disabled={distanceMutation.isPending || originId === destinationId}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50 mt-2"
              >
                {distanceMutation.isPending ? 'Computing Geodesic...' : 'Calculate Distance'}
              </button>

              {distanceResult && (
                <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-200 text-center animate-in fade-in">
                  <span className="text-[10px] font-bold text-teal-700 uppercase">Geodesic Distance</span>
                  <p className="text-2xl font-bold font-heading text-teal-900 mt-1">
                    {distanceResult.distance_km} <span className="text-sm font-medium">km</span>
                  </p>
                  <p className="text-[11px] text-teal-700 mt-1">
                    {distanceResult.origin} &rarr; {distanceResult.destination}
                  </p>
                </div>
              )}
            </div>
          </DataCard>
        </div>

        {/* Regional Hotspot Corridors */}
        <div className="lg:col-span-2">
          <DataCard
            title="Regional Tourism Hotspot Corridors"
            subtitle="Aggregated footfall concentrations and spatial density hierarchy"
          >
            <div className="space-y-3">
              {hotspotsData?.slice(0, 5).map((h) => (
                <div
                  key={h.hotspot_id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-400 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-xs">
                      #{h.hotspot_id}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 font-heading">{h.district} Corridor</h4>
                      <p className="text-[11px] text-slate-500">
                        {h.destinations_included.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 font-heading block">
                      {formatCompactNumber(h.total_footfall)} Footfall
                    </span>
                    <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      {h.density_rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      </div>

      {/* Destinations Spatial Telemetry Table */}
      <DataCard
        title="Verified Destination Geographic Registry"
        subtitle="Complete catalog of monitored tourism destinations with real coordinates"
      >
        <DataTable
          columns={columns}
          data={destinationsData || []}
          pageSize={8}
          searchPlaceholder="Search destinations or districts..."
        />
      </DataCard>
    </div>
  );
};

