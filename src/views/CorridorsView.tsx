import React, { useState, useEffect, useMemo } from 'react';
import { useNetra } from '../context/NetraContext';
import { CorridorMap } from '../components/CorridorMap';
import { LiveCorridorIntelligencePanel } from '../components/LiveCorridorIntelligencePanel';
import { INDIAN_CITY_HUBS, calculateMultiStopRoadRoute } from '../data/initialData';
import { CityHub } from '../types/netra';
import {
  MapPin,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Navigation,
  Search,
  RotateCcw,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Layers,
  RefreshCw,
} from 'lucide-react';

export const CorridorsView: React.FC = () => {
  const {
    corridors,
    shipments,
    vehicles,
    settings,
    selectedCorridorId,
    setSelectedCorridorId,
    setSelectedShipmentId,
    setSelectedVehicleId,
    rerouteShipmentToBypass,
    setActiveTab,
    logActivity,
  } = useNetra();

  const [routeStops, setRouteStops] = useState<CityHub[]>([
    INDIAN_CITY_HUBS.find((h) => h.name === 'Delhi')!,
    INDIAN_CITY_HUBS.find((h) => h.name === 'Jaipur')!,
    INDIAN_CITY_HUBS.find((h) => h.name === 'Ahmedabad')!,
    INDIAN_CITY_HUBS.find((h) => h.name === 'Mumbai')!,
  ]);

  const [locationQuery, setLocationQuery] = useState('');
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const [geoSuggestions, setGeoSuggestions] = useState<CityHub[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | undefined>(undefined);
  const [routeStats, setRouteStats] = useState<{
    distanceKm: number;
    durationHours: number;
    source: 'OSRM_LIVE' | 'CACHED_HIGHWAY_NETWORK';
    calculatedAt: string;
  }>({
    distanceKm: 1415,
    durationHours: 29.8,
    source: 'CACHED_HIGHWAY_NETWORK',
    calculatedAt: 'Baseline Loaded',
  });
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [viewMode, setViewMode] = useState<'ALL_CORRIDORS' | 'MULTI_STOP_ROUTER'>('MULTI_STOP_ROUTER');
  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState<boolean>(true);
  const [activeRouteOptionId, setActiveRouteOptionId] = useState<
    'OPT-FAST' | 'OPT-SAFE' | 'OPT-BALANCED'
  >('OPT-SAFE');

  useEffect(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) {
      setGeoSuggestions(INDIAN_CITY_HUBS.slice(0, 8));
      return;
    }
    const localMatches = INDIAN_CITY_HUBS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.hubCode.toLowerCase().includes(q)
    );
    setGeoSuggestions(localMatches);
  }, [locationQuery]);

  const handleGeocodeCustomCity = async () => {
    if (!locationQuery.trim()) return;
    setIsSearchingGeo(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationQuery + ', India'
        )}&limit=4`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CityHub[] = data.map((item: any, idx: number) => ({
            name: String(item.display_name).split(',')[0].trim(),
            state: String(item.display_name).split(',')[1]?.trim() || 'India',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            hubCode: `GEO-0${idx + 1}`,
          }));
          setGeoSuggestions(mapped);
        }
      }
    } catch (_e) {
      // Keep local suggestions if offline
    } finally {
      setIsSearchingGeo(false);
    }
  };

  const runMultiStopCalculation = async (stopsToCalc = routeStops) => {
    if (stopsToCalc.length < 2) return;
    setIsCalculatingRoute(true);
    try {
      const res = await calculateMultiStopRoadRoute(stopsToCalc);
      setRouteGeometry(res.geometry);
      setRouteStats({
        distanceKm: res.distanceKm,
        durationHours: res.durationHours,
        source: res.source,
        calculatedAt: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      setViewMode('MULTI_STOP_ROUTER');
      logActivity(
        'ROUTE',
        `Calculated multi-location route: ${stopsToCalc.map((s) => s.name).join(' → ')} (${res.distanceKm} km, ${res.durationHours} hrs via ${res.source}).`,
        selectedCorridorId
      );
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  useEffect(() => {
    runMultiStopCalculation(routeStops);
  }, []);

  // Direct Origin & Destination selection handlers (Requirement 3)
  const handleSelectOrigin = (cityName: string) => {
    const hub = INDIAN_CITY_HUBS.find((h) => h.name === cityName);
    if (!hub) return;
    const next = [hub, ...routeStops.slice(1).filter((s) => s.name !== hub.name)];
    if (next.length < 2) {
      const fallbackDest =
        INDIAN_CITY_HUBS.find((h) => h.name !== hub.name) || INDIAN_CITY_HUBS[1];
      next.push(fallbackDest);
    }
    setRouteStops(next);
    runMultiStopCalculation(next);
  };

  const handleSelectDestination = (cityName: string) => {
    const hub = INDIAN_CITY_HUBS.find((h) => h.name === cityName);
    if (!hub) return;
    const withoutLast = routeStops.slice(0, -1).filter((s) => s.name !== hub.name);
    const next =
      withoutLast.length > 0
        ? [...withoutLast, hub]
        : [INDIAN_CITY_HUBS.find((h) => h.name !== hub.name) || INDIAN_CITY_HUBS[0], hub];
    setRouteStops(next);
    runMultiStopCalculation(next);
  };

  const handleAddStopHub = (hub: CityHub) => {
    if (routeStops.some((s) => s.name === hub.name)) return;
    if (routeStops.length >= 2) {
      const next = [
        ...routeStops.slice(0, routeStops.length - 1),
        hub,
        routeStops[routeStops.length - 1],
      ];
      setRouteStops(next);
    } else {
      setRouteStops([...routeStops, hub]);
    }
    setLocationQuery('');
  };

  const handleRemoveStopIndex = (idx: number) => {
    if (routeStops.length <= 2) return;
    const next = routeStops.filter((_, i) => i !== idx);
    setRouteStops(next);
  };

  const handleMoveStop = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= routeStops.length) return;
    const copy = [...routeStops];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setRouteStops(copy);
  };

  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0];

  const matchedCorridor =
    corridors.find(
      (c) =>
        routeStops[0]?.name.toLowerCase() === c.origin.toLowerCase() &&
        routeStops[routeStops.length - 1]?.name.toLowerCase() === c.destination.toLowerCase()
    ) ||
    corridors.find(
      (c) =>
        routeStops.some((s) => s.name.toLowerCase() === c.origin.toLowerCase()) &&
        routeStops.some((s) => s.name.toLowerCase() === c.destination.toLowerCase())
    ) ||
    selectedCorridor;

  const routeRiskScore = matchedCorridor.riskScore;
  const fuelConsumptionLiters = +(routeStats.distanceKm / settings.defaultFuelEfficiency).toFixed(1);
  const estimatedFuelCostINR = Math.round(fuelConsumptionLiters * settings.fuelPricePerLiter);
  const estimatedCO2Kg = Math.round(fuelConsumptionLiters * settings.co2FactorKgPerLiter);

  const etaDate = new Date(Date.now() + routeStats.durationHours * 3600 * 1000);
  const etaFormatted = etaDate.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Alternative Route Comparison Options for Selected Corridor (Requirement 9)
  const alternativeRoutesComparison = useMemo(() => {
    const baseDist = selectedCorridor.distanceKm;
    const baseHrs = selectedCorridor.baselineHours;
    const delayHrs = selectedCorridor.estimatedDelayHours;

    return [
      {
        id: 'OPT-FAST' as const,
        label: `Primary Highway (${selectedCorridor.highway.split(' ')[0]})`,
        pathDesc: `${selectedCorridor.origin} → Direct Trunk Highway → ${selectedCorridor.destination}`,
        distanceKm: baseDist,
        effectiveHours: +(baseHrs + delayHrs).toFixed(1),
        addedDelayHours: delayHrs,
        riskScore: selectedCorridor.riskScore,
        fuelCostINR: Math.round((baseDist / settings.defaultFuelEfficiency) * settings.fuelPricePerLiter),
        recommendation:
          selectedCorridor.riskScore >= 70
            ? 'High Disruption Risk — Not Recommended for Critical SLA'
            : 'Nominal Primary Corridor',
      },
      {
        id: 'OPT-SAFE' as const,
        label: 'Lowest-Risk Bypass Route (NH52 / Secondary National Bypass)',
        pathDesc: `${selectedCorridor.origin} → Bypass Connector → ${selectedCorridor.destination}`,
        distanceKm: Math.round(baseDist * 1.09),
        effectiveHours: +(baseHrs * 1.09 + delayHrs * 0.12).toFixed(1),
        addedDelayHours: +(delayHrs * 0.12).toFixed(1),
        riskScore: Math.max(22, Math.min(34, Math.round(selectedCorridor.riskScore * 0.4))),
        fuelCostINR: Math.round(
          ((baseDist * 1.09) / settings.defaultFuelEfficiency) * settings.fuelPricePerLiter
        ),
        recommendation: 'Recommended for Critical & Cold-Chain Consignments',
      },
      {
        id: 'OPT-BALANCED' as const,
        label: 'Balanced Hybrid Connector',
        pathDesc: `${selectedCorridor.origin} → Midpoint Express Feeder → ${selectedCorridor.destination}`,
        distanceKm: Math.round(baseDist * 1.04),
        effectiveHours: +(baseHrs * 1.04 + delayHrs * 0.28).toFixed(1),
        addedDelayHours: +(delayHrs * 0.28).toFixed(1),
        riskScore: Math.max(28, Math.round(selectedCorridor.riskScore * 0.54)),
        fuelCostINR: Math.round(
          ((baseDist * 1.04) / settings.defaultFuelEfficiency) * settings.fuelPricePerLiter
        ),
        recommendation: 'Recommended for High / Medium Priority Freight',
      },
    ];
  }, [selectedCorridor, settings]);

  // Affected Shipments & Vehicles on the selected corridor (Requirement 8)
  const corridorShipments = shipments.filter(
    (s) => s.corridorId === selectedCorridor.id && s.status !== 'Delivered'
  );
  const corridorVehicles = vehicles.filter((v) => v.corridorId === selectedCorridor.id);
  const disruptedCorridors = corridors.filter((c) => c.riskScore >= settings.riskAlertThreshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B]">
            Geospatial Corridor Intelligence · OpenStreetMap & OSRM Road-Network Routing
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
            National Freight Corridors, Multi-Stop Route Planner & Alternative Route Comparison
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded border border-[#E2E8F0]">
            <button
              onClick={() => setViewMode('MULTI_STOP_ROUTER')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'MULTI_STOP_ROUTER'
                  ? 'bg-[#52677D] text-white'
                  : 'text-[#64748B] hover:text-[#1F2937]'
              }`}
            >
              Multi-Stop Route Builder
            </button>
            <button
              onClick={() => setViewMode('ALL_CORRIDORS')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'ALL_CORRIDORS'
                  ? 'bg-[#52677D] text-white'
                  : 'text-[#64748B] hover:text-[#1F2937]'
              }`}
            >
              All 8 Corridors & Bypass Overlay
            </button>
          </div>
        </div>
      </div>

      {/* Disrupted Corridors Highlight Bar (Requirement 7) */}
      {disruptedCorridors.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-md px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#B85C5C]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <b>Disrupted High-Risk Corridors Highlighted ({disruptedCorridors.length}):</b>{' '}
              {disruptedCorridors
                .map((c) => `${c.name} (${c.highway.split(' ')[0]} · Risk ${c.riskScore}/100 · +${c.estimatedDelayHours}h delay)`)
                .join(' | ')}
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedCorridorId(disruptedCorridors[0].id);
              setViewMode('ALL_CORRIDORS');
              setShowAlternativeRoutes(true);
            }}
            className="px-2.5 py-1 bg-[#B85C5C] text-white font-semibold rounded shrink-0 cursor-pointer"
          >
            Inspect Disrupted Corridor & Bypasses
          </button>
        </div>
      )}

      {/* Main Split: Left 4 cols (Origin/Dest + Multi-Stop Planner) | Right 8 cols (Interactive Map + Route Telemetry) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-4 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div>
                <h2 className="text-sm font-semibold text-[#1F2937]">
                  Origin, Destination & Multi-Stop Planner
                </h2>
                <p className="text-xs text-[#64748B]">
                  Select endpoints or insert intermediate hubs
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const defaultStops = [
                    INDIAN_CITY_HUBS.find((h) => h.name === 'Delhi')!,
                    INDIAN_CITY_HUBS.find((h) => h.name === 'Jaipur')!,
                    INDIAN_CITY_HUBS.find((h) => h.name === 'Ahmedabad')!,
                    INDIAN_CITY_HUBS.find((h) => h.name === 'Mumbai')!,
                  ];
                  setRouteStops(defaultStops);
                  runMultiStopCalculation(defaultStops);
                }}
                className="text-xs text-[#52677D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Default
              </button>
            </div>

            {/* Direct Origin & Destination Dropdown Selectors (Requirement 3) */}
            <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                  Origin Terminal
                </label>
                <select
                  value={routeStops[0]?.name || 'Delhi'}
                  onChange={(e) => handleSelectOrigin(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded text-[#1F2937]"
                >
                  {INDIAN_CITY_HUBS.map((h) => (
                    <option key={`orig-${h.hubCode}`} value={h.name}>
                      {h.name} ({h.state})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                  Destination Terminal
                </label>
                <select
                  value={routeStops[routeStops.length - 1]?.name || 'Mumbai'}
                  onChange={(e) => handleSelectDestination(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded text-[#1F2937]"
                >
                  {INDIAN_CITY_HUBS.map((h) => (
                    <option key={`dest-${h.hubCode}`} value={h.name}>
                      {h.name} ({h.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ordered Stop Sequence */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {routeStops.map((stop, idx) => {
                const isOrigin = idx === 0;
                const isDest = idx === routeStops.length - 1;
                return (
                  <div
                    key={`${stop.name}-${idx}`}
                    className="flex items-center justify-between gap-2 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${
                          isOrigin ? 'bg-[#111827]' : isDest ? 'bg-[#54846B]' : 'bg-[#52677D]'
                        }`}
                      >
                        {isOrigin ? 'O' : isDest ? 'D' : idx}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-[#1F2937] truncate">
                          {stop.name}{' '}
                          <span className="font-normal text-[#64748B]">({stop.state})</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#64748B]">
                          {isOrigin
                            ? 'Origin Pickup Hub'
                            : isDest
                            ? 'Final Delivery Hub'
                            : `Intermediate Stop ${idx}`}{' '}
                          · {stop.lat.toFixed(2)}°N, {stop.lng.toFixed(2)}°E
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveStop(idx, -1)}
                        disabled={idx === 0}
                        title="Move Stop Up"
                        className="p-1 text-[#64748B] hover:text-[#1F2937] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStop(idx, 1)}
                        disabled={idx === routeStops.length - 1}
                        title="Move Stop Down"
                        className="p-1 text-[#64748B] hover:text-[#1F2937] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStopIndex(idx)}
                        disabled={routeStops.length <= 2}
                        title="Remove Stop"
                        className="p-1 text-[#64748B] hover:text-[#B85C5C] disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Search & Add Intermediate Stop */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2.5">
              <label className="block text-xs font-medium text-[#1F2937]">
                Add Intermediate Waypoint (32 Indian Hubs + OSM Geocoder)
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Search city (e.g. Udaipur, Surat, Kota, Nagpur)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded text-[#1F2937]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGeocodeCustomCity}
                  disabled={isSearchingGeo}
                  className="px-2.5 py-1.5 text-xs font-medium bg-white border border-[#E2E8F0] rounded hover:bg-[#F1F5F9] text-[#1F2937] whitespace-nowrap cursor-pointer"
                >
                  {isSearchingGeo ? '...' : 'Geocode'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                {geoSuggestions.map((hub) => {
                  const alreadyAdded = routeStops.some((s) => s.name === hub.name);
                  return (
                    <button
                      key={`${hub.hubCode}-${hub.name}`}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddStopHub(hub)}
                      className={`px-2 py-1 text-[11px] rounded border flex items-center gap-1 transition-colors cursor-pointer ${
                        alreadyAdded
                          ? 'bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0] opacity-60 cursor-not-allowed'
                          : 'bg-white hover:bg-[#52677D] hover:text-white text-[#1F2937] border-[#E2E8F0]'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {hub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => runMultiStopCalculation(routeStops)}
              disabled={isCalculatingRoute}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isCalculatingRoute ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Calculating OSRM Road Geometry...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  Calculate Multi-Stop Route ({routeStops.length} Stops)
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('optimization')}
              className="w-full py-2 px-4 text-xs font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#52677D]" />
              Open Full Fleet Route Optimizer →
            </button>
          </div>
        </div>

        {/* Right 8 cols: Interactive Map + OSRM Status + 8 Route Metrics */}
        <div className="xl:col-span-8 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#1F2937]">
                {viewMode === 'MULTI_STOP_ROUTER'
                  ? `Active Road Route: ${routeStops.map((s) => s.name).join(' → ')}`
                  : `Corridor & Alternative Route Comparison: ${selectedCorridor.name} (${selectedCorridor.highway})`}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                <span>
                  Geometry Source:{' '}
                  <b className="font-mono text-[#1F2937]">
                    {routeStats.source === 'OSRM_LIVE'
                      ? 'OSRM Live Road-Network Service (Actual Highway Geometry)'
                      : 'Cached Multi-Waypoint Highway Road Geometry (NH48/NH19/NH44)'}
                  </b>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setViewMode('ALL_CORRIDORS');
                  setShowAlternativeRoutes((prev) => !prev);
                }}
                className={`px-2.5 py-1.5 text-xs font-medium rounded border flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'ALL_CORRIDORS' && showAlternativeRoutes
                    ? 'bg-[#54846B] text-white border-[#54846B]'
                    : 'bg-[#F8FAFC] text-[#1F2937] border-[#E2E8F0]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {viewMode === 'ALL_CORRIDORS' && showAlternativeRoutes
                  ? 'Bypass Routes Shown ✓'
                  : 'Overlay Bypass Routes'}
              </button>
              {viewMode === 'MULTI_STOP_ROUTER' && (
                <button
                  type="button"
                  onClick={() => setViewMode('ALL_CORRIDORS')}
                  className="px-2.5 py-1.5 text-xs font-medium text-[#52677D] bg-[#F8FAFC] border border-[#E2E8F0] rounded hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Show All 8 Corridors
                </button>
              )}
            </div>
          </div>

          {/* Explicit Cached Routing Notice if external OSRM is unreachable */}
          {routeStats.source === 'CACHED_HIGHWAY_NETWORK' && (
            <div className="px-3 py-2 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[11px] text-[#92400E] flex items-center justify-between gap-2">
              <span>
                <b>Routing Service Notice:</b> Using verified cached multi-waypoint Indian National Highway road-network geometry (straight-line approximation is never used).
              </span>
              <span className="font-mono shrink-0">{routeStats.calculatedAt}</span>
            </div>
          )}

          <div className="relative">
            {isCalculatingRoute && (
              <div className="absolute inset-0 z-30 bg-white/75 flex items-center justify-center rounded-md">
                <div className="px-4 py-2.5 bg-[#111827] text-white text-xs font-mono rounded shadow-md flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Querying OSRM Road-Network Geometry & Waypoints...
                </div>
              </div>
            )}
            <CorridorMap
              heightClass="h-[420px]"
              showAlternativeRoutes={showAlternativeRoutes}
              activeRouteOptionId={activeRouteOptionId}
              customRouteGeometry={viewMode === 'MULTI_STOP_ROUTER' ? routeGeometry : undefined}
              customRouteStops={viewMode === 'MULTI_STOP_ROUTER' ? routeStops : undefined}
            />
          </div>

          {/* 8 Route Calculation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E2E8F0]">
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[11px] text-[#64748B]">1. Total Road Distance</div>
              <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5">
                {routeStats.distanceKm.toLocaleString('en-IN')} km
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[11px] text-[#64748B]">2. Est. Travel Time</div>
              <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5">
                {routeStats.durationHours} hrs
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[11px] text-[#64748B]">3. Number of Stops</div>
              <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5">
                {routeStops.length} hubs ({Math.max(0, routeStops.length - 2)} intermediate)
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[11px] text-[#64748B]">
                4. Est. Fuel ({settings.defaultFuelEfficiency} km/L)
              </div>
              <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5">
                {fuelConsumptionLiters.toLocaleString('en-IN')} L
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[11px] text-[#64748B]">
                5. Est. Fuel Cost (₹{settings.fuelPricePerLiter}/L)
              </div>
              <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5">
                ₹{estimatedFuelCostINR.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[11px] text-[#64748B]">
                6. Est. CO₂ ({settings.co2FactorKgPerLiter} kg/L)
              </div>
              <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5">
                {estimatedCO2Kg.toLocaleString('en-IN')} kg
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[11px] text-[#64748B]">7. Disruption Risk Score</div>
              <div
                className={`text-base font-bold font-mono mt-0.5 ${
                  routeRiskScore >= 70
                    ? 'text-[#B85C5C]'
                    : routeRiskScore >= 35
                    ? 'text-[#B58A45]'
                    : 'text-[#54846B]'
                }`}
              >
                {routeRiskScore}/100
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[11px] text-[#64748B]">8. Estimated Arrival (ETA)</div>
              <div className="text-sm font-bold font-mono text-[#1F2937] mt-0.5 truncate">
                {etaFormatted}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Split: Alternative Route Comparison (6 cols) + Affected Vehicles & Shipments on Selected Corridor (6 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Alternative Route Comparison for Selected Corridor (Requirement 9) */}
        <div className="xl:col-span-6 bg-white border border-[#E2E8F0] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <div className="text-[11px] font-mono text-[#52677D]">
                ALTERNATIVE ROUTE COMPARISON · {selectedCorridor.name.toUpperCase()}
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937]">
                Compare Primary Corridor vs. Available Bypass Routes
              </h3>
            </div>
            <span className="text-xs font-mono text-[#B85C5C] font-semibold">
              Corridor Risk: {selectedCorridor.riskScore}/100
            </span>
          </div>

          <div className="space-y-2.5">
            {alternativeRoutesComparison.map((opt) => {
              const isSelectedOpt = activeRouteOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setActiveRouteOptionId(opt.id);
                    setViewMode('ALL_CORRIDORS');
                    setShowAlternativeRoutes(true);
                  }}
                  className={`p-3 rounded border transition-colors cursor-pointer text-xs ${
                    isSelectedOpt
                      ? 'bg-[#F1F5F9] border-[#52677D]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#1F2937]">{opt.label}</span>
                    <span
                      className={`font-mono font-bold ${
                        opt.riskScore >= 70
                          ? 'text-[#B85C5C]'
                          : opt.riskScore >= 35
                          ? 'text-[#B58A45]'
                          : 'text-[#54846B]'
                      }`}
                    >
                      Risk {opt.riskScore}/100
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">{opt.pathDesc}</div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#E2E8F0] font-mono text-[11px]">
                    <div>Dist: {opt.distanceKm} km</div>
                    <div>
                      ETA: {opt.effectiveHours}h (+{opt.addedDelayHours}h delay)
                    </div>
                    <div>Fuel: ₹{opt.fuelCostINR.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Affected Vehicles & Shipments on Selected Corridor (Requirement 8) */}
        <div className="xl:col-span-6 bg-white border border-[#E2E8F0] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <div className="text-[11px] font-mono text-[#52677D]">
                CORRIDOR FLEET & SHIPMENT EXPOSURE · {selectedCorridor.id}
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937]">
                Affected Vehicles ({corridorVehicles.length}) & Active Shipments ({corridorShipments.length}) on {selectedCorridor.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('shipments')}
              className="text-xs font-medium text-[#52677D] hover:underline cursor-pointer"
            >
              All Shipments →
            </button>
          </div>

          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B]">
                  <th className="py-2 px-3">Shipment / Truck</th>
                  <th className="py-2 px-3">Customer & Priority</th>
                  <th className="py-2 px-3 text-right">Delay / Risk</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {corridorShipments.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => {
                      setSelectedShipmentId(s.id);
                      setSelectedVehicleId(s.assignedVehicleId);
                    }}
                    className="hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    <td className="py-2 px-3 font-mono">
                      <div className="font-bold text-[#1F2937]">{s.id}</div>
                      <div className="text-[10px] text-[#64748B]">{s.assignedVehicleId}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-[#1F2937] truncate max-w-[150px]">
                        {s.customerName}
                      </div>
                      <div className="text-[10px] text-[#64748B]">{s.priority} SLA</div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      <div className="text-[#B85C5C] font-semibold">+{s.predictedDelayHours}h</div>
                      <div className="text-[10px] text-[#64748B]">Risk {s.riskScore}/100</div>
                    </td>
                    <td className="py-2 px-3">
                      {s.reroutedVia ? (
                        <span className="text-[11px] font-semibold text-[#54846B]">
                          Diverted ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            rerouteShipmentToBypass(s.id);
                          }}
                          className="px-2 py-1 text-[10px] font-semibold bg-[#54846B] text-white rounded hover:bg-[#46705A] cursor-pointer"
                        >
                          Reroute Bypass
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* All 8 Monitored National Freight Corridors Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1F2937]">
              8 Monitored Indian National Freight Corridors
            </h3>
            <p className="text-xs text-[#64748B]">
              Click any corridor to load its highway geometry, active fleet count, alternative bypasses, and explainable risk factors
            </p>
          </div>
          <span className="text-xs font-mono text-[#64748B]">
            Assumptions: Diesel ₹{settings.fuelPricePerLiter}/L · {settings.defaultFuelEfficiency} km/L · 2.68 kg CO₂/L
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B]">
                <th className="py-2.5 px-4">Corridor ID & Name</th>
                <th className="py-2.5 px-4">National Highway</th>
                <th className="py-2.5 px-4 text-right">Distance</th>
                <th className="py-2.5 px-4 text-right">Active Shipments</th>
                <th className="py-2.5 px-4 text-right">Active Trucks</th>
                <th className="py-2.5 px-4 text-right">Rainfall / Congestion</th>
                <th className="py-2.5 px-4 text-right">Risk Score</th>
                <th className="py-2.5 px-4 text-right">Est. Delay</th>
                <th className="py-2.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {corridors.map((cor) => {
                const shpCount = shipments.filter(
                  (s) => s.corridorId === cor.id && s.status !== 'Delivered'
                ).length;
                const vehCount = vehicles.filter((v) => v.corridorId === cor.id).length;
                const isSelected = cor.id === selectedCorridorId;

                return (
                  <tr
                    key={cor.id}
                    onClick={() => {
                      setSelectedCorridorId(cor.id);
                      const originHub = INDIAN_CITY_HUBS.find((h) => h.name === cor.origin);
                      const destHub = INDIAN_CITY_HUBS.find((h) => h.name === cor.destination);
                      if (originHub && destHub) {
                        const pair = [originHub, destHub];
                        setRouteStops(pair);
                        runMultiStopCalculation(pair);
                      }
                    }}
                    className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F1F5F9]' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-[#1F2937] whitespace-nowrap">
                      <span className="font-mono text-[#52677D] mr-2">{cor.id}</span>
                      {cor.name}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">{cor.highway}</td>
                    <td className="py-3 px-4 text-right font-mono">{cor.distanceKm} km</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">{shpCount}</td>
                    <td className="py-3 px-4 text-right font-mono">{vehCount}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#64748B]">
                      {cor.rainfallIntensity} mm/h · {cor.trafficCongestion}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={
                          cor.riskScore >= 70
                            ? 'text-[#B85C5C]'
                            : cor.riskScore >= 35
                            ? 'text-[#B58A45]'
                            : 'text-[#54846B]'
                        }
                      >
                        {cor.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">+{cor.estimatedDelayHours}h</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCorridorId(cor.id);
                          setActiveTab('risk');
                        }}
                        className="text-xs font-medium text-[#52677D] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MapPin className="w-3 h-3" />
                        Risk Analysis
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Multi-Point Weather, Traffic Flow & Road Incidents Feed (Phases 1, 2, 3) */}
      <LiveCorridorIntelligencePanel corridorId={selectedCorridor.id} />
    </div>
  );
};
