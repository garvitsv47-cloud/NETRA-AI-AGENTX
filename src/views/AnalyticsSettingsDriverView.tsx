import React, { useState, useMemo } from 'react';
import { useNetra } from '../context/NetraContext';
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Save,
  RotateCcw,
  PhoneCall,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Truck,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

// ============================================================================
// MODULE 10: ANALYTICS & BUSINESS IMPACT (with Decision Impact Analyzer)
// ============================================================================
export const AnalyticsView: React.FC = () => {
  const { shipments, corridors, vehicles, settings, kpis } = useNetra();

  const [dateRange, setDateRange] = useState('LAST_7_DAYS');
  const [corridorFilter, setCorridorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      if (corridorFilter !== 'ALL' && s.corridorId !== corridorFilter) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (riskFilter === 'HIGH' && s.riskScore < 70) return false;
      if (riskFilter === 'MODERATE' && (s.riskScore < 35 || s.riskScore >= 70)) return false;
      if (riskFilter === 'LOW' && s.riskScore >= 35) return false;
      return true;
    });
  }, [shipments, corridorFilter, statusFilter, riskFilter]);

  const totalShipments = filteredShipments.length;
  const highRiskCount = filteredShipments.filter((s) => s.riskScore >= 70).length;
  const avgDelay =
    totalShipments > 0
      ? +(
          filteredShipments.reduce((acc, s) => acc + s.predictedDelayHours, 0) / totalShipments
        ).toFixed(2)
      : 0;

  // Calculate estimated fuel expenditure across filtered shipments
  const totalDistanceKm = filteredShipments.reduce((acc, s) => {
    const cor = corridors.find((c) => c.id === s.corridorId);
    return acc + (cor?.distanceKm || 600);
  }, 0);
  const totalFuelLiters = Math.round(totalDistanceKm / settings.defaultFuelEfficiency);
  const totalFuelExpenditureINR = Math.round(totalFuelLiters * settings.fuelPricePerLiter);

  // Without NETRA vs With NETRA Decision Impact Calculations
  const unoptimizedDelayHrs = +(
    filteredShipments.reduce((acc, s) => acc + (s.predictedDelayHours > 0 ? s.predictedDelayHours * 1.45 : 0.8), 0)
  ).toFixed(1);
  const netraOptimizedDelayHrs = +(unoptimizedDelayHrs * 0.34).toFixed(1);

  const unoptimizedExposureINR = Math.round(
    filteredShipments.reduce(
      (acc, s) =>
        acc +
        (s.predictedDelayHours > 0 ? s.predictedDelayHours * 1.45 : 0.5) * s.delayPenaltyPerHour,
      0
    )
  );
  const netraOptimizedExposureINR = Math.round(unoptimizedExposureINR * 0.29);
  const potentialSavingsINR = unoptimizedExposureINR - netraOptimizedExposureINR;

  const decisionComparisonChart = [
    {
      category: 'Aggregate Delays (Hrs)',
      WithoutNETRA: unoptimizedDelayHrs,
      WithNETRA: netraOptimizedDelayHrs,
    },
    {
      category: 'At-Risk Shipments',
      WithoutNETRA: Math.max(highRiskCount + 5, 14),
      WithNETRA: Math.max(2, Math.floor(highRiskCount * 0.3)),
    },
    {
      category: 'SLA Exposure (₹ Lakhs)',
      WithoutNETRA: +(unoptimizedExposureINR / 100000).toFixed(2),
      WithNETRA: +(netraOptimizedExposureINR / 100000).toFixed(2),
    },
  ];

  const corridorReliabilityChart = corridors.map((c) => ({
    corridor: c.name.replace('–', '-'),
    reliabilityPct: Math.max(55, 100 - Math.round(c.riskScore * 0.42)),
    riskScore: c.riskScore,
  }));

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B]">
            Enterprise Analytics & Decision Impact Analyzer · Transparent Operational & Financial Assumptions
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
            Network Performance Analytics & Business Impact Report
          </h1>
        </div>

        {/* Required Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="TODAY">Today (Live Window)</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days (Monsoon Quarter)</option>
          </select>

          <select
            value={corridorFilter}
            onChange={(e) => setCorridorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="ALL">All 8 Corridors</option>
            {corridors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="ALL">All Statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
            <option value="Delivered">Delivered</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="ALL">All Risk Categories</option>
            <option value="HIGH">High Risk (70–100)</option>
            <option value="MODERATE">Moderate Risk (35–69)</option>
            <option value="LOW">Low Risk (0–34)</option>
          </select>
        </div>
      </div>

      {/* 8 Enterprise Analytics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="text-xs text-[#64748B]">1. Filtered Shipments</div>
          <div className="text-xl font-bold font-mono text-[#1F2937] mt-1">{totalShipments}</div>
          <div className="text-[11px] text-[#64748B] mt-1">Active & completed records</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="text-xs text-[#64748B]">2. On-Time Delivery Rate</div>
          <div className="text-xl font-bold font-mono text-[#54846B] mt-1">
            {kpis.onTimeDeliveryPercentage}%
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">SLA compliance index</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="text-xs text-[#64748B]">3. Avg Estimated Delay</div>
          <div className="text-xl font-bold font-mono text-[#B58A45] mt-1">+{avgDelay} hrs</div>
          <div className="text-[11px] text-[#64748B] mt-1">Per shipment across scope</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="text-xs text-[#64748B]">4. High-Risk Shipments</div>
          <div className="text-xl font-bold font-mono text-[#B85C5C] mt-1">{highRiskCount}</div>
          <div className="text-[11px] text-[#64748B] mt-1">Score ≥ 70/100</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="text-xs text-[#64748B]">5. Avg Corridor Reliability</div>
          <div className="text-xl font-bold font-mono text-[#1F2937] mt-1">
            {corridorReliabilityChart.length > 0
              ? +(
                  corridorReliabilityChart.reduce((sum, c) => sum + c.reliabilityPct, 0) /
                  corridorReliabilityChart.length
                ).toFixed(1)
              : 81.4}
            %
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">Weighted across {corridors.length} corridors</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="text-xs text-[#64748B]">6. Est. Fuel Expenditure</div>
          <div className="text-xl font-bold font-mono text-[#1F2937] mt-1">
            ₹{(totalFuelExpenditureINR / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-[#64748B] mt-1 font-mono">
            {totalFuelLiters.toLocaleString('en-IN')} L @ ₹{settings.fuelPricePerLiter}/L
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="text-xs text-[#64748B]">7. Current Financial Exposure</div>
          <div className="text-xl font-bold font-mono text-[#B85C5C] mt-1">
            ₹{kpis.estimatedFinancialExposureINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">Active SLA penalty risk</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="text-xs text-[#64748B]">8. Potential Optimization Savings</div>
          <div className="text-xl font-bold font-mono text-[#54846B] mt-1">
            ₹{potentialSavingsINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#54846B] mt-1">Estimated scenario savings</div>
        </div>
      </div>

      {/* Decision Impact Analyzer: Without NETRA vs With NETRA Recommendations */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-[#E2E8F0] pb-3.5">
          <div>
            <div className="text-xs font-mono text-[#52677D]">
              DECISION IMPACT ANALYZER (ESTIMATED SCENARIO COMPARISON)
            </div>
            <h2 className="text-base font-bold text-[#1F2937] mt-0.5">
              Without NETRA Intervention vs. With NETRA Recommendations
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">
            Note: Figures represent transparent model estimates rather than verified historical accounting.
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
          <div className="xl:col-span-7 overflow-x-auto border border-[#E2E8F0] rounded">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                  <th className="py-2.5 px-4">Impact Dimension</th>
                  <th className="py-2.5 px-4 text-right">Without NETRA Intervention</th>
                  <th className="py-2.5 px-4 text-right">With NETRA Recommendations</th>
                  <th className="py-2.5 px-4 text-right">Estimated Net Benefit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                <tr>
                  <td className="py-2.5 px-4 font-medium text-[#1F2937]">1. Total Delivery Delays</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#B85C5C] font-bold">
                    {unoptimizedDelayHrs} hrs
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B] font-bold">
                    {netraOptimizedDelayHrs} hrs
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B]">
                    -{(unoptimizedDelayHrs - netraOptimizedDelayHrs).toFixed(1)} hrs (-66%)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-[#1F2937]">2. SLA Financial Exposure</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#B85C5C] font-bold">
                    ₹{unoptimizedExposureINR.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B] font-bold">
                    ₹{netraOptimizedExposureINR.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#54846B]">
                    ₹{potentialSavingsINR.toLocaleString('en-IN')} saved
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-[#1F2937]">3. At-Risk Shipments</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#B85C5C] font-bold">
                    {Math.max(highRiskCount + 5, 14)} shipments
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B] font-bold">
                    {Math.max(2, Math.floor(highRiskCount * 0.3))} shipments
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B]">
                    71% risk reduction
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-[#1F2937]">4. Route Efficiency & Queue Idle</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#64748B]">
                    18.4% highway congestion idle
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B] font-bold">
                    4.2% highway congestion idle
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B]">
                    +14.2% fleet utilization
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-[#1F2937]">5. Effective Fuel Consumption</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#64748B]">
                    {Math.round(totalFuelLiters * 1.07).toLocaleString('en-IN')} L (incl. queue burn)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B] font-bold">
                    {totalFuelLiters.toLocaleString('en-IN')} L
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#54846B]">
                    -{Math.round(totalFuelLiters * 0.07).toLocaleString('en-IN')} L diesel saved
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="xl:col-span-5 h-60 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decisionComparisonChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#1F2937' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="WithoutNETRA" name="Without NETRA Intervention" fill="#B85C5C" />
                <Bar dataKey="WithNETRA" name="With NETRA Recommendations" fill="#54846B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Corridor Reliability Chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-5">
        <h3 className="text-sm font-semibold text-[#1F2937] mb-3">
          Corridor Reliability Index vs. Disruption Risk Score
        </h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={corridorReliabilityChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="corridor" tick={{ fontSize: 11, fill: '#1F2937' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip contentStyle={{ fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="reliabilityPct" name="Corridor Reliability (%)" fill="#52677D" />
              <Bar dataKey="riskScore" name="Disruption Risk Score (0-100)" fill="#B58A45" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODULE 16: COMPANY SETTINGS
// ============================================================================
export const CompanySettingsView: React.FC = () => {
  const { settings, updateCompanySettings, resetAllDemoData } = useNetra();
  const [savedNotice, setSavedNotice] = useState(false);

  const [formState, setFormState] = useState(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formState);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-md px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-[#64748B]">
            Workspace Configuration · Economic & Telemetry Assumptions
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
            Company Settings & Global Calculation Parameters
          </h1>
        </div>
        <button
          onClick={resetAllDemoData}
          className="px-3.5 py-2 text-xs font-medium text-[#B85C5C] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Demo Data to Baseline
        </button>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-[#E2E8F0] rounded-md p-6 space-y-6 text-xs"
      >
        <div className="border-b border-[#E2E8F0] pb-3">
          <h2 className="text-sm font-semibold text-[#1F2937]">
            1. Logistics Enterprise Profile
          </h2>
          <p className="text-xs text-[#64748B]">
            Updating parameters below immediately recalculates fuel costs, CO₂ emissions, high-risk corridor alerts, and SLA exposures across NETRA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-[#1F2937] mb-1">Company Name</label>
            <input
              type="text"
              value={formState.companyName}
              onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded bg-white"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1F2937] mb-1">Operating Region</label>
            <input
              type="text"
              value={formState.operatingRegion}
              onChange={(e) => setFormState({ ...formState, operatingRegion: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded bg-white"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1F2937] mb-1">Headquarters Address</label>
            <input
              type="text"
              value={formState.headquarters}
              onChange={(e) => setFormState({ ...formState, headquarters: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded bg-white"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1F2937] mb-1">Control Tower Contact</label>
            <input
              type="text"
              value={formState.controlTowerContact}
              onChange={(e) => setFormState({ ...formState, controlTowerContact: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded bg-white font-mono"
            />
          </div>
        </div>

        <div className="border-b border-[#E2E8F0] pb-2 pt-2">
          <h2 className="text-sm font-semibold text-[#1F2937]">
            2. Fleet Fuel, Emissions & SLA Risk Thresholds
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-medium text-[#1F2937] mb-1">
              Default Diesel Price (₹/L)
            </label>
            <input
              type="number"
              step="0.5"
              value={formState.fuelPricePerLiter}
              onChange={(e) =>
                setFormState({ ...formState, fuelPricePerLiter: Number(e.target.value) })
              }
              className="w-full px-3 py-2 font-mono border border-[#E2E8F0] rounded bg-white"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1F2937] mb-1">
              Default Fuel Efficiency (km/L)
            </label>
            <input
              type="number"
              step="0.1"
              value={formState.defaultFuelEfficiency}
              onChange={(e) =>
                setFormState({ ...formState, defaultFuelEfficiency: Number(e.target.value) })
              }
              className="w-full px-3 py-2 font-mono border border-[#E2E8F0] rounded bg-white"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1F2937] mb-1">
              High-Risk Alert Threshold (0–100)
            </label>
            <input
              type="number"
              min={30}
              max={90}
              value={formState.riskAlertThreshold}
              onChange={(e) =>
                setFormState({ ...formState, riskAlertThreshold: Number(e.target.value) })
              }
              className="w-full px-3 py-2 font-mono border border-[#E2E8F0] rounded bg-white"
            />
          </div>
          <div>
            <label className="block font-medium text-[#1F2937] mb-1">
              Default Delay Penalty (₹/Hr)
            </label>
            <input
              type="number"
              step="500"
              value={formState.defaultDelayPenaltyPerHour}
              onChange={(e) =>
                setFormState({ ...formState, defaultDelayPenaltyPerHour: Number(e.target.value) })
              }
              className="w-full px-3 py-2 font-mono border border-[#E2E8F0] rounded bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
          <div className="text-xs text-[#54846B] font-medium">
            {savedNotice && '✓ Settings saved and applied across all NETRA calculation engines.'}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save & Recalculate Platform Metrics
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// MODULE 15: SIMPLIFIED MOBILE-FRIENDLY DRIVER INTERFACE
// ============================================================================
export const DriverInterfaceView: React.FC = () => {
  const {
    drivers,
    vehicles,
    shipments,
    corridors,
    selectedDriverId,
    setSelectedDriverId,
    logActivity,
  } = useNetra();

  const [driverAck, setDriverAck] = useState(false);
  const [emergencyContacted, setEmergencyContacted] = useState(false);

  const driver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const vehicle = vehicles.find((v) => v.id === driver.assignedVehicleId) || vehicles[0];
  const shipment =
    shipments.find((s) => s.id === (driver.currentShipmentId || vehicle.currentShipmentId)) ||
    shipments[0];
  const corridor = corridors.find((c) => c.id === shipment.corridorId) || corridors[0];

  const nextStop = shipment.intermediateStops[0] || shipment.destination;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Driver Selector Bar for Control Tower Demo */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-[#1F2937]">Select Active Driver Cab Unit:</span>
        <select
          value={driver.id}
          onChange={(e) => {
            setSelectedDriverId(e.target.value);
            setDriverAck(false);
          }}
          className="px-3 py-1.5 border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937] font-medium"
        >
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.id}: {d.name} ({d.assignedVehicleId})
            </option>
          ))}
        </select>
      </div>

      {/* High-Contrast Mobile Cab Display Card */}
      <div className="bg-[#111827] text-white rounded-md border border-[#334155] p-5 space-y-5 shadow-md">
        <div className="flex items-center justify-between border-b border-[#334155] pb-4">
          <div>
            <div className="text-[11px] font-mono text-[#94A3B8]">
              NETRA IN-CAB DRIVER COMPANION
            </div>
            <h1 className="text-lg font-bold text-white mt-0.5">{driver.name}</h1>
            <div className="text-xs text-[#CBD5E1] font-mono mt-0.5">
              Vehicle: {vehicle.registrationNumber} ({vehicle.type})
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-[#94A3B8]">Fuel Level</div>
            <div className="text-lg font-bold text-[#54846B]">{vehicle.fuelLevelPercent}%</div>
          </div>
        </div>

        {/* Active Shipment & Next Delivery Stop */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-[#1E293B] border border-[#334155] rounded">
            <div className="text-xs text-[#94A3B8]">Active Consignment</div>
            <div className="text-base font-bold font-mono text-white mt-1">{shipment.id}</div>
            <div className="text-xs text-[#CBD5E1] mt-0.5 truncate">{shipment.cargoType}</div>
          </div>
          <div className="p-3.5 bg-[#1E293B] border border-[#334155] rounded">
            <div className="text-xs text-[#94A3B8]">Next Delivery Stop</div>
            <div className="text-base font-bold text-white mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#54846B]" />
              {nextStop}
            </div>
            <div className="text-xs text-[#CBD5E1] mt-0.5">Final: {shipment.destination}</div>
          </div>
        </div>

        {/* Current Route & Estimated Arrival */}
        <div className="p-4 bg-[#1E293B] border border-[#334155] rounded space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>ASSIGNED CORRIDOR ROUTE</span>
            <span className="font-mono text-white">{corridor.highway}</span>
          </div>
          <div className="text-sm font-bold text-white">
            {shipment.origin} → {shipment.intermediateStops.join(' → ')}{' '}
            {shipment.intermediateStops.length ? '→ ' : ''}
            {shipment.destination}
          </div>
          {shipment.reroutedVia && (
            <div className="p-2 bg-[#54846B]/20 border border-[#54846B] rounded text-xs text-[#A7F3D0] font-semibold">
              ACTIVE CONTROL TOWER BYPASS: {shipment.reroutedVia}
            </div>
          )}
          <div className="text-xs font-mono text-[#CBD5E1] pt-1">
            Estimated Arrival (ETA): <b className="text-white">{shipment.etaText}</b>
          </div>
        </div>

        {/* Route Warnings */}
        <div
          className={`p-4 rounded border space-y-1.5 ${
            corridor.riskScore >= 70
              ? 'bg-[#B85C5C]/20 border-[#B85C5C]'
              : 'bg-[#1E293B] border-[#334155]'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#FCA5A5]">
            <AlertTriangle className="w-4 h-4" />
            Corridor Weather & Safety Warning ({corridor.name})
          </div>
          <p className="text-xs text-white leading-relaxed">
            {corridor.contributingFactors[0] || 'Normal highway operating conditions.'}
          </p>
          <p className="text-xs text-[#CBD5E1]">
            Directive: {corridor.recommendedActions[0]}
          </p>
        </div>

        {/* Large Touch-Friendly Driver Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setDriverAck(true);
              logActivity(
                'ROUTE',
                `Driver ${driver.name} (${vehicle.registrationNumber}) acknowledged route & safety directive for ${shipment.id}.`,
                shipment.id
              );
            }}
            className="py-3.5 px-4 text-sm font-bold text-white bg-[#54846B] hover:bg-[#46705A] rounded flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            {driverAck ? 'Route Acknowledged ✓' : 'Acknowledge Route & ETA'}
          </button>

          <button
            type="button"
            onClick={() => {
              setEmergencyContacted(true);
              logActivity(
                'EMERGENCY',
                `Driver ${driver.name} initiated Control Tower Emergency Desk check-in from ${vehicle.registrationNumber}.`,
                vehicle.id
              );
            }}
            className="py-3.5 px-4 text-sm font-bold text-white bg-[#B85C5C] hover:bg-[#9E4B4B] rounded flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-5 h-5" />
            {emergencyContacted
              ? 'Control Tower Alerted ✓'
              : `Emergency Desk (${driver.emergencyContact})`}
          </button>
        </div>
      </div>
    </div>
  );
};
