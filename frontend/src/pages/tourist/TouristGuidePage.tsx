import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getTouristMetadata, getTouristRecommendations, planTouristTrip } from '../../services/api';
import { TouristDestination } from '../../types';
import {
  Compass,
  MapPin,
  Sparkles,
  Landmark,
  Waves,
  Trees,
  Palette,
  Star,
  Clock,
  Calendar,
  Ticket,
  Navigation,
  CheckCircle2,
  Plus,
  Trash2,
  Route,
  ChevronRight,
  TrendingUp,
  Heart,
  Share2,
  Filter,
} from 'lucide-react';

const VIBE_ICONS: Record<string, React.ElementType> = {
  all: Sparkles,
  ancient: Landmark,
  playful: Waves,
  nature: Trees,
  creative: Palette,
};

const VIBE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ancient: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  playful: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  nature: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  creative: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  all: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
};

export const TouristGuidePage: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedVibe, setSelectedVibe] = useState<string>('all');
  const [originDistrict, setOriginDistrict] = useState<string>('chennai');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [itineraryIds, setItineraryIds] = useState<string[]>([]);
  const [showItineraryModal, setShowItineraryModal] = useState<boolean>(false);

  // 1. Fetch Metadata (Districts, Vibes, Coordinates)
  const { data: metaData } = useQuery({
    queryKey: ['touristMetadata'],
    queryFn: async () => {
      const res = await getTouristMetadata();
      return res.data.data;
    },
  });

  // 2. Fetch Ranked Recommendations
  const { data: recData, isLoading: isRecLoading } = useQuery({
    queryKey: ['touristRecommendations', selectedDistrict, selectedVibe, originDistrict, sortBy],
    queryFn: async () => {
      const res = await getTouristRecommendations({
        district: selectedDistrict,
        vibe: selectedVibe,
        origin_district: originDistrict,
        sort_by: sortBy,
      });
      return res.data.data;
    },
  });

  // 3. Trip Planner Mutation
  const tripPlanMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await planTouristTrip(ids);
      return res.data.data;
    },
  });

  const toggleItinerary = (destId: string) => {
    setItineraryIds((prev) =>
      prev.includes(destId) ? prev.filter((id) => id !== destId) : [...prev, destId]
    );
  };

  const handlePlanTrip = () => {
    if (itineraryIds.length === 0) return;
    tripPlanMutation.mutate(itineraryIds);
    setShowItineraryModal(true);
  };

  // Filter by search term
  const destinations = (recData?.destinations || []).filter((d) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      d.destination_name.toLowerCase().includes(term) ||
      d.city.toLowerCase().includes(term) ||
      d.district.toLowerCase().includes(term) ||
      d.famous_for.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#112E3B] to-[#0A3A40] text-white p-8 md:p-10 shadow-2xl border border-teal-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Compass className="w-3.5 h-3.5 text-teal-400 animate-spin-slow" />
            <span>Tamil Nadu Smart Tourist Portal & Recommendation Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading tracking-tight text-white">
            Discover the Best of Tamil Nadu
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Find ancient UNESCO temples, playful coastal beaches, misty hill stations, and cultural gems. 
            Ranked using real traveler sentiment, VADER text mining, and distance calculations from your location.
          </p>

          {/* Quick Stats Banner */}
          <div className="pt-2 flex flex-wrap gap-6 text-xs text-slate-300">
            <div>
              <span className="font-bold text-teal-400 text-base block">20</span>
              <span>Curated Hubs</span>
            </div>
            <div>
              <span className="font-bold text-teal-400 text-base block">100%</span>
              <span>VADER Sentiment Scored</span>
            </div>
            <div>
              <span className="font-bold text-teal-400 text-base block">15</span>
              <span>Tamil Nadu Districts</span>
            </div>
            <div>
              <span className="font-bold text-teal-400 text-base block">Real-Time</span>
              <span>Haversine Distance Math</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Location & Travel Vibe Filters */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Step 1: Where are you starting from? */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 1: Your Current Starting Location (Origin City)
              </h2>
            </div>
            <span className="text-xs text-slate-500">Calculates driving distance to all attractions</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'chennai', name: 'Chennai Central' },
              { id: 'madurai', name: 'Madurai' },
              { id: 'coimbatore', name: 'Coimbatore' },
              { id: 'nilgiris', name: 'Ooty / Nilgiris' },
              { id: 'thanjavur', name: 'Thanjavur' },
              { id: 'kanyakumari', name: 'Kanyakumari' },
              { id: 'ramanathapuram', name: 'Rameswaram' },
              { id: 'salem', name: 'Salem / Yercaud' },
            ].map((city) => (
              <button
                key={city.id}
                onClick={() => setOriginDistrict(city.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  originDistrict === city.id
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 border-teal-600'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                📍 {city.name}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Step 2: What Travel Vibe are you seeking? */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 2: Choose Your Travel Vibe / Mood
              </h2>
            </div>
            <span className="text-xs text-slate-500">Mined from visitor review themes</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(metaData?.vibes || []).map((vibe) => {
              const IconComp = VIBE_ICONS[vibe.id] || Sparkles;
              const isSelected = selectedVibe === vibe.id;
              return (
                <button
                  key={vibe.id}
                  onClick={() => setSelectedVibe(vibe.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {vibe.badge}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{vibe.label}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {vibe.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Step 3: Search & Sort Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by destination name, city, temple, beach, or keyword..."
              className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="recommended">⭐ AI Recommended (Overall Score)</option>
              <option value="rating">★ Highest Visitor Rating</option>
              <option value="sentiment">💬 Best Traveler Sentiment %</option>
              <option value="distance">📍 Shortest Distance from You</option>
              <option value="footfall">👥 Most Popular (Footfall)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Itinerary Action Bar */}
      {itineraryIds.length > 0 && (
        <div className="sticky top-24 z-20 p-4 bg-teal-900 text-white rounded-2xl shadow-xl flex items-center justify-between border border-teal-700 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
              {itineraryIds.length}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">Day Trip Itinerary Selected</p>
              <p className="text-xs text-slate-200">
                {itineraryIds.length} stop{itineraryIds.length > 1 ? 's' : ''} added to your travel plan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setItineraryIds([])}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10"
            >
              Clear
            </button>
            <button
              onClick={handlePlanTrip}
              className="px-4 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-400/20 transition-all"
            >
              <Route className="w-4 h-4" />
              <span>Calculate Tour Route & Distance</span>
            </button>
          </div>
        </div>
      )}

      {/* Destinations Recommendation Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900">
              Recommended Destinations in Tamil Nadu
            </h2>
            <p className="text-xs text-slate-500">
              Showing {destinations.length} places matching your criteria &bull; Distance from{' '}
              <span className="font-semibold text-slate-700 capitalize">{originDistrict}</span>
            </p>
          </div>
        </div>

        {isRecLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No destinations found matching your filters</h3>
            <p className="text-xs text-slate-400 mt-1">Try selecting "All Experiences" or choosing a different city.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => {
              const isAdded = itineraryIds.includes(dest.destination_id);
              const vibeStyle = VIBE_COLORS[dest.travel_vibe] || VIBE_COLORS.all;

              return (
                <div
                  key={dest.destination_id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${vibeStyle.bg} ${vibeStyle.text} ${vibeStyle.border}`}
                        >
                          {dest.travel_vibe}
                        </span>
                        {dest.is_must_visit && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Must Visit
                          </span>
                        )}
                      </div>

                      {dest.distance_km !== null && (
                        <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          {dest.distance_km === 0 ? '📍 Current Hub' : `${dest.distance_km} km`}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                      {dest.destination_name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dest.city}, {dest.district}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-400 font-medium">{dest.tourism_category}</span>
                    </p>

                    {/* Ratings & Sentiment Scores */}
                    <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800">{dest.average_rating}</span>
                        <span className="text-[10px] text-slate-400">/ 5.0</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Visitor Sentiment:</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          {dest.positive_sentiment_pct}% Positive
                        </span>
                      </div>
                    </div>

                    {/* What It's Famous For */}
                    <div className="mt-3.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-slate-700">
                      <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" /> What It's Famous For:
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">
                        {dest.famous_for}
                      </p>
                    </div>

                    {/* Telemetry Details */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate" title={dest.best_time_to_visit}>
                          {dest.best_time_to_visit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dest.typical_dwell_time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Add to Itinerary */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">
                      Entry: <strong className="text-slate-800">{dest.entry_fee}</strong>
                    </span>
                    <button
                      onClick={() => toggleItinerary(dest.destination_id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isAdded
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Added to Tour
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-teal-600" /> Add to Trip
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trip Itinerary Modal */}
      {showItineraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Your Tamil Nadu Day Tour Route
                </h3>
              </div>
              <button
                onClick={() => setShowItineraryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {tripPlanMutation.isPending ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Calculating optimal Haversine travel corridor...
              </div>
            ) : tripPlanMutation.data ? (
              <div className="space-y-4">
                {/* Summary Banner */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Total Distance</p>
                    <p className="text-xl font-bold font-mono mt-0.5">
                      {tripPlanMutation.data.total_distance_km} km
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Est. Drive Time</p>
                    <p className="text-xl font-bold font-mono mt-0.5">
                      {tripPlanMutation.data.total_est_drive_hours} hrs
                    </p>
                  </div>
                </div>

                {/* Stops Timeline */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sequential Route</p>
                  {tripPlanMutation.data.stops.map((stop, i) => (
                    <div key={stop.destination_id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {stop.step}
                      </div>
                      <div className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <p className="font-bold text-slate-900">{stop.destination_name}</p>
                        <p className="text-[11px] text-slate-500">
                          {stop.city}, {stop.district} &bull; Stay: {stop.typical_dwell_time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setShowItineraryModal(false)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
                  >
                    Done Planning
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-500">Unable to calculate route.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
