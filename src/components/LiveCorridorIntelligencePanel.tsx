import React, { useState } from 'react';
import { useNetra } from '../context/NetraContext';
import {
  CloudRain,
  Wind,
  Thermometer,
  RefreshCw,
  AlertTriangle,
  Radio,
  Clock,
} from 'lucide-react';

interface LiveCorridorIntelligencePanelProps {
  corridorId: string;
  compact?: boolean;
}

export const LiveCorridorIntelligencePanel: React.FC<LiveCorridorIntelligencePanelProps> = ({
  corridorId,
  compact = false,
}) => {
  const {
    corridors,
    operatingMode,
    setOperatingMode,
    activeHorizonMode,
    liveWeatherByCorridor,
    liveTrafficByCorridor,
    liveIncidentsFeed,
    isRefreshingLiveTelemetry,
    refreshLiveTelemetry,
    applyLiveExternalConditionsToCorridors,
  } = useNetra();

  const [viewTab, setViewTab] = useState<'WEATHER' | 'TRAFFIC' | 'INCIDENTS'>('WEATHER');

  const corridor = corridors.find((c) => c.id === corridorId) || corridors[0];
  const weather = liveWeatherByCorridor[corridor.id];
  const traffic = liveTrafficByCorridor[corridor.id];
  const corridorIncidents = liveIncidentsFeed.incidents.filter(
    (inc) => inc.associatedCorridorId === corridor.id
  );

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-md p-4 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-semibold text-[#52677D] flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-[#54846B]" />
              LIVE EXTERNAL CORRIDOR TELEMETRY · {corridor.id} ({corridor.name})
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span className="text-[11px] font-mono text-[#64748B]">
              Weather Source:{' '}
              <b className="text-[#1F2937]">{weather?.dataSource || 'Open-Meteo API'}</b> (
              <span
                className={
                  weather?.freshnessStatus === 'LIVE' || weather?.freshnessStatus === 'CACHED'
                    ? 'text-[#54846B] font-semibold'
                    : 'text-[#B58A45] font-semibold'
                }
              >
                {weather?.freshnessStatus || 'LOADING'}
              </span>
              )
            </span>
            {operatingMode === 'DEMO_MODE' ? (
              <span className="px-2 py-0.5 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#B85C5C] font-mono font-bold text-[10px]">
                DEMO MODE ACTIVE (Risk Engine Using Demo Monsoon Baseline)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-mono font-bold text-[10px]">
                APPLIED TO RISK ENGINE ({activeHorizonMode === 'FORECAST_3H' ? '+3H FORECAST' : 'CURRENT OBSERVED'})
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Sampled at 3 geographically distributed highway checkpoints along {corridor.highway}.{' '}
            {operatingMode === 'DEMO_MODE'
              ? 'Click "Sync Risk Engine (Observed)" to switch to Live External Conditions Mode and apply these observations to corridor & shipment risks.'
              : 'Live Open-Meteo weather observations are actively driving corridor & shipment risk calculations.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {operatingMode !== 'DEMO_MODE' && (
            <button
              type="button"
              onClick={() => setOperatingMode('DEMO_MODE')}
              className="px-2.5 py-1.5 text-xs font-medium bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B85C5C] border border-[#FECACA] rounded cursor-pointer"
            >
              Restore Demo Baseline
            </button>
          )}
          <button
            type="button"
            onClick={() => applyLiveExternalConditionsToCorridors('CURRENT_OBSERVED')}
            className="px-2.5 py-1.5 text-xs font-semibold bg-[#52677D] hover:bg-[#415366] text-white rounded cursor-pointer"
          >
            Sync Risk Engine (Observed)
          </button>
          <button
            type="button"
            onClick={() => applyLiveExternalConditionsToCorridors('FORECAST_3H')}
            className="px-2.5 py-1.5 text-xs font-medium bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1F2937] border border-[#E2E8F0] rounded cursor-pointer"
          >
            Sync Risk Engine (+3h Forecast)
          </button>
          <button
            type="button"
            onClick={() => refreshLiveTelemetry(true)}
            disabled={isRefreshingLiveTelemetry}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-[#F8FAFC] text-[#1F2937] border border-[#E2E8F0] rounded flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLiveTelemetry ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setViewTab('WEATHER')}
            className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
              viewTab === 'WEATHER'
                ? 'bg-[#52677D] text-white'
                : 'text-[#64748B] hover:text-[#1F2937]'
            }`}
          >
            1. Open-Meteo Multi-Point Weather (3 Checkpoints)
          </button>
          <button
            type="button"
            onClick={() => setViewTab('TRAFFIC')}
            className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
              viewTab === 'TRAFFIC'
                ? 'bg-[#52677D] text-white'
                : 'text-[#64748B] hover:text-[#1F2937]'
            }`}
          >
            2. TomTom Traffic Flow ({traffic?.configured ? traffic.freshnessStatus : 'Unconfigured'})
          </button>
          <button
            type="button"
            onClick={() => setViewTab('INCIDENTS')}
            className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
              viewTab === 'INCIDENTS'
                ? 'bg-[#52677D] text-white'
                : 'text-[#64748B] hover:text-[#1F2937]'
            }`}
          >
            3. Road Incidents ({corridorIncidents.length})
          </button>
        </div>

        {weather?.lastSuccessfulRefresh && (
          <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#52677D]" />
            <span>Obs Time: {weather.observationTimestamp || 'N/A'}</span>
            <span>·</span>
            <span>
              Last Refresh:{' '}
              {new Date(weather.lastSuccessfulRefresh).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>

      {/* TAB 1: LIVE OPEN-METEO WEATHER */}
      {viewTab === 'WEATHER' && (
        <div className="space-y-3">
          {weather ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
                  <div className="text-[11px] text-[#64748B]">Observed Corridor Avg Temp</div>
                  <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-[#52677D]" />
                    {weather.observedAvgTempC !== null ? `${weather.observedAvgTempC} °C` : 'Missing'}
                  </div>
                  <div className="text-[10px] font-mono text-[#54846B]">Measured Observation</div>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
                  <div className="text-[11px] text-[#64748B]">Observed Peak Rainfall</div>
                  <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-[#52677D]" />
                    {weather.observedMaxRainfallMmHr !== null
                      ? `${weather.observedMaxRainfallMmHr} mm/hr`
                      : 'Missing'}
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B]">
                    3h Forecast Max: {weather.forecastMaxRainNext3hMm ?? 0} mm (
                    {weather.forecastMaxPrecipProbPct ?? 0}% prob)
                  </div>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
                  <div className="text-[11px] text-[#64748B]">Observed Max Wind Speed</div>
                  <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-[#52677D]" />
                    {weather.observedMaxWindKmh !== null
                      ? `${weather.observedMaxWindKmh} km/h`
                      : 'Missing'}
                  </div>
                  <div className="text-[10px] font-mono text-[#54846B]">10m Anemometer Reading</div>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
                  <div className="text-[11px] text-[#64748B]">Calculated Weather Index</div>
                  <div className="text-base font-bold font-mono text-[#52677D] mt-0.5">
                    {weather.derivedWeatherSeverityIndex ?? 'N/A'}/100
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    Derived Heuristic (Not Official Warning)
                  </div>
                </div>
              </div>

              {!compact && (
                <div className="overflow-x-auto border border-[#E2E8F0] rounded">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B]">
                        <th className="py-2 px-3">Distributed Corridor Checkpoint</th>
                        <th className="py-2 px-3">Observed Condition</th>
                        <th className="py-2 px-3 text-right">Observed Temp / Wind</th>
                        <th className="py-2 px-3 text-right">Observed Rain</th>
                        <th className="py-2 px-3 text-right">Next +3h Forecast (Prob / Rain)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {weather.samplePoints.map((pt, idx) => {
                        const maxProb3h = Math.max(
                          ...pt.forecastNext3h.map((f) => f.precipitationProbabilityPct),
                          0
                        );
                        const maxRain3h = Math.max(
                          ...pt.forecastNext3h.map((f) => f.precipitationMm),
                          0
                        );
                        return (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="py-2 px-3">
                              <div className="font-medium text-[#1F2937]">{pt.segmentLabel}</div>
                              <div className="text-[10px] font-mono text-[#64748B]">
                                {pt.lat.toFixed(2)}°N, {pt.lng.toFixed(2)}°E
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-[#1F2937]">
                                {pt.weatherCondition}
                              </span>
                              <div className="text-[10px] font-mono text-[#64748B]">
                                Obs: {pt.observationTimestamp}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              {pt.temperatureC ?? 'N/A'}°C · {pt.windSpeedKmh ?? 'N/A'} km/h
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold">
                              {pt.rainfallMmHr ?? 0} mm/hr
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-[#52677D]">
                              {maxProb3h}% prob · {maxRain3h} mm
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="text-[11px] text-[#64748B] flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC] px-3 py-2 rounded border border-[#E2E8F0]">
                <div>
                  <b className="text-[#1F2937]">Derived Weather Indicators:</b>{' '}
                  {weather.severeWeatherIndicators.join(' · ')}
                </div>
                <span className="font-mono text-[10px] text-[#64748B]">
                  Note: Severity index is a calculated operational metric, not an official IMD warning.
                </span>
              </div>
            </>
          ) : (
            <div className="p-4 text-xs text-[#64748B] font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              Fetching live multi-point corridor weather from Open-Meteo API...
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TOMTOM TRAFFIC FLOW */}
      {viewTab === 'TRAFFIC' && (
        <div className="space-y-3 text-xs">
          {!traffic?.configured ? (
            <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[#B58A45] space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Live TomTom Traffic API Key Not Configured on Server (Status: UNCONFIGURED)
              </div>
              <p className="text-[11px] text-[#1F2937]">
                {traffic?.coverageDisclosure ||
                  'Configure TOMTOM_API_KEY in server environment variables to enable live checkpoint speed and congestion sampling. No fictional live traffic speeds are substituted.'}
              </p>
            </div>
          ) : (
            <>
              {traffic.staleWarning && (
                <div className="p-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[11px] text-[#B58A45] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{traffic.staleWarning}</span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
                  <div className="text-[11px] text-[#64748B]">Sampled Current Speed</div>
                  <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5">
                    {traffic.avgCurrentSpeedKmh ?? 'N/A'} km/h
                  </div>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
                  <div className="text-[11px] text-[#64748B]">Free-Flow Speed</div>
                  <div className="text-base font-bold font-mono text-[#54846B] mt-0.5">
                    {traffic.avgFreeFlowSpeedKmh ?? 'N/A'} km/h
                  </div>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
                  <div className="text-[11px] text-[#64748B]">Sampled Congestion</div>
                  <div className="text-base font-bold font-mono text-[#B85C5C] mt-0.5">
                    {traffic.observedCongestionIndex ?? 'N/A'}%
                  </div>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
                  <div className="text-[11px] text-[#64748B]">Flow Confidence</div>
                  <div className="text-base font-bold font-mono text-[#52677D] mt-0.5">
                    {traffic.avgConfidence !== null ? `${Math.round(traffic.avgConfidence * 100)}%` : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[#64748B] bg-[#F8FAFC] p-2.5 rounded border border-[#E2E8F0]">
                <b className="text-[#1F2937]">Coverage Limitation Disclosure:</b>{' '}
                {traffic.coverageDisclosure}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: REAL ROAD INCIDENTS */}
      {viewTab === 'INCIDENTS' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between bg-[#F8FAFC] px-3 py-2 rounded border border-[#E2E8F0]">
            <span className="font-medium text-[#1F2937]">
              Provider Status ({liveIncidentsFeed.dataSource}):{' '}
              <span className="font-mono text-[#52677D]">{liveIncidentsFeed.statusMessage}</span>
            </span>
            <span className="font-mono text-[11px] text-[#64748B]">
              Freshness: {liveIncidentsFeed.freshnessStatus}
            </span>
          </div>

          {corridorIncidents.length === 0 ? (
            <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#64748B] font-mono text-xs">
              No incidents reported by provider for {corridor.name} ({corridor.highway}). (Note: Absence of provider incident reports does not guarantee road is confirmed clear.)
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E2E8F0] rounded">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B]">
                    <th className="py-2 px-3">Type & Severity</th>
                    <th className="py-2 px-3">Location & Road Segment</th>
                    <th className="py-2 px-3">Distance to Corridor</th>
                    <th className="py-2 px-3">Provider Timestamp</th>
                    <th className="py-2 px-3">Status & Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {corridorIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2 px-3">
                        <div className="font-semibold text-[#B85C5C]">{inc.incidentType}</div>
                        <div className="text-[10px] font-mono text-[#64748B]">
                          Severity: {inc.reportedSeverity}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-[#1F2937]">{inc.location}</div>
                        <div className="text-[10px] font-mono text-[#64748B]">
                          Segment: {inc.affectedRoadSegment}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono">
                        {inc.distanceToCorridorKm !== null ? `${inc.distanceToCorridorKm} km` : 'On Route'}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-[#64748B]">
                        {inc.providerTimestamp}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-[#1F2937]">{inc.currentStatus}</div>
                        <div className="text-[10px] text-[#64748B]">{inc.source}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
