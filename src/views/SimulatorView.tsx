import React, { useState, useRef, useEffect } from 'react';
import { useNetra } from '../context/NetraContext';
import { SimulationState } from '../types/netra';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Play,
  RotateCcw,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Truck,
  Clock,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const {
    corridors,
    shipments,
    simulation,
    runDisruptionSimulation,
    generateSimulationActionPlan,
    applySimulationActionStep,
    rejectSimulationActionStep,
    resetSimulation,
    rerouteShipmentToBypass,
    operatingMode,
    liveWeatherByCorridor,
    liveTrafficByCorridor,
    applyLiveExternalConditionsToCorridors,
  } = useNetra();

  const [corridorId, setCorridorId] = useState<string>(simulation.corridorId || 'COR-01');
  const [scenarioType, setScenarioType] = useState<SimulationState['scenarioType']>(
    simulation.scenarioType || 'Heavy Rainfall'
  );
  const [severity, setSeverity] = useState<number>(simulation.severity || 86);
  const [durationHours, setDurationHours] = useState<number>(simulation.durationHours || 6);
  const [affectedVehiclesCount, setAffectedVehiclesCount] = useState<number>(
    simulation.affectedVehiclesCount || 7
  );

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const resultsSectionRef = useRef<HTMLDivElement | null>(null);
  const actionPlanSectionRef = useRef<HTMLDivElement | null>(null);

  // Keep form inputs synchronized if simulation is triggered externally or when operatingMode switches
  useEffect(() => {
    if (simulation.active) {
      setCorridorId(simulation.corridorId);
      setScenarioType(simulation.scenarioType);
      setSeverity(simulation.severity);
      setDurationHours(simulation.durationHours);
      setAffectedVehiclesCount(simulation.affectedVehiclesCount);
    } else if (operatingMode === 'DEMO_MODE') {
      setCorridorId('COR-01');
      setScenarioType('Heavy Rainfall');
      setSeverity(86);
      setDurationHours(6);
      setAffectedVehiclesCount(7);
    } else if (operatingMode === 'LIVE_CONDITIONS_DEMO_FLEET') {
      const liveW = liveWeatherByCorridor[corridorId];
      if (liveW && liveW.derivedWeatherSeverityIndex !== null) {
        const nextSev = Math.max(20, Math.min(98, Math.round(liveW.derivedWeatherSeverityIndex * 0.5 + 42)));
        setSeverity(nextSev);
        setScenarioType((liveW.observedMaxRainfallMmHr || 0) >= 5 ? 'Heavy Rainfall' : 'Severe Congestion');
      }
    }
  }, [simulation.runCount, operatingMode]);

  const selectedFormCorridor = corridors.find((c) => c.id === corridorId) || corridors[0];
  const simulatedCorridor =
    corridors.find((c) => c.id === simulation.corridorId) || selectedFormCorridor;

  const handleRunSim = async () => {
    if (isRunning) return;

    const validSeverity = Math.max(10, Math.min(100, Number(severity) || 86));
    const validDuration = Math.max(1, Math.min(48, Number(durationHours) || 6));
    const validVehicles = Math.max(1, Math.min(25, Number(affectedVehiclesCount) || 7));

    setSeverity(validSeverity);
    setDurationHours(validDuration);
    setAffectedVehiclesCount(validVehicles);
    setIsRunning(true);
    setStatusBanner(null);

    try {
      // Short visual processing beat so operator sees execution feedback clearly
      await new Promise((resolve) => setTimeout(resolve, 260));

      const result = await runDisruptionSimulation({
        corridorId,
        scenarioType,
        severity: validSeverity,
        durationHours: validDuration,
        affectedVehiclesCount: validVehicles,
      });

      const targetCor = corridors.find((c) => c.id === corridorId) || corridors[0];
      setStatusBanner({
        type: 'success',
        message: `Simulation Run #${result.runCount} Completed (${result.lastRunTimestamp}) — ${targetCor.name} | ${scenarioType} (Severity ${validSeverity}%, Duration ${validDuration}h, ${result.affectedVehiclesCount} Vehicles). Estimated Net Savings: ₹${result.financialBreakdown.netSavingsINR.toLocaleString('en-IN')}.`,
      });

      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch (err: any) {
      console.error('Digital Twin Simulation execution error:', err);
      setStatusBanner({
        type: 'error',
        message: `Simulation encountered an unexpected error: ${String(err?.message || 'Execution failed')}. Restored controls to ready state.`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleGenerateActionPlan = () => {
    try {
      generateSimulationActionPlan();
      setStatusBanner({
        type: 'info',
        message: `Generated Multi-Agent Recovery Action Plan (${simulation.actionPlanSteps.length || 3} steps) for ${simulatedCorridor.name}. Review and approve actions below.`,
      });
      setTimeout(() => {
        actionPlanSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch (err: any) {
      console.error('Error generating action plan:', err);
      setStatusBanner({
        type: 'error',
        message: 'Failed to generate action plan. Please run the simulation again.',
      });
    }
  };

  const handleResetSimulation = () => {
    resetSimulation();
    setCorridorId('COR-01');
    setScenarioType('Heavy Rainfall');
    setSeverity(86);
    setDurationHours(6);
    setAffectedVehiclesCount(7);
    setStatusBanner({
      type: 'info',
      message:
        'Digital Twin Simulator reset to baseline network parameters (Delhi–Mumbai · Severity 86% · Duration 6h · 7 Vehicles).',
    });
  };

  const delaySavedHours = +(
    simulation.beforeMetrics.aggregateDelayHours - simulation.afterMetrics.aggregateDelayHours
  ).toFixed(1);

  const delayReductionPct =
    simulation.beforeMetrics.aggregateDelayHours > 0
      ? Math.round(
          (delaySavedHours / simulation.beforeMetrics.aggregateDelayHours) * 100
        )
      : 0;

  const netSavingsINR =
    simulation.beforeMetrics.financialExposureINR - simulation.afterMetrics.financialExposureINR;

  const exposureReductionPct =
    simulation.beforeMetrics.financialExposureINR > 0
      ? Math.round((netSavingsINR / simulation.beforeMetrics.financialExposureINR) * 100)
      : 0;

  const chartComparisonData = [
    {
      metric: 'Estimated Delay (Hrs)',
      BeforeIntervention: simulation.beforeMetrics.aggregateDelayHours,
      AfterIntervention: simulation.afterMetrics.aggregateDelayHours,
    },
    {
      metric: 'At-Risk Shipments',
      BeforeIntervention: simulation.beforeMetrics.atRiskShipments,
      AfterIntervention: simulation.afterMetrics.atRiskShipments,
    },
    {
      metric: 'Critical Alerts',
      BeforeIntervention: simulation.beforeMetrics.criticalAlerts,
      AfterIntervention: simulation.afterMetrics.criticalAlerts,
    },
  ];

  const financialChartData = [
    {
      name: 'Total Financial Exposure (₹ Lakhs)',
      BeforeIntervention: +(simulation.beforeMetrics.financialExposureINR / 100000).toFixed(2),
      AfterIntervention: +(simulation.afterMetrics.financialExposureINR / 100000).toFixed(2),
    },
  ];

  // Combine rich shipmentImpacts with live shipment reroute status
  const shipmentImpactRows = (simulation.shipmentImpacts || []).map((imp) => {
    const liveShipment = shipments.find((s) => s.id === imp.id);
    return {
      ...imp,
      reroutedVia: liveShipment?.reroutedVia || imp.reroutedVia || null,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
            <span>Digital Twin Disruption Simulator · What-If Stress Testing & Multi-Agent Recovery</span>
            <span className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded font-mono text-[10px] text-[#1F2937]">
              {simulation.executionMode === 'BACKEND_SIMULATION_API'
                ? 'Simulated Estimate · Server Engine (/api/simulation/run)'
                : 'Simulated Estimate · Deterministic Local Engine'}
            </span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                operatingMode === 'DEMO_MODE'
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B85C5C]'
                  : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
              }`}
            >
              {operatingMode === 'DEMO_MODE'
                ? 'ACTIVE MODE: DEMO MODE (SIMULATED DATA)'
                : operatingMode === 'LIVE_CONDITIONS_DEMO_FLEET'
                ? 'ACTIVE MODE: LIVE WEATHER + DEMO FLEET'
                : 'ACTIVE MODE: CONNECTED FLEET'}
            </span>
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
            NETRA Digital Twin Logistics Disruption Simulator
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleResetSimulation}
            disabled={isRunning}
            className="px-3.5 py-2 text-xs font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET SIMULATION
          </button>
          <button
            type="button"
            onClick={handleGenerateActionPlan}
            disabled={isRunning}
            className="px-3.5 py-2 text-xs font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#52677D]" />
            GENERATE ACTION PLAN
          </button>
          <button
            type="button"
            onClick={handleRunSim}
            disabled={isRunning}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                RUNNING SIMULATION...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                RUN SIMULATION
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Banner (Success / Error / Info) */}
      {statusBanner && (
        <div
          className={`px-4 py-3 rounded-md border text-xs flex items-center justify-between gap-3 ${
            statusBanner.type === 'success'
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
              : statusBanner.type === 'error'
              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B85C5C]'
              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#1F2937]'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {statusBanner.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B85C5C]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#54846B]" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PHASE 8: Digital Twin Live External Condition & Forecast Baseline Initializer */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-semibold text-[#52677D]">
              PHASE 8 · INITIALIZE DIGITAL TWIN FROM LIVE EXTERNAL CONDITIONS ({corridorId})
            </span>
            <span className="px-2 py-0.5 rounded bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-mono text-[10px]">
              {liveTrafficByCorridor[corridorId]?.configured
                ? 'Live weather + live traffic scenario.'
                : 'Live weather + simulated congestion scenario.'}
            </span>
          </div>
          <p className="text-[#64748B]">
            Seed simulation parameters directly from live Open-Meteo multi-point corridor observations (
            {liveWeatherByCorridor[corridorId]
              ? `Observed Temp: ${liveWeatherByCorridor[corridorId].observedAvgTempC ?? 'N/A'}°C · Max Rain: ${liveWeatherByCorridor[corridorId].observedMaxRainfallMmHr ?? 0} mm/hr · Derived Weather Index: ${liveWeatherByCorridor[corridorId].derivedWeatherSeverityIndex ?? 20}/100`
              : 'Loading Open-Meteo telemetry...'}
            ) or +3h hourly forecast.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={async () => {
              const liveW = liveWeatherByCorridor[corridorId];
              const liveT = liveTrafficByCorridor[corridorId];
              const nextSev = Math.max(
                20,
                Math.min(
                  98,
                  liveT?.configured && liveT.observedCongestionIndex !== null
                    ? Math.round(
                        (liveW?.derivedWeatherSeverityIndex || 35) * 0.5 +
                          liveT.observedCongestionIndex * 0.5
                      )
                    : liveW?.derivedWeatherSeverityIndex || 42
                )
              );
              const nextScenario: SimulationState['scenarioType'] =
                (liveW?.observedMaxRainfallMmHr || 0) >= 5
                  ? 'Heavy Rainfall'
                  : 'Severe Congestion';
              setScenarioType(nextScenario);
              setSeverity(nextSev);
              setDurationHours(4);
              applyLiveExternalConditionsToCorridors('CURRENT_OBSERVED');
              await runDisruptionSimulation({
                corridorId,
                scenarioType: nextScenario,
                severity: nextSev,
                durationHours: 4,
                affectedVehiclesCount,
              });
              setStatusBanner({
                type: 'success',
                message: `Initialized Digital Twin with Current Observed Baseline for ${corridorId} (${nextScenario}, ${nextSev}% derived severity — Live weather + simulated congestion scenario.).`,
              });
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-[#52677D] hover:bg-[#415366] text-white rounded cursor-pointer"
          >
            1. Initialize from Current-Condition Baseline
          </button>
          <button
            type="button"
            onClick={async () => {
              const liveW = liveWeatherByCorridor[corridorId];
              const forecastSev = Math.max(
                25,
                Math.min(
                  98,
                  Math.round(
                    (liveW?.derivedWeatherSeverityIndex || 38) * 1.15 +
                      (liveW?.forecastMaxPrecipProbPct || 20) * 0.25
                  )
                )
              );
              const nextScenario: SimulationState['scenarioType'] =
                (liveW?.forecastMaxPrecipProbPct || 0) >= 40
                  ? 'Heavy Rainfall'
                  : 'Severe Congestion';
              setScenarioType(nextScenario);
              setSeverity(forecastSev);
              setDurationHours(6);
              applyLiveExternalConditionsToCorridors('FORECAST_3H');
              await runDisruptionSimulation({
                corridorId,
                scenarioType: nextScenario,
                severity: forecastSev,
                durationHours: 6,
                affectedVehiclesCount,
              });
              setStatusBanner({
                type: 'success',
                message: `Initialized Digital Twin with +3h Forecast-Based Baseline for ${corridorId} (${nextScenario}, ${forecastSev}% forecast-derived severity — Live weather + simulated congestion scenario.).`,
              });
            }}
            className="px-3 py-1.5 text-xs font-medium bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1F2937] border border-[#CBD5E1] rounded cursor-pointer"
          >
            2. Initialize from +3h Forecast Baseline
          </button>
        </div>
      </div>

      {/* Main Split: Scenario Parameters (4 cols) + Section A & C Results Dashboard (8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left 4 cols: User Inputs */}
        <div className="xl:col-span-4 bg-white border border-[#E2E8F0] rounded-md p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2.5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#1F2937]">Scenario Parameters</h2>
                <p className="text-xs text-[#64748B]">
                  Configure disruption variables and click Run Simulation
                </p>
              </div>
              <span className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-[10px] text-[#52677D]">
                {simulation.active ? `Run #${simulation.runCount} Active` : 'Ready'}
              </span>
            </div>

            <div>
              <label
                htmlFor="sim-corridor-select"
                className="block text-xs font-medium text-[#1F2937] mb-1"
              >
                1. Target Freight Corridor
              </label>
              <select
                id="sim-corridor-select"
                value={corridorId}
                onChange={(e) => setCorridorId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              >
                {corridors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}: {c.name} ({c.highway.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1.5">
                2. Disruption Scenario Type
              </label>
              <div className="space-y-1.5">
                {(
                  [
                    'Heavy Rainfall',
                    'Highway Closure',
                    'Severe Congestion',
                    'Vehicle Breakdown',
                    'Accident-Related Road Blockage',
                  ] as const
                ).map((scen) => (
                  <button
                    key={scen}
                    type="button"
                    onClick={() => setScenarioType(scen)}
                    className={`w-full px-3 py-2 text-xs font-medium rounded border text-left transition-colors cursor-pointer ${
                      scenarioType === scen
                        ? 'bg-[#52677D] text-white border-[#52677D]'
                        : 'bg-[#F8FAFC] text-[#1F2937] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {scen}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label htmlFor="sim-severity-range" className="font-medium text-[#1F2937]">
                  3. Disruption Severity (%)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={severity}
                    onChange={(e) =>
                      setSeverity(Math.max(10, Math.min(100, Number(e.target.value) || 86)))
                    }
                    className="w-14 px-1.5 py-0.5 text-right font-mono font-bold text-[#B85C5C] border border-[#E2E8F0] rounded text-xs"
                  />
                  <span className="font-mono font-bold text-[#B85C5C]">%</span>
                </div>
              </div>
              <input
                id="sim-severity-range"
                type="range"
                min={10}
                max={100}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-[#52677D] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="sim-duration-input"
                  className="block text-xs font-medium text-[#1F2937] mb-1"
                >
                  4. Duration (Hours)
                </label>
                <input
                  id="sim-duration-input"
                  type="number"
                  min={1}
                  max={48}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
                />
              </div>
              <div>
                <label
                  htmlFor="sim-vehicles-input"
                  className="block text-xs font-medium text-[#1F2937] mb-1"
                >
                  5. Affected Vehicles
                </label>
                <input
                  id="sim-vehicles-input"
                  type="number"
                  min={1}
                  max={25}
                  value={affectedVehiclesCount}
                  onChange={(e) =>
                    setAffectedVehiclesCount(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full px-3 py-1.5 text-xs font-mono border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
                />
              </div>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[11px] text-[#64748B] space-y-1">
              <div className="font-semibold text-[#1F2937]">Documented Calculation Assumptions:</div>
              <div>
                • Added Delay = Severity × Duration × 0.85 × Scenario Multiplier (1.18x Rain / 1.35x Closure)
              </div>
              <div>
                • Scenario-Dependent Recovery: Residual delay varies by disruption class (Closure 48% vs Congestion 23% base residual) + Corridor Route Flexibility ({selectedFormCorridor.routeFlexibility}/100).
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunSim}
            disabled={isRunning}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                EXECUTING SIMULATION ON {selectedFormCorridor.name.toUpperCase()}...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                RUN SIMULATION ON {selectedFormCorridor.name.toUpperCase()}
              </>
            )}
          </button>
        </div>

        {/* Right 8 cols: SECTION A (Simulation Summary) + SECTION C (Before vs After Comparison) */}
        <div
          ref={resultsSectionRef}
          className="xl:col-span-8 bg-white border border-[#E2E8F0] rounded-md p-5 flex flex-col justify-between space-y-5"
        >
          {/* Section A Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E2E8F0] pb-3.5">
            <div>
              <div className="text-xs font-mono text-[#52677D] flex items-center gap-2">
                <span>A. SIMULATION SUMMARY & C. BEFORE VS. AFTER COMPARISON</span>
                {simulation.lastRunTimestamp && (
                  <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#54846B] border border-[#BBF7D0] rounded text-[10px]">
                    Executed at {simulation.lastRunTimestamp}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-[#1F2937] mt-0.5">
                {simulation.scenarioType} on {simulatedCorridor.name} (Severity {simulation.severity}%,{' '}
                {simulation.durationHours}h, {simulation.affectedVehiclesCount} Vehicles)
              </h2>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded px-3 py-1.5 text-right shrink-0">
              <div className="text-[10px] text-[#64748B]">
                Corridor Risk Score / Resilience Index
              </div>
              <div className="text-sm font-bold font-mono text-[#B85C5C]">
                Risk {simulation.calculatedCorridorRisk}/100 · Resilience{' '}
                <span className="text-[#52677D]">{simulation.resilienceIndex}/100</span>
              </div>
            </div>
          </div>

          {/* Section A: 6 Deterministic Calculation KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">Affected Shipments</div>
              <div className="text-base font-bold font-mono text-[#1F2937] mt-0.5">
                {simulation.beforeMetrics.atRiskShipments} units
              </div>
              <div className="text-[10px] text-[#64748B]">
                On {simulatedCorridor.name}
              </div>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">Critical Shipments</div>
              <div className="text-base font-bold font-mono text-[#B85C5C] mt-0.5">
                {simulation.criticalShipmentsCount} critical
              </div>
              <div className="text-[10px] text-[#64748B]">
                +{simulation.perShipmentAddedDelayHours}h/truck added
              </div>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">Est. Aggregate Delay</div>
              <div className="text-base font-bold font-mono text-[#B85C5C] mt-0.5">
                {simulation.beforeMetrics.aggregateDelayHours} hrs
              </div>
              <div className="text-[10px] text-[#64748B]">
                Unmitigated fleet total
              </div>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">Potential Delay Reduction</div>
              <div className="text-base font-bold font-mono text-[#54846B] mt-0.5">
                -{delaySavedHours} hrs
              </div>
              <div className="text-[10px] text-[#54846B] font-medium">
                -{delayReductionPct}% via bypass
              </div>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">Est. Financial Exposure</div>
              <div className="text-base font-bold font-mono text-[#B85C5C] mt-0.5">
                ₹{(simulation.beforeMetrics.financialExposureINR / 100000).toFixed(2)}L
              </div>
              <div className="text-[10px] text-[#64748B]">
                ₹{simulation.beforeMetrics.financialExposureINR.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">Exposure Reduction</div>
              <div className="text-base font-bold font-mono text-[#54846B] mt-0.5">
                ₹{(netSavingsINR / 100000).toFixed(2)}L
              </div>
              <div className="text-[10px] text-[#54846B] font-medium">
                -{exposureReductionPct}% saved
              </div>
            </div>
          </div>

          {/* Section C: Before vs After Comparison Table */}
          <div className="overflow-x-auto border border-[#E2E8F0] rounded">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                  <th className="py-2.5 px-4">Operational Metric</th>
                  <th className="py-2.5 px-4 text-right">Before Intervention (Unmitigated)</th>
                  <th className="py-2.5 px-4 text-right">After NETRA Intervention (Optimized)</th>
                  <th className="py-2.5 px-4 text-right">Expected Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                <tr>
                  <td className="py-2.5 px-4 font-medium text-[#1F2937]">At-Risk Shipments</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#B85C5C]">
                    {simulation.beforeMetrics.atRiskShipments} shipments
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#54846B]">
                    {simulation.afterMetrics.atRiskShipments} shipments
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B]">
                    -{simulation.beforeMetrics.atRiskShipments - simulation.afterMetrics.atRiskShipments}{' '}
                    shipments protected
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-[#1F2937]">Estimated Aggregate Delay</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#B85C5C]">
                    {simulation.beforeMetrics.aggregateDelayHours} hrs
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#54846B]">
                    {simulation.afterMetrics.aggregateDelayHours} hrs
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B]">
                    -{delaySavedHours} hrs (-{delayReductionPct}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-[#1F2937]">Estimated Financial Exposure</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#B85C5C]">
                    ₹{simulation.beforeMetrics.financialExposureINR.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#54846B]">
                    ₹{simulation.afterMetrics.financialExposureINR.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#54846B]">
                    ₹{netSavingsINR.toLocaleString('en-IN')} saved (-{exposureReductionPct}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-[#1F2937]">Critical Control Tower Alerts</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#B85C5C]">
                    {simulation.beforeMetrics.criticalAlerts} alerts
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#54846B]">
                    {simulation.afterMetrics.criticalAlerts} alert
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B]">
                    -{simulation.beforeMetrics.criticalAlerts - simulation.afterMetrics.criticalAlerts}{' '}
                    critical escalations
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section C: Before / After Bar Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-xs font-semibold text-[#1F2937] mb-2">
                Estimated Delay, At-Risk Shipments & Critical Alerts
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="metric" tick={{ fontSize: 10, fill: '#1F2937' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="BeforeIntervention" name="Before Intervention" fill="#B85C5C" />
                    <Bar dataKey="AfterIntervention" name="After NETRA Optimization" fill="#54846B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-xs font-semibold text-[#1F2937] mb-2">
                Financial Exposure in ₹ Lakhs (Before vs. After)
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#1F2937' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="BeforeIntervention" name="Unmitigated Exposure (₹L)" fill="#B85C5C" />
                    <Bar dataKey="AfterIntervention" name="Mitigated Exposure (₹L)" fill="#54846B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: SECTION D (Detailed Financial Impact Breakdown) + Convoy Scheduling Advisory */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 bg-white border border-[#E2E8F0] rounded-md p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
            <div>
              <div className="text-[11px] font-mono text-[#52677D]">
                D. FINANCIAL IMPACT & COST COMPARISON BREAKDOWN (SIMULATED ESTIMATE)
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937]">
                Unmitigated Disruption Cost vs. NETRA Recovery Intervention Cost
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#54846B]">
              Net Savings: ₹{simulation.financialBreakdown.netSavingsINR.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">SLA Delay Penalties</div>
              <div className="font-mono font-bold text-[#B85C5C] mt-1">
                ₹{simulation.financialBreakdown.unmitigatedSlaPenaltyINR.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">Congestion Fuel Burn</div>
              <div className="font-mono font-bold text-[#B58A45] mt-1">
                ₹{simulation.financialBreakdown.congestionFuelWasteINR.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">Reefer Cooling Diesel</div>
              <div className="font-mono font-bold text-[#B58A45] mt-1">
                ₹{simulation.financialBreakdown.reeferAuxiliaryFuelINR.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <div className="text-[10px] text-[#64748B]">Bypass Detour Fuel</div>
              <div className="font-mono font-bold text-[#1F2937] mt-1">
                ₹{simulation.financialBreakdown.bypassExtraFuelCostINR.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded">
              <div className="text-[10px] text-[#166534]">Post-Mitigation Cost</div>
              <div className="font-mono font-bold text-[#54846B] mt-1">
                ₹{simulation.financialBreakdown.mitigatedTotalCostINR.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Convoy Scheduling & Driver Safety Advisory */}
        <div className="xl:col-span-5 bg-white border border-[#E2E8F0] rounded-md p-5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <div>
              <div className="text-[11px] font-mono text-[#52677D]">
                CONVOY SCHEDULING & DRIVER SAFETY ADVISORY
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937]">
                {simulation.convoyAdvisory.stagingHub}
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-[10px] text-[#1F2937]">
              {simulation.convoyAdvisory.convoyId}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <span className="text-[#64748B] block">Departure Window:</span>
              <span className="font-semibold text-[#1F2937]">
                {simulation.convoyAdvisory.recommendedDepartureWindow}
              </span>
            </div>
            <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              <span className="text-[#64748B] block">Assigned Fleet Units:</span>
              <span className="font-mono font-semibold text-[#1F2937]">
                {simulation.convoyAdvisory.vehicleIds.join(', ')}
              </span>
            </div>
          </div>
          <div className="p-2 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[11px] text-[#92400E]">
            <b>Driver Safety Directive:</b> {simulation.convoyAdvisory.safetyDirective}
          </div>
        </div>
      </div>

      {/* Bottom Split: SECTION E (Recommended Recovery Actions) + SECTION B (Affected Shipments Table) */}
      <div ref={actionPlanSectionRef} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Section E: Recommended Recovery Actions (5 cols) */}
        <div className="xl:col-span-5 bg-white border border-[#E2E8F0] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <div className="text-[11px] font-mono text-[#52677D]">
                E. RECOMMENDED RECOVERY ACTIONS (HUMAN APPROVAL WORKFLOW)
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937]">
                Multi-Agent Freight Recovery Action Plan
              </h3>
            </div>
            <span className="text-xs font-mono text-[#54846B] font-semibold">
              Est. Recovery: ₹{netSavingsINR.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-3">
            {simulation.actionPlanSteps.map((step, i) => (
              <div
                key={step.id}
                className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded flex flex-col justify-between gap-2.5 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-white border border-[#CBD5E1] rounded font-mono text-[10px] text-[#52677D]">
                      {step.agentRole}
                    </span>
                    <span className="font-mono text-[11px] text-[#54846B] font-semibold">
                      -{step.estimatedDelayReductionHours}h delay · Save ₹
                      {step.estimatedSavingINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="font-semibold text-[#1F2937] pt-0.5">
                    0{i + 1}. {step.title}
                  </div>
                  <p className="text-[#64748B] leading-relaxed text-[11px]">{step.detail}</p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E2E8F0]">
                  {!step.applied && (
                    <button
                      type="button"
                      onClick={() => {
                        rejectSimulationActionStep(step.id);
                        setStatusBanner({
                          type: 'info',
                          message: `Rejected ${step.id}: ${step.title}. Committed shipment routes remain unchanged.`,
                        });
                      }}
                      disabled={step.rejected}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded shrink-0 cursor-pointer border ${
                        step.rejected
                          ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B85C5C]'
                          : 'bg-white border-[#CBD5E1] text-[#64748B] hover:text-[#B85C5C] hover:border-[#B85C5C]'
                      }`}
                    >
                      {step.rejected ? 'Rejected (Route Unchanged)' : 'Reject'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      applySimulationActionStep(step.id);
                      setStatusBanner({
                        type: 'success',
                        message: `Approved & Executed ${step.id}: ${step.title}. Live shipment routes and ETAs updated.`,
                      });
                    }}
                    disabled={step.applied || step.rejected}
                    className={`px-3 py-1.5 text-xs font-semibold rounded shrink-0 cursor-pointer ${
                      step.applied
                        ? 'bg-[#E2E8F0] text-[#54846B]'
                        : step.rejected
                        ? 'bg-[#F1F5F9] text-[#94A3B8]'
                        : 'bg-[#52677D] hover:bg-[#415366] text-white'
                    }`}
                  >
                    {step.applied ? 'Approved & Executed ✓' : 'Approve & Execute Action'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Affected Shipments Table (7 cols) */}
        <div className="xl:col-span-7 bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-[#52677D]">
                B. AFFECTED SHIPMENTS & RISK-ADJUSTED ETA ESTIMATES
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937]">
                Affected Consignments in Simulation Scope ({shipmentImpactRows.length} Vehicles)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#B85C5C] font-semibold">
              {simulation.criticalShipmentsCount} Critical Deadline Breaches
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B]">
                  <th className="py-2.5 px-3">Shipment & Vehicle</th>
                  <th className="py-2.5 px-3">Customer & SLA</th>
                  <th className="py-2.5 px-3 text-right">Unmitigated → Optimized Delay</th>
                  <th className="py-2.5 px-3 text-right">Exposure (₹)</th>
                  <th className="py-2.5 px-3">Recovery Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {shipmentImpactRows.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-[#1F2937]">{s.id}</div>
                      <div className="text-[10px] font-mono text-[#64748B]">{s.vehicleId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#1F2937]">{s.customerName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-semibold ${
                            s.priority === 'Critical'
                              ? 'text-[#B85C5C]'
                              : s.priority === 'High'
                              ? 'text-[#B58A45]'
                              : 'text-[#52677D]'
                          }`}
                        >
                          {s.priority} SLA
                        </span>
                        {s.missesDeadline && (
                          <span className="text-[10px] font-mono text-[#B85C5C]">
                            · Deadline Risk
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className="text-[#B85C5C] font-bold">
                        +{s.totalUnmitigatedDelayHours}h
                      </span>{' '}
                      →{' '}
                      <span className="text-[#54846B] font-bold">
                        +{s.postMitigationDelayHours}h
                      </span>
                      <div className="text-[10px] text-[#64748B]">
                        (+{s.addedDisruptionDelayHours}h from {simulation.scenarioType})
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <div className="font-semibold text-[#B85C5C]">
                        ₹{s.unmitigatedExposureINR.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        @ ₹{s.delayPenaltyPerHour.toLocaleString('en-IN')}/hr
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {s.reroutedVia ? (
                        <span className="text-[11px] font-semibold text-[#54846B]">
                          Diverted ({s.reroutedVia.slice(0, 22)})
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            rerouteShipmentToBypass(s.id);
                            setStatusBanner({
                              type: 'success',
                              message: `Rerouted ${s.id} (${s.customerName}) via NH52 Kota–Ujjain–Dhule bypass.`,
                            });
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-[#54846B] text-white rounded hover:bg-[#46705A] cursor-pointer"
                        >
                          Reroute via Bypass
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
    </div>
  );
};
