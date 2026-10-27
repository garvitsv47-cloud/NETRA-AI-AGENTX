import React from 'react';
import { useNetra } from '../context/NetraContext';
import { ChevronLeft, ChevronRight, RotateCcw, X, Play, CheckCircle2 } from 'lucide-react';

const DEMO_STAGES = [
  {
    stage: 1,
    shortLabel: '1. Monitor',
    title: 'Stage 1 — Monitor: Bharat Freight Operations Control Tower',
    scenarioSummary:
      'Monitoring 40 shipments, 25 commercial vehicles, and 8 national freight corridors. Notice NH48 (Delhi–Mumbai) and SHP-1024 (Cipla Pharmaceutical Cold-Chain) flagged for active monsoon disruption.',
    actionLabel: 'Inspect Risk Prediction →',
  },
  {
    stage: 2,
    shortLabel: '2. Predict',
    title: 'Stage 2 — Predict: Explainable AI Corridor Risk Scoring (78/100 High Risk)',
    scenarioSummary:
      'NETRA scores Delhi–Mumbai (NH48) at 78/100 due to 48 mm/hr heavy rainfall in the Bharuch–Vadodara sector, Narmada bridge congestion (79%), and historical waterlogging frequency.',
    actionLabel: 'Analyze Affected Shipments →',
  },
  {
    stage: 3,
    shortLabel: '3. Analyze',
    title: 'Stage 3 — Analyze: Shipment-Level Delay & SLA Financial Exposure',
    scenarioSummary:
      '7 active shipments on NH48 are directly exposed. Critical cold-chain shipment SHP-1024 faces a +5.5 hour delay and ₹1,21,000 SLA penalty exposure.',
    actionLabel: 'Optimize Fleet Routes →',
  },
  {
    stage: 4,
    shortLabel: '4. Optimize',
    title: 'Stage 4 — Optimize: Multi-Stop & Fleet-Level Route Comparison',
    scenarioSummary:
      'Comparing primary NH48 vs. Eastern Bypass (Kota → Ujjain → Indore → Dhule). Diverting SHP-1024 adds 127 km fuel cost (+₹2,850) but eliminates ₹1,21,000 in SLA delay penalties.',
    actionLabel: 'Consult NETRA AI Agent →',
  },
  {
    stage: 5,
    shortLabel: '5. Explain',
    title: 'Stage 5 — Explain: Autonomous Gemini AI Agent & Grounded Policy Check',
    scenarioSummary:
      'NETRA AI Agent executes operational tools (getShipmentDetails, compareRoutes, retrieveCompanyKnowledge) and cites Cold-Chain Policy Section 4.2 to justify immediate bypass diversion.',
    actionLabel: 'Demonstrate Digital Twin Impact →',
  },
  {
    stage: 6,
    shortLabel: '6. Impact',
    title: 'Stage 6 — Demonstrate Impact: Before vs. After NETRA Intervention',
    scenarioSummary:
      'Digital Twin Simulator quantifies network-wide impact: Aggregate fleet delay drops by 69% (from 38.5h to 11.2h) and financial SLA exposure drops from ₹7,42,000 to ₹1,98,000.',
    actionLabel: 'Complete Guided Tour',
  },
];

export const HackathonDemoBar: React.FC = () => {
  const { demoStage, setDemoStage, resetAllDemoData, rerouteShipmentToBypass } = useNetra();

  if (demoStage === null) return null;

  const current = DEMO_STAGES.find((s) => s.stage === demoStage) || DEMO_STAGES[0];

  return (
    <div className="bg-[#111827] text-white border-b border-[#334155] px-6 py-3.5 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
              Guided Hackathon Scenario: NH48 Freight Disruption (Simulated Telemetry)
            </span>
            <span className="text-[#475569]">·</span>
            <div className="flex items-center gap-1">
              {DEMO_STAGES.map((st) => (
                <button
                  key={st.stage}
                  onClick={() => setDemoStage(st.stage)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                    st.stage === demoStage
                      ? 'bg-[#52677D] text-white'
                      : st.stage < demoStage
                      ? 'bg-[#1E293B] text-[#CBD5E1] hover:bg-[#334155]'
                      : 'text-[#64748B] hover:text-[#CBD5E1]'
                  }`}
                >
                  {st.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-sm font-semibold text-white">{current.title}</h2>
          <p className="text-xs text-[#CBD5E1] max-w-4xl leading-relaxed">{current.scenarioSummary}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {demoStage === 4 && (
            <button
              onClick={() => rerouteShipmentToBypass('SHP-1024')}
              className="px-3 py-1.5 text-xs font-medium bg-[#54846B] hover:bg-[#46705A] text-white rounded flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Apply SHP-1024 Bypass Now
            </button>
          )}

          <button
            onClick={() => setDemoStage(Math.max(1, demoStage - 1))}
            disabled={demoStage <= 1}
            className="px-2.5 py-1.5 text-xs font-medium bg-[#1E293B] hover:bg-[#334155] disabled:opacity-40 text-white rounded border border-[#334155] flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          {demoStage < 6 ? (
            <button
              onClick={() => setDemoStage(demoStage + 1)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#52677D] hover:bg-[#647D96] text-white rounded flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Next: {DEMO_STAGES[demoStage].shortLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setDemoStage(null)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#54846B] hover:bg-[#46705A] text-white rounded flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              Finish Guided Demo
            </button>
          )}

          <button
            onClick={resetAllDemoData}
            title="Reset Demo Scenario to Baseline"
            className="px-2.5 py-1.5 text-xs font-medium bg-[#1E293B] hover:bg-[#334155] text-[#CBD5E1] rounded border border-[#334155] flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo
          </button>

          <button
            onClick={() => setDemoStage(null)}
            title="Close Demo Guide"
            className="p-1.5 text-[#94A3B8] hover:text-white rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
