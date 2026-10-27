import React, { useState } from 'react';
import { useNetra } from '../context/NetraContext';
import { CorridorMap } from '../components/CorridorMap';
import { ShipmentModal } from '../components/ShipmentModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Play,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  CloudRain,
  CheckCircle2,
  Navigation,
  SlidersHorizontal,
  Radio,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    kpis,
    corridors,
    shipments,
    vehicles,
    alerts,
    activityLogs,
    simulation,
    settings,
    selectedCorridorId,
    setSelectedCorridorId,
    selectedShipmentId,
    setSelectedShipmentId,
    setActiveTab,
    startHackathonDemo,
    rerouteShipmentToBypass,
    applyCoordinatedFleetReroute,
    resetSimulation,
    operatingMode,
    connectedCapabilities,
    liveWeatherByCorridor,
    liveTrafficByCorridor,
    traccarStatus,
  } = useNetra();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const activeAlerts = alerts.filter((a) => !a.isHistorical);
  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];
  const shp1024 = shipments.find((s) => s.id === 'SHP-1024');
  const cor01UnmitigatedCount = shipments.filter(
    (s) => s.corridorId === 'COR-01' && s.status !== 'Delivered' && !s.reroutedVia
  ).length;
  const activeCorridorWeather = liveWeatherByCorridor[selectedCorridorId || 'COR-01'];
  const activeCorridorTraffic = liveTrafficByCorridor[selectedCorridorId || 'COR-01'];

  // Dynamic Fleet-Wide Operational Status Breakdown
  const enRouteVehiclesCount = vehicles.filter((v) => v.status === 'Active En Route').length;
  const delayedVehiclesCount = vehicles.filter((v) => v.status === 'Delayed in Congestion').length;
  const availableHubVehiclesCount = vehicles.filter((v) => v.status === 'At Hub / Loading').length;
  const maintenanceVehiclesCount = vehicles.filter((v) => v.status === 'Maintenance Alert').length;

  // Dynamic High-Risk Corridors Summary
  const highRiskCorridorList = [...corridors]
    .filter((c) => c.riskScore >= settings.riskAlertThreshold)
    .sort((a, b) => b.riskScore - a.riskScore);
  const topHighRiskLabel =
    highRiskCorridorList.length > 0
      ? highRiskCorridorList
          .slice(0, 2)
          .map((c) => `${c.name.split('–')[0]}–${c.name.split('–')[1]?.slice(0, 3)} (${c.riskScore})`)
          .join(' · ')
      : 'All corridors below threshold';

  // Chart 1: Corridor Health & Risk Score
  const corridorChartData = corridors.map((c) => ({
    name: c.name.replace('–', '-'),
    risk: c.riskScore,
    delay: c.estimatedDelayHours,
  }));

  // Chart 2: Shipment Risk Distribution
  const activeShipments = shipments.filter((s) => s.status !== 'Delivered');
  const highRiskCount = activeShipments.filter((s) => s.riskScore >= 70).length;
  const modRiskCount = activeShipments.filter((s) => s.riskScore >= 35 && s.riskScore < 70).length;
  const lowRiskCount = activeShipments.filter((s) => s.riskScore < 35).length;

  // Dynamic Average Delay on Delayed Shipments
  const delayedShipmentsList = activeShipments.filter((s) => s.predictedDelayHours > 0);
  const avgPredictedDelayHours =
    delayedShipmentsList.length > 0
      ? +(
          delayedShipmentsList.reduce((sum, s) => sum + s.predictedDelayHours, 0) /
          delayedShipmentsList.length
        ).toFixed(1)
      : 0;

  const riskPieData = [
    { name: 'High Risk (70–100)', value: highRiskCount, color: '#B85C5C' },
    { name: 'Moderate (35–69)', value: modRiskCount, color: '#B58A45' },
    { name: 'Low Risk (0–34)', value: lowRiskCount, color: '#54846B' },
  ];

  // Chart 3: 7-Day On-Time vs Mitigated Performance Trend
  const deliveryTrendData = [
    { day: 'Oct 20', baselineOnTime: 78, netraOptimized: 91 },
    { day: 'Oct 21', baselineOnTime: 75, netraOptimized: 89 },
    { day: 'Oct 22', baselineOnTime: 72, netraOptimized: 90 },
    { day: 'Oct 23', baselineOnTime: 80, netraOptimized: 93 },
    { day: 'Oct 24', baselineOnTime: 74, netraOptimized: 92 },
    { day: 'Oct 25', baselineOnTime: 71, netraOptimized: 88 },
    { day: 'Today', baselineOnTime: 42, netraOptimized: kpis.onTimeDeliveryPercentage },
  ];

  const filteredShipments = shipments
    .filter((s) => (statusFilter === 'ALL' ? true : s.status === statusFilter))
    .slice(0, 10);

  return (
    <div className="space-y-4">
      {/* ROW 1 — DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-[#E2E8F0] rounded-md px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#1F2937] leading-tight">
              Command Center
            </h1>
            {operatingMode === 'DEMO_MODE' ? (
              <span className="px-2 py-0.5 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#B85C5C] font-mono font-bold text-[10px]">
                SIMULATED DATA · DEMO MODE
              </span>
            ) : operatingMode === 'LIVE_CONDITIONS_DEMO_FLEET' ? (
              <span className="px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-mono font-bold text-[10px]">
                LIVE WEATHER + SIMULATED FLEET
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-mono font-bold text-[10px]">
                CONNECTED OPERATIONS
              </span>
            )}
          </div>
          <div className="text-xs text-[#64748B]">
            Freight Corridor Intelligence & Recovery Operations
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Shipment
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className="px-3 py-1.5 text-xs font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Digital Twin
          </button>
          <button
            onClick={startHackathonDemo}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run NETRA Demo
          </button>
        </div>
      </div>

      {/* COMPACT LIVE DATA STATUS BAR (Single slim provenance strip — detailed telemetry in Corridor & Risk Intelligence) */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[#64748B]">
          {operatingMode === 'DEMO_MODE' ? (
            <span className="flex items-center gap-1 text-[#1F2937] font-semibold">
              <Radio className="w-3.5 h-3.5 text-[#B85C5C]" />
              Active Weather Input:{' '}
              <span className="text-[#B85C5C]">SIMULATED DEMO SCENARIO</span>
              <span className="font-normal text-[#64748B]">
                (NH48 Monsoon Baseline · 48 mm/hr)
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#1F2937] font-semibold">
              <Radio className="w-3.5 h-3.5 text-[#54846B]" />
              Active Weather Input (Open-Meteo):{' '}
              <span className="text-[#54846B]">
                {activeCorridorWeather?.freshnessStatus || 'LIVE'}
              </span>
              {activeCorridorWeather && (
                <span className="font-normal text-[#64748B]">
                  (Obs: {activeCorridorWeather.observationTimestamp || 'Latest'} ·{' '}
                  {activeCorridorWeather.observedAvgTempC ?? '--'}°C ·{' '}
                  {activeCorridorWeather.observedMaxRainfallMmHr ?? 0} mm/hr)
                </span>
              )}
            </span>
          )}
          <span className="text-[#CBD5E1]">|</span>
          <span>
            OSRM Routing: <b className="text-[#54846B]">LIVE</b> (Baseline Geometry)
          </span>
          <span className="text-[#CBD5E1]">|</span>
          <span>
            Traffic:{' '}
            <b className="text-[#B58A45]">
              {activeCorridorTraffic?.configured
                ? activeCorridorTraffic.freshnessStatus
                : 'SIMULATED BASELINE (TomTom Unconfigured)'}
            </b>
          </span>
          <span className="text-[#CBD5E1]">|</span>
          <span>
            Fleet &amp; Shipments:{' '}
            <b className="text-[#52677D]">
              {operatingMode === 'CONNECTED_FLEET_MODE'
                ? `${connectedCapabilities.hasImportedShipments ? 'IMPORTED SHIPMENTS' : 'SIMULATED SHIPMENTS'} · ${
                    connectedCapabilities.hasLiveGps ? 'LIVE GPS' : 'SIMULATED GPS'
                  }`
                : 'SIMULATED'}
            </b>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('corridors')}
            className="px-2 py-0.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#52677D] font-medium cursor-pointer"
          >
            24-Checkpoint Weather Telemetry →
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className="px-2 py-0.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#52677D] font-medium cursor-pointer"
          >
            Risk Sync Controls →
          </button>
        </div>
      </div>

      {/* Active Digital Twin Simulation Telemetry Banner (when simulation is active) */}
      {simulation.active && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-md px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#92400E]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#B58A45]" />
            <span>
              <b>Digital Twin Stress-Test Active (Run #{simulation.runCount}):</b>{' '}
              {simulation.scenarioType} on {simulation.corridorId} (Severity {simulation.severity}%,{' '}
              {simulation.durationHours}h, {simulation.affectedVehiclesCount} vehicles). Dashboard KPIs reflect simulated conditions.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-2.5 py-1 bg-[#52677D] text-white font-semibold rounded cursor-pointer"
            >
              Inspect Simulation
            </button>
            <button
              onClick={resetSimulation}
              className="px-2.5 py-1 bg-white border border-[#CBD5E1] text-[#1F2937] font-medium rounded cursor-pointer"
            >
              Reset to Baseline
            </button>
          </div>
        </div>
      )}

      {/* Upper Section: 6 Compact Live-Calculated KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <button
          onClick={() => setActiveTab('shipments')}
          className="text-left bg-white border border-[#E2E8F0] hover:border-[#52677D] rounded-md p-4 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-[#64748B]">1. Active Shipments</div>
          <div className="text-2xl font-bold text-[#1F2937] font-mono tabular-nums mt-1">
            {kpis.activeShipmentsCount}
            <span className="text-xs font-normal text-[#64748B] ml-1">/ {shipments.length} total</span>
          </div>
          <div className="text-[11px] text-[#54846B] mt-1.5">
            {highRiskCount} high-risk · {shipments.length - kpis.activeShipmentsCount} delivered
          </div>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className="text-left bg-white border border-[#E2E8F0] hover:border-[#52677D] rounded-md p-4 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-[#64748B]">2. Active & Available Fleet</div>
          <div className="text-2xl font-bold text-[#1F2937] font-mono tabular-nums mt-1">
            {kpis.activeVehiclesCount}
            <span className="text-xs font-normal text-[#64748B] ml-1">/ {vehicles.length} fleet</span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-1.5">
            {enRouteVehiclesCount} en route · {availableHubVehiclesCount} at hub · {delayedVehiclesCount} delayed
          </div>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className="text-left bg-white border border-[#E2E8F0] hover:border-[#B85C5C] rounded-md p-4 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-[#64748B]">3. High-Risk Corridors</div>
          <div className="text-2xl font-bold text-[#B85C5C] font-mono tabular-nums mt-1">
            {kpis.highRiskCorridorsCount}
            <span className="text-xs font-normal text-[#64748B] ml-1">of {corridors.length}</span>
          </div>
          <div className="text-[11px] text-[#B85C5C] mt-1.5 truncate">{topHighRiskLabel}</div>
        </button>

        <button
          onClick={() => setActiveTab('shipments')}
          className="text-left bg-white border border-[#E2E8F0] hover:border-[#B58A45] rounded-md p-4 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-[#64748B]">4. Predicted Delays</div>
          <div className="text-2xl font-bold text-[#B58A45] font-mono tabular-nums mt-1">
            {kpis.predictedDelaysCount}
            <span className="text-xs font-normal text-[#64748B] ml-1">shipments</span>
          </div>
          <div className="text-[11px] text-[#B58A45] mt-1.5">
            Avg +{avgPredictedDelayHours} hrs on affected legs
          </div>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className="text-left bg-white border border-[#E2E8F0] hover:border-[#54846B] rounded-md p-4 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-[#64748B]">5. On-Time Delivery %</div>
          <div className="text-2xl font-bold text-[#54846B] font-mono tabular-nums mt-1">
            {kpis.onTimeDeliveryPercentage}%
          </div>
          <div className="text-[11px] text-[#54846B] mt-1.5">Within &lt;2.0h SLA tolerance</div>
        </button>

        <button
          onClick={() => setActiveTab('optimization')}
          className="text-left bg-white border border-[#E2E8F0] hover:border-[#B85C5C] rounded-md p-4 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-[#64748B]">6. Financial Exposure</div>
          <div className="text-2xl font-bold text-[#B85C5C] font-mono tabular-nums mt-1">
            ₹{(kpis.estimatedFinancialExposureINR / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-[#64748B] mt-1.5 font-mono">
            ₹{kpis.estimatedFinancialExposureINR.toLocaleString('en-IN')} SLA risk
          </div>
        </button>
      </div>

      {/* Fleet-Wide Operational Status Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-[#1F2937]">Fleet-Wide Operational Status:</span>
          <span className="font-mono text-[#54846B]">
            ● {enRouteVehiclesCount} Active En Route
          </span>
          <span className="font-mono text-[#52677D]">
            ● {availableHubVehiclesCount} Available / Staging at Hub
          </span>
          <span className="font-mono text-[#B58A45]">
            ● {delayedVehiclesCount} Delayed in Corridor Congestion
          </span>
          <span className="font-mono text-[#B85C5C]">
            ● {maintenanceVehiclesCount} Maintenance Alert
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('fleet')}
            className="text-[#52677D] font-medium hover:underline cursor-pointer"
          >
            Fleet Roster →
          </button>
          <button
            onClick={() => setActiveTab('corridors')}
            className="text-[#52677D] font-medium hover:underline cursor-pointer"
          >
            Corridor Intelligence →
          </button>
        </div>
      </div>

      {/* Main Section: Interactive Freight Corridor Map + Disruptions / Alerts / Actions Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 cols: Interactive Freight Corridor Map */}
        <div className="xl:col-span-8 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-[#1F2937]">
                Live Pan-India Freight Corridor & Fleet Telemetry Map
              </h2>
              <p className="text-xs text-[#64748B]">
                Click any highway corridor to inspect risk factors, or click truck markers (T) for vehicle & shipment details.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedCorridorId}
                onChange={(e) => setSelectedCorridorId(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
              >
                {corridors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Risk: {c.riskScore}/100)
                  </option>
                ))}
              </select>
              <button
                onClick={() => setActiveTab('corridors')}
                className="px-2.5 py-1.5 text-xs font-medium text-[#52677D] hover:text-[#1F2937] border border-[#E2E8F0] rounded flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                Multi-Stop Router
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <CorridorMap
            heightClass="h-[440px]"
            onSelectShipment={(id) => {
              setSelectedShipmentId(id);
            }}
          />

          {/* Selected Shipment Quick Inspector Bar */}
          {selectedShipment && (
            <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-[#1F2937]">{selectedShipment.id}</span>
                <span className="text-[#64748B]">·</span>
                <span className="font-medium text-[#1F2937]">{selectedShipment.customerName}</span>
                <span className="text-[#64748B]">·</span>
                <span className="text-[#64748B]">
                  {selectedShipment.origin} → {selectedShipment.intermediateStops.join(' → ')}{' '}
                  {selectedShipment.intermediateStops.length ? '→ ' : ''}
                  {selectedShipment.destination}
                </span>
                <span className="text-[#64748B]">·</span>
                <span
                  className={`font-mono font-semibold ${
                    selectedShipment.riskScore >= 70
                      ? 'text-[#B85C5C]'
                      : selectedShipment.riskScore >= 35
                      ? 'text-[#B58A45]'
                      : 'text-[#54846B]'
                  }`}
                >
                  Risk {selectedShipment.riskScore}/100
                </span>
                <span className="text-[#64748B]">·</span>
                <span className="font-mono text-[#1F2937]">
                  Penalty Exposure: ₹
                  {(selectedShipment.predictedDelayHours * selectedShipment.delayPenaltyPerHour).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedShipment.predictedDelayHours > 0 && !selectedShipment.reroutedVia && (
                  <button
                    onClick={() => rerouteShipmentToBypass(selectedShipment.id)}
                    className="px-2.5 py-1 text-xs font-medium bg-[#54846B] text-white rounded hover:bg-[#46705A] whitespace-nowrap cursor-pointer"
                  >
                    Execute Bypass Reroute
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('shipments')}
                  className="px-2.5 py-1 text-xs font-medium text-[#52677D] border border-[#E2E8F0] rounded hover:bg-[#F8FAFC] whitespace-nowrap cursor-pointer"
                >
                  Open Full Dossier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 4 cols: Active Disruptions, Weather Warnings & Actionable Recommendations */}
        <div className="xl:col-span-4 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-[#1F2937]">Active Corridor Disruptions & Warnings</h2>
                <p className="text-xs text-[#64748B]">Click an alert to inspect affected corridor or shipments</p>
              </div>
              <span className="text-xs font-mono font-semibold text-[#B85C5C]">{activeAlerts.length} Active</span>
            </div>

            <div className="space-y-2.5 max-h-[270px] overflow-y-auto pr-1">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    setSelectedCorridorId(alert.corridorId);
                    if (alert.affectedShipmentIds[0]) {
                      setSelectedShipmentId(alert.affectedShipmentIds[0]);
                    }
                  }}
                  className={`p-3 rounded border transition-colors cursor-pointer ${
                    selectedCorridorId === alert.corridorId
                      ? 'bg-[#F8FAFC] border-[#52677D]'
                      : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        alert.severity === 'Critical'
                          ? 'text-[#B85C5C]'
                          : alert.severity === 'Warning'
                          ? 'text-[#B58A45]'
                          : 'text-[#52677D]'
                      }`}
                    >
                      {alert.type === 'Weather' ? (
                        <CloudRain className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {alert.severity.toUpperCase()} · {alert.corridorName}
                    </span>
                    <span className="text-[#64748B] font-mono">{alert.timestamp}</span>
                  </div>
                  <div className="text-xs font-semibold text-[#1F2937] mt-1">{alert.title}</div>
                  <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">{alert.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#E2E8F0] text-[11px]">
                    <span className="font-mono text-[#B85C5C]">Est. Delay: +{alert.estimatedDelayHours}h</span>
                    <span className="text-[#52677D] font-medium">
                      {alert.affectedShipmentIds.length} Shipments Exposed →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Operational Actions Box */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1F2937]">
                Recommended Control Tower Actions
              </span>
              <span className="text-[11px] font-mono text-[#52677D]">Grounded in Live SLA Data</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-[#1F2937]">Divert SHP-1024 (Cipla Biologics) via NH52</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {shp1024?.reroutedVia
                      ? `Rerouted via ${shp1024.reroutedVia} · Delay reduced to +${shp1024.predictedDelayHours}h`
                      : `Bypasses Bharuch 48 mm/hr flood zone · Saves ₹${Math.round((shp1024?.predictedDelayHours || 5.5) * (shp1024?.delayPenaltyPerHour || 22000)).toLocaleString('en-IN')} SLA exposure`}
                  </div>
                </div>
                <button
                  onClick={() => rerouteShipmentToBypass('SHP-1024')}
                  disabled={Boolean(shp1024?.reroutedVia)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded shrink-0 cursor-pointer ${
                    shp1024?.reroutedVia
                      ? 'bg-[#E2E8F0] text-[#54846B]'
                      : 'bg-[#52677D] text-white hover:bg-[#415366]'
                  }`}
                >
                  {shp1024?.reroutedVia ? 'Applied ✓' : 'Apply'}
                </button>
              </div>

              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-[#1F2937]">
                    Coordinated NH48 Fleet Mitigation ({cor01UnmitigatedCount || 7} Trucks)
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {cor01UnmitigatedCount === 0
                      ? 'All active NH48 shipments diverted or staged at ICD hubs'
                      : 'Reroute Critical cargo + stage Medium freight at Jaipur/Ahmedabad ICDs'}
                  </div>
                </div>
                <button
                  onClick={() => applyCoordinatedFleetReroute('COR-01')}
                  disabled={cor01UnmitigatedCount === 0}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded shrink-0 cursor-pointer ${
                    cor01UnmitigatedCount === 0
                      ? 'bg-[#E2E8F0] text-[#54846B]'
                      : 'bg-[#54846B] text-white hover:bg-[#46705A]'
                  }`}
                >
                  {cor01UnmitigatedCount === 0 ? 'Executed ✓' : 'Execute'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section Row 1: Corridor Health Chart, Risk Distribution Chart, Delivery Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Corridor Health Bar Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#1F2937]">Corridor Risk Score Comparison</h3>
              <p className="text-xs text-[#64748B]">0–100 composite disruption index across 8 corridors</p>
            </div>
            <button
              onClick={() => setActiveTab('risk')}
              className="text-xs font-medium text-[#52677D] hover:underline cursor-pointer"
            >
              Details →
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridorChartData} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" width={92} tick={{ fontSize: 11, fill: '#1F2937' }} />
                <Tooltip
                  contentStyle={{ fontSize: '12px', borderRadius: '4px', borderColor: '#E2E8F0' }}
                  formatter={(value: any) => [`${value}/100`, 'Risk Score']}
                />
                <Bar dataKey="risk" radius={[0, 3, 3, 0]}>
                  {corridorChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.risk >= 70 ? '#B85C5C' : entry.risk >= 35 ? '#B58A45' : '#54846B'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shipment Risk Distribution Donut Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#1F2937]">Active Shipment Risk Distribution</h3>
              <p className="text-xs text-[#64748B]">{activeShipments.length} active consignments categorized by risk</p>
            </div>
            <span className="text-xs font-mono text-[#64748B]">Live Breakdown</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskPieData.map((entry, idx) => (
                    <Cell key={`pie-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '4px', borderColor: '#E2E8F0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] text-center text-xs">
            {riskPieData.map((item) => (
              <div key={item.name}>
                <div className="font-mono font-bold text-sm" style={{ color: item.color }}>
                  {item.value}
                </div>
                <div className="text-[11px] text-[#64748B] truncate">{item.name.split(' ')[0]} Risk</div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Performance Trend Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#1F2937]">On-Time SLA Performance (%)</h3>
              <p className="text-xs text-[#64748B]">NETRA Route Optimization vs. Unoptimized Baseline</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-medium text-[#52677D] hover:underline cursor-pointer"
            >
              Impact Report →
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deliveryTrendData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '4px', borderColor: '#E2E8F0' }} />
                <Line
                  type="monotone"
                  dataKey="netraOptimized"
                  name="With NETRA Optimization (%)"
                  stroke="#54846B"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="baselineOnTime"
                  name="Without NETRA Baseline (%)"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Section Row 2: Shipment Status Table + Recent Operational Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Shipment Status Table (8 cols) */}
        <div className="xl:col-span-8 bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#1F2937]">Priority Shipment Operations Roster</h3>
              <p className="text-xs text-[#64748B]">Click any row to highlight shipment route & inspect SLA telemetry</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded border border-[#E2E8F0]">
              {['ALL', 'At Risk', 'Delayed', 'In Transit'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-white text-[#1F2937] shadow-2xs border border-[#E2E8F0]'
                      : 'text-[#64748B] hover:text-[#1F2937]'
                  }`}
                >
                  {st === 'ALL' ? 'All Shipments' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B]">
                  <th className="py-2.5 px-3">Shipment ID</th>
                  <th className="py-2.5 px-3">Customer & Cargo</th>
                  <th className="py-2.5 px-3">Corridor Route</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3 text-right">Risk Score</th>
                  <th className="py-2.5 px-3 text-right">Est. Delay</th>
                  <th className="py-2.5 px-3 text-right">SLA Exposure</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredShipments.map((shp) => {
                  const exposure = shp.predictedDelayHours * shp.delayPenaltyPerHour;
                  const isSelected = shp.id === selectedShipmentId;
                  return (
                    <tr
                      key={shp.id}
                      onClick={() => {
                        setSelectedShipmentId(shp.id);
                        setSelectedCorridorId(shp.corridorId);
                      }}
                      className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#F1F5F9]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#1F2937] whitespace-nowrap">
                        {shp.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#1F2937] truncate max-w-[180px]">{shp.customerName}</div>
                        <div className="text-[11px] text-[#64748B] truncate max-w-[180px]">{shp.cargoType}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-[#1F2937]">
                          {shp.origin} → {shp.destination}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {shp.reroutedVia ? (
                            <span className="text-[#54846B] font-medium">{shp.reroutedVia}</span>
                          ) : (
                            `Via ${shp.intermediateStops.join(', ') || 'Direct'}`
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                        {shp.assignedVehicleId}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold whitespace-nowrap">
                        <span
                          className={
                            shp.riskScore >= 70
                              ? 'text-[#B85C5C]'
                              : shp.riskScore >= 35
                              ? 'text-[#B58A45]'
                              : 'text-[#54846B]'
                          }
                        >
                          {shp.riskScore}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        {shp.predictedDelayHours > 0 ? (
                          <span className="text-[#B85C5C] font-medium">+{shp.predictedDelayHours}h</span>
                        ) : (
                          <span className="text-[#54846B]">0.0h</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#1F2937] whitespace-nowrap">
                        ₹{exposure.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            shp.status === 'Delayed'
                              ? 'text-[#B85C5C]'
                              : shp.status === 'At Risk'
                              ? 'text-[#B58A45]'
                              : 'text-[#54846B]'
                          }`}
                        >
                          {shp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Operational Activity Log (4 cols) */}
        <div className="xl:col-span-4 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#1F2937]">Control Tower Activity Stream</h3>
                <p className="text-xs text-[#64748B]">Real-time log of predictions, route actions & telemetry</p>
              </div>
              <Navigation className="w-4 h-4 text-[#52677D]" />
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {activityLogs.map((log, idx) => (
                <div key={`${log.id}-${idx}`} className="pb-2.5 border-b border-[#E2E8F0] last:border-none text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="font-mono font-semibold text-[#52677D]">{log.category}</span>
                    <span className="font-mono">{log.timestamp}</span>
                  </div>
                  <div className="text-[#1F2937] mt-1 leading-relaxed">{log.summary}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#54846B]" />
              All 8 corridors synchronized
            </span>
            <button
              onClick={() => setActiveTab('agent')}
              className="text-[#52677D] font-semibold hover:underline cursor-pointer"
            >
              Ask NETRA AI Agent →
            </button>
          </div>
        </div>
      </div>

      <ShipmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
