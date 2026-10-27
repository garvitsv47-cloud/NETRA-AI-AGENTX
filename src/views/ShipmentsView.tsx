import React, { useState } from 'react';
import { useNetra } from '../context/NetraContext';
import { ShipmentModal } from '../components/ShipmentModal';
import { Shipment, ShipmentStatus } from '../types/netra';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Navigation,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ShipmentsView: React.FC = () => {
  const {
    shipments,
    corridors,
    vehicles,
    drivers,
    selectedShipmentId,
    setSelectedShipmentId,
    setSelectedCorridorId,
    setSelectedDriverId,
    setActiveTab,
    updateShipment,
    deleteShipment,
    rerouteShipmentToBypass,
    globalSearchQuery,
    importShipmentsBatch,
    lastImportResult,
    operatingMode,
    setOperatingMode,
    canEnableConnectedFleetMode,
  } = useNetra();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [corridorFilter, setCorridorFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showAdapterPanel, setShowAdapterPanel] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>(
    'shipmentId,customerName,cargoType,origin,destination,expectedDeliveryDate,assignedVehicleId,status,dataTimestamp,priority,delayPenaltyPerHour\nSHP-9001,Dr. Reddys Laboratories,Cold-Chain Biologics,Delhi,Mumbai,2026-10-29,VEH-101,In Transit,2026-10-27T08:30:00Z,Critical,24000\nSHP-9002,Bharat Heavy Electricals,Industrial Switchgear,Mumbai,Pune,2026-10-28,VEH-104,At Risk,2026-10-27T09:15:00Z,High,18500'
  );
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const parseCsvAndImport = async (rawCsv: string, label: string) => {
    const lines = rawCsv
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map((h) => h.trim());
    const records = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i] || '';
      });
      return obj;
    });
    setIsImporting(true);
    try {
      await importShipmentsBatch(records, label);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      setCsvText(content);
      parseCsvAndImport(content, `CSV File (${file.name})`);
    };
    reader.readAsText(file);
  };

  const effectiveSearch = (localSearch || globalSearchQuery).trim().toLowerCase();

  const filteredShipments = shipments.filter((s) => {
    if (statusFilter === 'HIGH_RISK' && s.riskScore < 65) return false;
    else if (statusFilter !== 'ALL' && statusFilter !== 'HIGH_RISK' && s.status !== statusFilter) return false;

    if (corridorFilter !== 'ALL' && s.corridorId !== corridorFilter) return false;
    if (priorityFilter !== 'ALL' && s.priority !== priorityFilter) return false;

    if (effectiveSearch) {
      const hay = `${s.id} ${s.customerName} ${s.cargoType} ${s.origin} ${s.destination} ${s.assignedVehicleId} ${s.corridorId}`.toLowerCase();
      if (!hay.includes(effectiveSearch)) return false;
    }
    return true;
  });

  const activeSelected =
    shipments.find((s) => s.id === selectedShipmentId) || filteredShipments[0] || shipments[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B]">
            Bharat Freight Logistics Pvt. Ltd. · Centralized Shipment & SLA Ledger ({shipments.length} Total Consignments)
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
            Shipment Operations, Multi-Stop Itineraries & SLA Exposure Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAdapterPanel(!showAdapterPanel)}
            className="px-3.5 py-2 text-xs font-semibold text-[#1F2937] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded cursor-pointer"
          >
            {showAdapterPanel ? 'Hide CSV / TMS Data Adapter' : 'CSV / TMS Shipment Adapter'}
          </button>
          <button
            onClick={() => {
              setEditingShipment(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Shipment
          </button>
        </div>
      </div>

      {/* PHASE 5: Extensible Shipment Data Adapter (CSV & Authorized TMS Import + Schema Validation) */}
      {showAdapterPanel && (
        <div className="bg-white border border-[#E2E8F0] rounded-md p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <div>
              <div className="text-[11px] font-mono font-semibold text-[#52677D]">
                PHASE 5 · EXTENSIBLE SHIPMENT DATA ADAPTER (CSV & AUTHORIZED TMS API INGESTION)
              </div>
              <h2 className="text-sm font-semibold text-[#1F2937] mt-0.5">
                Import & Validate Operational Shipments (Unlocks Connected Fleet Mode)
              </h2>
              <p className="text-xs text-[#64748B]">
                Validates Shipment IDs, Origin, Destination, Delivery Deadline, Vehicle Assignment, Shipment Status, and Data Timestamps. Preserves the 40 demo shipments as sample data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 text-xs font-medium bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded cursor-pointer">
                Upload .CSV File
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                disabled={isImporting}
                onClick={() => parseCsvAndImport(csvText, 'Operator CSV / TMS Batch')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#54846B] hover:bg-[#46705A] text-white rounded cursor-pointer"
              >
                {isImporting ? 'Validating...' : 'Validate & Import Batch'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
            <div className="lg:col-span-7 space-y-1.5">
              <label className="block font-medium text-[#1F2937]">
                CSV / TMS Payload (Headers: shipmentId, customerName, cargoType, origin, destination, expectedDeliveryDate, assignedVehicleId, status, dataTimestamp)
              </label>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full p-2.5 font-mono text-[11px] bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#1F2937]"
              />
            </div>

            <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded p-3 space-y-2">
              <div className="font-semibold text-[#1F2937]">Validation & Mode Status</div>
              <div className="text-[11px] text-[#64748B]">
                Current Mode: <b className="font-mono text-[#1F2937]">{operatingMode}</b>
              </div>
              {lastImportResult ? (
                <div className="space-y-1.5">
                  <div className="font-mono text-[11px]">
                    <span className="text-[#54846B] font-bold">
                      ✓ {lastImportResult.validCount} Validated
                    </span>{' '}
                    ·{' '}
                    <span className="text-[#B85C5C] font-bold">
                      ✕ {lastImportResult.rejectedCount} Rejected
                    </span>{' '}
                    ({lastImportResult.sourceLabel})
                  </div>
                  {lastImportResult.validationIssues.length > 0 && (
                    <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-[#B85C5C] font-mono bg-white p-2 rounded border border-[#FECACA]">
                      {lastImportResult.validationIssues.map((iss, i) => (
                        <div key={i}>
                          Row {iss.rowNumber} ({iss.shipmentId}) [{iss.field}]: {iss.reason}
                        </div>
                      ))}
                    </div>
                  )}
                  {canEnableConnectedFleetMode && operatingMode !== 'CONNECTED_FLEET_MODE' && (
                    <button
                      type="button"
                      onClick={() => setOperatingMode('CONNECTED_FLEET_MODE')}
                      className="px-3 py-1 text-xs font-semibold bg-[#52677D] text-white rounded cursor-pointer"
                    >
                      Switch to Connected Fleet Mode
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-[#64748B]">
                  No external shipment batches imported yet in this session. Click "Validate & Import Batch" or upload a CSV to ingest operational records.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Shipment Detailed Inspector Card */}
      {activeSelected && (
        <div className="bg-white border border-[#E2E8F0] rounded-md p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E2E8F0] pb-3.5">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-bold font-mono text-[#1F2937]">
                  {activeSelected.id}
                </span>
                <span className="text-[#64748B]">·</span>
                <span className="text-sm font-semibold text-[#1F2937]">
                  {activeSelected.customerName}
                </span>
                <span className="text-[#64748B]">·</span>
                <span className="text-xs text-[#64748B]">
                  {activeSelected.cargoType} ({activeSelected.cargoWeightTons} Tons)
                </span>
                <span className="text-[#64748B]">·</span>
                <span
                  className={`text-xs font-semibold ${
                    activeSelected.priority === 'Critical'
                      ? 'text-[#B85C5C]'
                      : activeSelected.priority === 'High'
                      ? 'text-[#B58A45]'
                      : 'text-[#52677D]'
                  }`}
                >
                  {activeSelected.priority} Priority
                </span>
              </div>
              <div className="text-xs text-[#64748B] mt-1">
                Multi-Stop Route:{' '}
                <b className="text-[#1F2937]">
                  {activeSelected.origin} →{' '}
                  {activeSelected.intermediateStops.length
                    ? activeSelected.intermediateStops.join(' → ') + ' → '
                    : ''}
                  {activeSelected.destination}
                </b>{' '}
                ({activeSelected.corridorId})
                {activeSelected.reroutedVia && (
                  <span className="ml-2 text-[#54846B] font-semibold">
                    [Active Bypass: {activeSelected.reroutedVia}]
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {activeSelected.predictedDelayHours > 0 && !activeSelected.reroutedVia && (
                <button
                  onClick={() => rerouteShipmentToBypass(activeSelected.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#54846B] text-white rounded hover:bg-[#46705A] flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Reroute via Safer Bypass
                </button>
              )}
              <button
                onClick={() => {
                  setEditingShipment(activeSelected);
                  setIsModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Shipment
              </button>
              <button
                onClick={() => {
                  setSelectedDriverId(activeSelected.assignedDriverId);
                  setActiveTab('driver');
                }}
                className="px-3 py-1.5 text-xs font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#52677D]" />
                Driver View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-3.5 text-xs">
            <div>
              <div className="text-[#64748B]">Pickup / Deadline</div>
              <div className="font-mono font-medium text-[#1F2937] mt-0.5">
                {activeSelected.pickupDate.slice(5)} → {activeSelected.expectedDeliveryDate.slice(5)}
              </div>
            </div>
            <div>
              <div className="text-[#64748B]">Assigned Vehicle & Driver</div>
              <div className="font-mono font-medium text-[#1F2937] mt-0.5">
                {activeSelected.assignedVehicleId} · {activeSelected.assignedDriverId}
              </div>
            </div>
            <div>
              <div className="text-[#64748B]">Consignment Value</div>
              <div className="font-mono font-semibold text-[#1F2937] mt-0.5">
                ₹{activeSelected.estimatedValueINR.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[#64748B]">SLA Penalty Rate</div>
              <div className="font-mono font-semibold text-[#1F2937] mt-0.5">
                ₹{activeSelected.delayPenaltyPerHour.toLocaleString('en-IN')} / hr
              </div>
            </div>
            <div>
              <div className="text-[#64748B]">Disruption Risk Score</div>
              <div
                className={`font-mono font-bold mt-0.5 ${
                  activeSelected.riskScore >= 70
                    ? 'text-[#B85C5C]'
                    : activeSelected.riskScore >= 35
                    ? 'text-[#B58A45]'
                    : 'text-[#54846B]'
                }`}
              >
                {activeSelected.riskScore}/100
              </div>
            </div>
            <div>
              <div className="text-[#64748B]">Predicted SLA Exposure</div>
              <div className="font-mono font-bold text-[#B85C5C] mt-0.5">
                ₹
                {(
                  activeSelected.predictedDelayHours * activeSelected.delayPenaltyPerHour
                ).toLocaleString('en-IN')}{' '}
                ({activeSelected.predictedDelayHours}h)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by Shipment ID (SHP-1024), customer, city, cargo, or vehicle..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded border border-[#E2E8F0]">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'HIGH_RISK', label: 'High Risk (≥65)' },
              { key: 'Delayed', label: 'Delayed' },
              { key: 'At Risk', label: 'At Risk' },
              { key: 'In Transit', label: 'In Transit' },
              { key: 'Delivered', label: 'Delivered' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer whitespace-nowrap ${
                  statusFilter === item.key
                    ? 'bg-white text-[#1F2937] border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#1F2937]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            value={corridorFilter}
            onChange={(e) => setCorridorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="ALL">All 8 Corridors</option>
            {corridors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}: {c.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Standard">Standard</option>
          </select>
        </div>
      </div>

      {/* Shipments Operational Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B]">
                <th className="py-2.5 px-3">ID & Priority</th>
                <th className="py-2.5 px-3">Customer & Cargo</th>
                <th className="py-2.5 px-3">Origin → Stops → Destination</th>
                <th className="py-2.5 px-3">Assign Vehicle</th>
                <th className="py-2.5 px-3 text-right">Weight / Value</th>
                <th className="py-2.5 px-3 text-right">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Delay / Exposure</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#64748B]">
                    No shipments match the active search or filter criteria.
                  </td>
                </tr>
              )}
              {filteredShipments.map((shp) => {
                const exposure = shp.predictedDelayHours * shp.delayPenaltyPerHour;
                const isSelected = shp.id === activeSelected?.id;

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
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-[#1F2937]">{shp.id}</div>
                      <div
                        className={`text-[10px] font-semibold ${
                          shp.priority === 'Critical'
                            ? 'text-[#B85C5C]'
                            : shp.priority === 'High'
                            ? 'text-[#B58A45]'
                            : 'text-[#64748B]'
                        }`}
                      >
                        {shp.priority} SLA
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#1F2937] max-w-[180px] truncate">
                        {shp.customerName}
                      </div>
                      <div className="text-[11px] text-[#64748B] max-w-[180px] truncate">
                        {shp.cargoType}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#1F2937] whitespace-nowrap">
                        {shp.origin} → {shp.destination}{' '}
                        <span className="font-mono text-[11px] text-[#52677D]">({shp.corridorId})</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate max-w-[210px]">
                        {shp.reroutedVia ? (
                          <span className="text-[#54846B] font-medium">{shp.reroutedVia}</span>
                        ) : (
                          `Stops: ${shp.intermediateStops.join(' → ') || 'Direct'}`
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={shp.assignedVehicleId}
                        onChange={(e) => updateShipment(shp.id, { assignedVehicleId: e.target.value })}
                        className="px-2 py-1 text-[11px] font-mono border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
                      >
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.id} ({v.registrationNumber.slice(0, 5)})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                      <div>{shp.cargoWeightTons} T</div>
                      <div className="text-[11px] text-[#64748B]">
                        ₹{(shp.estimatedValueINR / 100000).toFixed(1)}L
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
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
                      <div className={shp.predictedDelayHours > 0 ? 'text-[#B85C5C] font-semibold' : 'text-[#54846B]'}>
                        +{shp.predictedDelayHours}h
                      </div>
                      <div className="text-[11px] text-[#1F2937]">
                        ₹{exposure.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={shp.status}
                        onChange={(e) =>
                          updateShipment(shp.id, { status: e.target.value as ShipmentStatus })
                        }
                        className={`px-2 py-1 text-[11px] font-semibold border border-[#E2E8F0] rounded bg-white ${
                          shp.status === 'Delayed'
                            ? 'text-[#B85C5C]'
                            : shp.status === 'At Risk'
                            ? 'text-[#B58A45]'
                            : 'text-[#54846B]'
                        }`}
                      >
                        <option value="In Transit">In Transit</option>
                        <option value="At Risk">At Risk</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Loading">Loading</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingShipment(shp);
                            setIsModalOpen(true);
                          }}
                          title="Edit Shipment"
                          className="p-1.5 text-[#64748B] hover:text-[#1F2937] rounded hover:bg-[#E2E8F0] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteId === shp.id ? (
                          <button
                            onClick={() => {
                              deleteShipment(shp.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-[#B85C5C] text-white rounded cursor-pointer"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(shp.id)}
                            title="Delete Shipment"
                            className="p-1.5 text-[#64748B] hover:text-[#B85C5C] rounded hover:bg-[#FEE2E2] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ShipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShipment(null);
        }}
        editingShipment={editingShipment}
      />
    </div>
  );
};
