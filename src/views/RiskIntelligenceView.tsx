import React, { useState } from 'react';
import { useNetra } from '../context/NetraContext';
import { computeExplainableCorridorRisk } from '../data/initialData';
import { LiveCorridorIntelligencePanel } from '../components/LiveCorridorIntelligencePanel';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  CloudRain,
  AlertTriangle,
  Sliders,
  RotateCcw,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const RiskIntelligenceView: React.FC = () => {
  const {
    corridors,
    shipments,
    alerts,
    selectedCorridorId,
    setSelectedCorridorId,
    setSelectedShipmentId,
    setActiveTab,
    updateCorridorRiskFactors,
    rerouteShipmentToBypass,
  } = useNetra();

  const [horizonMinutes, setHorizonMinutes] = useState<0 | 30 | 60 | 180>(0);

  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0];
  const historicalAlerts = alerts.filter((a) => a.isHistorical);

  const explainableCalc = computeExplainableCorridorRisk({
    weatherSeverity: selectedCorridor.weatherSeverity,
    rainfallIntensity: selectedCorridor.rainfallIntensity,
    trafficCongestion: selectedCorridor.trafficCongestion,
    historicalIncidentFreq: selectedCorridor.historicalIncidentFreq,
    infrastructureCondition: selectedCorridor.infrastructureCondition,
    routeFlexibility: selectedCorridor.routeFlexibility,
    horizonOffsetMinutes: horizonMinutes,
  });

  const affectedShipments = shipments.filter(
    (s) => s.corridorId === selectedCorridor.id && s.status !== 'Delivered'
  );

  const rankedCorridors = [...corridors].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="space-y-6">
      {/* Header & Forecast Horizon Selector */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B]">
            Explainable AI/ML Disruption Prediction Engine · Weighted Telemetry & Historical Pattern Calibration
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
            Corridor Risk Intelligence & Explainable Delay Prediction
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#64748B] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#52677D]" />
            Forecast Horizon (Scenario Estimate):
          </span>
          <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded border border-[#E2E8F0]">
            {[
              { min: 0, label: 'Current Conditions' },
              { min: 30, label: 'Next 30 Mins' },
              { min: 60, label: 'Next 60 Mins' },
              { min: 180, label: 'Next 3 Hours' },
            ].map((h) => (
              <button
                key={h.min}
                onClick={() => setHorizonMinutes(h.min as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  horizonMinutes === h.min
                    ? 'bg-[#52677D] text-white'
                    : 'text-[#64748B] hover:text-[#1F2937]'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Multi-Point Weather, Traffic Flow & Road Incidents Intelligence (Phases 1, 2, 3, 6) */}
      <LiveCorridorIntelligencePanel corridorId={selectedCorridor.id} />

      {/* Main Split: Corridor Risk Rankings (4 cols) + Explainable AI Breakdown & Interactive Calibration (8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left 4 cols: Corridor Risk Rankings */}
        <div className="xl:col-span-4 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="border-b border-[#E2E8F0] pb-2.5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#1F2937]">Corridor Risk Rankings</h2>
                <p className="text-xs text-[#64748B]">0–34 Low · 35–69 Moderate · 70–100 High Risk</p>
              </div>
              <span className="text-xs font-mono text-[#64748B]">8 Corridors</span>
            </div>

            <div className="space-y-2">
              {rankedCorridors.map((cor, idx) => {
                const isSelected = cor.id === selectedCorridor.id;
                const badgeColor =
                  cor.riskScore >= 70
                    ? 'text-[#B85C5C]'
                    : cor.riskScore >= 35
                    ? 'text-[#B58A45]'
                    : 'text-[#54846B]';

                return (
                  <div
                    key={cor.id}
                    onClick={() => setSelectedCorridorId(cor.id)}
                    className={`p-3 rounded border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F1F5F9] border-[#52677D]'
                        : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-[#1F2937]">
                        <span className="font-mono text-[#64748B] mr-1.5">0{idx + 1}.</span>
                        {cor.name}
                      </div>
                      <span className={`font-mono font-bold ${badgeColor}`}>
                        {cor.riskScore}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1">
                      <span className="truncate max-w-[190px]">{cor.highway}</span>
                      <span className="font-mono">Est. Delay: +{cor.estimatedDelayHours}h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[11px] text-[#64748B] leading-relaxed">
            <b className="text-[#1F2937]">Methodology Note:</b> NETRA uses a transparent weighted risk-scoring engine calibrated against historical corridor incidents, rainfall intensity, and traffic density. Forecasts (+30m to +3h) are labeled scenario estimates.
          </div>
        </div>

        {/* Right 8 cols: Explainable AI Score & Interactive Telemetry Factor Sliders */}
        <div className="xl:col-span-8 bg-white border border-[#E2E8F0] rounded-md p-5 flex flex-col justify-between space-y-5">
          {/* Selected Corridor Score Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="text-xs font-mono text-[#52677D]">
                EXPLAINABLE AI RISK DECOMPOSITION · {selectedCorridor.id}
              </div>
              <h2 className="text-base font-bold text-[#1F2937] mt-0.5">
                {selectedCorridor.name} ({selectedCorridor.highway})
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Adjust telemetry inputs below to inspect how weather, rainfall, congestion, and infrastructure affect corridor risk and shipment delays.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded px-4 py-2.5 shrink-0">
              <div>
                <div className="text-[11px] text-[#64748B]">Composite Risk Score</div>
                <div
                  className={`text-2xl font-bold font-mono ${
                    explainableCalc.score >= 70
                      ? 'text-[#B85C5C]'
                      : explainableCalc.score >= 35
                      ? 'text-[#B58A45]'
                      : 'text-[#54846B]'
                  }`}
                >
                  {explainableCalc.score}/100
                </div>
              </div>
              <div className="border-l border-[#E2E8F0] pl-4">
                <div className="text-[11px] text-[#64748B]">Classification / Est. Delay</div>
                <div className="text-xs font-bold text-[#1F2937] mt-0.5">
                  {explainableCalc.classification} ·{' '}
                  <span className="font-mono text-[#B85C5C]">+{explainableCalc.estimatedDelayHours} hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Telemetry Sliders + Contribution Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive Telemetry Controls */}
            <div className="space-y-3.5">
              <div className="text-xs font-semibold text-[#1F2937] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#52677D]" />
                Live Telemetry Inputs (Adjust to Recalculate)
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#1F2937]">Weather Severity (0–100)</span>
                  <span className="font-mono font-semibold">{selectedCorridor.weatherSeverity}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedCorridor.weatherSeverity}
                  onChange={(e) =>
                    updateCorridorRiskFactors(selectedCorridor.id, {
                      weatherSeverity: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#52677D] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#1F2937]">Rainfall Intensity (mm/hr)</span>
                  <span className="font-mono font-semibold">{selectedCorridor.rainfallIntensity} mm/hr</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={70}
                  value={selectedCorridor.rainfallIntensity}
                  onChange={(e) =>
                    updateCorridorRiskFactors(selectedCorridor.id, {
                      rainfallIntensity: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#52677D] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#1F2937]">Traffic Congestion Index (0–100)</span>
                  <span className="font-mono font-semibold">{selectedCorridor.trafficCongestion}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedCorridor.trafficCongestion}
                  onChange={(e) =>
                    updateCorridorRiskFactors(selectedCorridor.id, {
                      trafficCongestion: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#52677D] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#1F2937]">Road Infrastructure Bottleneck Index</span>
                  <span className="font-mono font-semibold">{selectedCorridor.infrastructureCondition}/100</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedCorridor.infrastructureCondition}
                  onChange={(e) =>
                    updateCorridorRiskFactors(selectedCorridor.id, {
                      infrastructureCondition: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#52677D] cursor-pointer"
                />
              </div>
            </div>

            {/* Explainable Feature Contribution Table */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#1F2937]">
                Weighted Risk-Factor Attribution (Explainable AI)
              </div>
              <div className="space-y-2.5">
                {explainableCalc.factorBreakdown.map((f) => (
                  <div key={f.label} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#1F2937]">
                        {f.label}{' '}
                        <span className="text-[#64748B] font-mono">({f.weightPercent}% wt)</span>
                      </span>
                      <span className="font-mono font-semibold text-[#1F2937]">
                        +{f.contributionPoints} pts <span className="text-[#64748B]">({f.rawValue})</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded overflow-hidden">
                      <div
                        className="h-full bg-[#52677D]"
                        style={{ width: `${Math.min(100, f.contributionPoints * 3.8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Contributing Factors & Recommended Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#E2E8F0] text-xs">
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1.5">
              <div className="font-semibold text-[#1F2937]">Primary Contributing Factors</div>
              <ul className="space-y-1 text-[#64748B] list-disc list-inside">
                {selectedCorridor.contributingFactors.map((cf, i) => (
                  <li key={i}>{cf}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1.5">
              <div className="font-semibold text-[#1F2937]">Recommended Control Tower Actions</div>
              <ul className="space-y-1 text-[#64748B] list-disc list-inside">
                {selectedCorridor.recommendedActions.map((ra, i) => (
                  <li key={i}>{ra}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Affected Shipments Exposure Table (7 cols) + Historical Disruption Pattern Analysis (5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#1F2937]">
                Affected Shipments on {selectedCorridor.name} ({affectedShipments.length} Active)
              </h3>
              <p className="text-xs text-[#64748B]">
                Live shipment-level delay and penalty exposure recalculated from corridor risk score
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B]">
                  <th className="py-2.5 px-4">Shipment ID</th>
                  <th className="py-2.5 px-4">Customer & Cargo</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4 text-right">Risk Score</th>
                  <th className="py-2.5 px-4 text-right">Predicted Delay</th>
                  <th className="py-2.5 px-4 text-right">SLA Exposure</th>
                  <th className="py-2.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {affectedShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#1F2937]">{s.id}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-[#1F2937]">{s.customerName}</div>
                      <div className="text-[11px] text-[#64748B]">{s.cargoType}</div>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#1F2937]">{s.priority}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#B85C5C]">
                      {s.riskScore}/100
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">+{s.predictedDelayHours}h</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#1F2937]">
                      ₹{(s.predictedDelayHours * s.delayPenaltyPerHour).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4">
                      {s.reroutedVia ? (
                        <span className="text-[11px] font-semibold text-[#54846B]">Bypassed</span>
                      ) : (
                        <button
                          onClick={() => rerouteShipmentToBypass(s.id)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-[#52677D] text-white rounded hover:bg-[#415366] cursor-pointer"
                        >
                          Reroute
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historical Pattern Analysis (10 Historical Disruptions) */}
        <div className="xl:col-span-5 bg-white border border-[#E2E8F0] rounded-md p-4 space-y-3">
          <div className="border-b border-[#E2E8F0] pb-2.5">
            <h3 className="text-sm font-semibold text-[#1F2937]">
              Historical Corridor Disruption Log (10 Past Events)
            </h3>
            <p className="text-xs text-[#64748B]">
              Historical incident records used to calibrate baseline corridor risk weights
            </p>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {historicalAlerts.map((h) => (
              <div
                key={h.id}
                className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span className="font-mono font-semibold text-[#52677D]">
                    {h.id} · {h.corridorName} ({h.type})
                  </span>
                  <span className="font-mono">{h.timestamp}</span>
                </div>
                <div className="font-semibold text-[#1F2937]">{h.title}</div>
                <div className="text-[11px] text-[#64748B]">
                  {h.description} · <b>Observed Delay: +{h.estimatedDelayHours}h</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
