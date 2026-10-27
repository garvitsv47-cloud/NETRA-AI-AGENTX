import React, { useState } from 'react';
import { useNetra } from '../context/NetraContext';
import { CorridorMap } from '../components/CorridorMap';
import {
  Truck,
  UserCheck,
  ShieldAlert,
  Phone,
  CheckCircle2,
  MapPin,
  Smartphone,
  Activity,
} from 'lucide-react';

export const FleetEmergencyView: React.FC = () => {
  const {
    vehicles,
    drivers,
    shipments,
    emergencyIncidents,
    selectedVehicleId,
    setSelectedVehicleId,
    setSelectedDriverId,
    setSelectedShipmentId,
    setActiveTab,
    confirmEmergencyDispatch,
    traccarStatus,
    operatingMode,
    refreshLiveTelemetry,
    updateTraccarDeviceMapping,
  } = useNetra();

  const [subTab, setSubTab] = useState<'FLEET' | 'DRIVERS' | 'EMERGENCY'>('FLEET');
  const [mapDeviceInput, setMapDeviceInput] = useState<string>('');
  const [mapVehicleSelect, setMapVehicleSelect] = useState<string>('VEH-101');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    emergencyIncidents[0]?.id || 'EMG-201'
  );
  const [selectedHospitalIdx, setSelectedHospitalIdx] = useState<number>(1);
  const [emergencyNote, setEmergencyNote] = useState<string>(
    'PROTOTYPE SIMULATION: Dispatching Highway Patrol & alerting trauma triage unit for VEH-103 brake thermal emergency.'
  );

  const selectedIncident =
    emergencyIncidents.find((i) => i.id === selectedIncidentId) || emergencyIncidents[0];
  const chosenHospital =
    selectedIncident?.nearbyHospitals[selectedHospitalIdx] ||
    selectedIncident?.nearbyHospitals[0];

  const filteredVehicles = vehicles.filter((v) =>
    statusFilter === 'ALL' ? true : v.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B]">
            Bharat Freight Logistics Pvt. Ltd. · 25 Commercial Vehicles · 12 Licensed Long-Haul Drivers · Emergency Triage
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
            Fleet Operations, Driver Roster & Emergency Response Intelligence
          </h1>
        </div>

        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded border border-[#E2E8F0]">
          <button
            onClick={() => setSubTab('FLEET')}
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'FLEET'
                ? 'bg-[#52677D] text-white'
                : 'text-[#64748B] hover:text-[#1F2937]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Commercial Fleet (25)
          </button>
          <button
            onClick={() => setSubTab('DRIVERS')}
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'DRIVERS'
                ? 'bg-[#52677D] text-white'
                : 'text-[#64748B] hover:text-[#1F2937]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Driver Roster (12)
          </button>
          <button
            onClick={() => setSubTab('EMERGENCY')}
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'EMERGENCY'
                ? 'bg-[#B85C5C] text-white'
                : 'text-[#B85C5C] hover:bg-[#FEF2F2]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Emergency Response Intelligence
          </button>
        </div>
      </div>

      {subTab === 'FLEET' && (
        <div className="space-y-6">
          {/* Fleet Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
              <div className="text-xs text-[#64748B]">Active En Route</div>
              <div className="text-2xl font-bold font-mono text-[#54846B] mt-1">
                {vehicles.filter((v) => v.status === 'Active En Route').length}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Cruising at 45–65 km/h</div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
              <div className="text-xs text-[#64748B]">Delayed in Congestion</div>
              <div className="text-2xl font-bold font-mono text-[#B85C5C] mt-1">
                {vehicles.filter((v) => v.status === 'Delayed in Congestion').length}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">NH48 & Mumbai–Pune Ghat</div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
              <div className="text-xs text-[#64748B]">At Hub / Loading</div>
              <div className="text-2xl font-bold font-mono text-[#52677D] mt-1">
                {vehicles.filter((v) => v.status === 'At Hub / Loading').length}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Gurugram ICD Terminal</div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
              <div className="text-xs text-[#64748B]">Avg Fleet Fuel Efficiency</div>
              <div className="text-2xl font-bold font-mono text-[#1F2937] mt-1">
                {vehicles.length > 0
                  ? +(
                      vehicles.reduce((sum, v) => sum + v.fuelEfficiencyKmPerL, 0) / vehicles.length
                    ).toFixed(2)
                  : 4.2}{' '}
                km/L
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Across Reefer, 32ft & 40ft</div>
            </div>
          </div>

          {/* PHASE 4: Real GPS & Fleet Tracking (Traccar Integration & Explicit Mapping) */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div>
                <div className="text-[11px] font-mono font-semibold text-[#52677D]">
                  PHASE 4 · REAL GPS & FLEET TRACKING PROVIDER (TRACCAR REST / WEBSOCKET ADAPTER)
                </div>
                <div className="text-sm font-semibold text-[#1F2937] mt-0.5 flex items-center gap-2">
                  <span>Status:</span>
                  <span
                    className={`font-mono ${
                      traccarStatus.connected ? 'text-[#54846B]' : 'text-[#B58A45]'
                    }`}
                  >
                    {traccarStatus.statusMessage}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[11px] font-mono text-[#1F2937]">
                  Active Fleet Dataset:{' '}
                  <b>
                    {operatingMode === 'CONNECTED_FLEET_MODE' && traccarStatus.connected
                      ? 'LIVE TRACCAR GPS'
                      : 'DEMO DATA (25 Sample Vehicles — Simulated Coordinates)'}
                  </b>
                </span>
                <button
                  type="button"
                  onClick={() => refreshLiveTelemetry(true)}
                  className="px-2.5 py-1 text-xs font-medium bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded cursor-pointer"
                >
                  Check Traccar Connection
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              <div className="lg:col-span-7 space-y-2">
                <div className="font-semibold text-[#1F2937]">
                  Registered Traccar GPS Devices ({traccarStatus.liveVehicles.length})
                </div>
                {traccarStatus.liveVehicles.length === 0 ? (
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#64748B] font-mono text-[11px]">
                    Live fleet tracking not connected. Configure server-side TRACCAR_BASE_URL and TRACCAR_API_TOKEN (or TRACCAR_USERNAME / TRACCAR_PASSWORD) to stream live GPS coordinates. The 25 vehicles below are explicitly labeled as DEMO DATA.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#E2E8F0] rounded">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-[#64748B]">
                          <th className="py-1.5 px-2.5">Traccar Device</th>
                          <th className="py-1.5 px-2.5">Mapped NETRA ID</th>
                          <th className="py-1.5 px-2.5">Live GPS Coords</th>
                          <th className="py-1.5 px-2.5">Speed / Fix Time</th>
                          <th className="py-1.5 px-2.5">Connectivity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {traccarStatus.liveVehicles.map((tv) => (
                          <tr key={tv.traccarDeviceId}>
                            <td className="py-1.5 px-2.5 font-mono">
                              #{tv.traccarDeviceId} ({tv.deviceName})
                            </td>
                            <td className="py-1.5 px-2.5 font-mono font-semibold text-[#52677D]">
                              {tv.mappedNetraVehicleId || 'Unmapped'}
                            </td>
                            <td className="py-1.5 px-2.5 font-mono">
                              {tv.lat !== null && tv.lng !== null
                                ? `${tv.lat.toFixed(4)}, ${tv.lng.toFixed(4)}`
                                : 'No Fix'}
                            </td>
                            <td className="py-1.5 px-2.5 font-mono">
                              {tv.speedKmh ?? 0} km/h · {tv.lastPositionTimestamp || 'N/A'}
                            </td>
                            <td className="py-1.5 px-2.5 font-mono">{tv.connectivityStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded p-3 space-y-2">
                <div className="font-semibold text-[#1F2937]">
                  Explicit Traccar Device → NETRA Vehicle ID Mapping
                </div>
                <p className="text-[11px] text-[#64748B]">
                  NETRA does not invent device-to-vehicle mappings. Bind an authorized Traccar Device ID to a NETRA Vehicle ID:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={mapDeviceInput}
                    onChange={(e) => setMapDeviceInput(e.target.value)}
                    placeholder="Traccar Device ID (e.g. 101)"
                    className="px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded w-44 font-mono"
                  />
                  <select
                    value={mapVehicleSelect}
                    onChange={(e) => setMapVehicleSelect(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded font-mono flex-1"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.id} ({v.registrationNumber})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const idNum = Number(mapDeviceInput);
                      if (idNum > 0) {
                        updateTraccarDeviceMapping(idNum, mapVehicleSelect);
                        setMapDeviceInput('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#52677D] text-white rounded hover:bg-[#415366] cursor-pointer"
                  >
                    Bind ID
                  </button>
                </div>
                {Object.keys(traccarStatus.deviceMappings).length > 0 && (
                  <div className="text-[11px] font-mono text-[#54846B] pt-1">
                    Configured Mappings:{' '}
                    {Object.entries(traccarStatus.deviceMappings)
                      .map(([d, v]) => `Device #${d} → ${v}`)
                      .join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fleet Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#1F2937]">
                  Commercial Vehicle Fleet Telemetry (DEMO DATA MODE — Simulated Positions)
                </h2>
                <p className="text-xs text-[#64748B]">
                  25 demonstration vehicles preserved in labeled DEMO DATA mode. Simulated coordinates are never labeled as live GPS.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 bg-[#F8FAFC] p-1 rounded border border-[#E2E8F0]">
                {[
                  'ALL',
                  'Active En Route',
                  'Delayed in Congestion',
                  'At Hub / Loading',
                  'Maintenance Alert',
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-white text-[#1F2937] border border-[#E2E8F0]'
                        : 'text-[#64748B] hover:text-[#1F2937]'
                    }`}
                  >
                    {st === 'ALL' ? `All ${vehicles.length} Vehicles` : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B]">
                    <th className="py-2.5 px-4">Vehicle ID & Registration</th>
                    <th className="py-2.5 px-4">Body Type & Tonnage</th>
                    <th className="py-2.5 px-4">Assigned Driver</th>
                    <th className="py-2.5 px-4">Active Shipment</th>
                    <th className="py-2.5 px-4">Corridor</th>
                    <th className="py-2.5 px-4 text-right">Speed / Fuel</th>
                    <th className="py-2.5 px-4">Telemetry Status</th>
                    <th className="py-2.5 px-4">Driver View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {filteredVehicles.map((veh) => {
                    const drv = drivers.find((d) => d.id === veh.driverId);
                    const shp = shipments.find((s) => s.id === veh.currentShipmentId);
                    const isSelected = veh.id === selectedVehicleId;

                    return (
                      <tr
                        key={veh.id}
                        onClick={() => setSelectedVehicleId(veh.id)}
                        className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#F1F5F9]' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <div className="font-mono font-semibold text-[#1F2937]">
                            {veh.registrationNumber}
                          </div>
                          <div className="text-[11px] font-mono text-[#64748B]">{veh.id}</div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="text-[#1F2937] font-medium">{veh.type}</div>
                          <div className="text-[11px] font-mono text-[#64748B]">
                            {veh.capacityTons}T · {veh.fuelEfficiencyKmPerL} km/L
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="text-[#1F2937]">{drv?.name || 'Assigned Driver'}</div>
                          <div className="text-[11px] font-mono text-[#64748B]">{drv?.phone}</div>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {shp ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShipmentId(shp.id);
                                setActiveTab('shipments');
                              }}
                              className="font-mono font-semibold text-[#52677D] hover:underline cursor-pointer"
                            >
                              {shp.id} ({shp.origin}→{shp.destination})
                            </button>
                          ) : (
                            <span className="text-[#64748B]">Standby / Unassigned</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#1F2937]">{veh.corridorId}</td>
                        <td className="py-2.5 px-4 text-right font-mono whitespace-nowrap">
                          <div>{veh.speedKmh} km/h</div>
                          <div className="text-[11px] text-[#64748B]">{veh.fuelLevelPercent}% Diesel</div>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-semibold ${
                              veh.status === 'Delayed in Congestion' || veh.status === 'Maintenance Alert'
                                ? 'text-[#B85C5C]'
                                : veh.status === 'At Hub / Loading'
                                ? 'text-[#B58A45]'
                                : 'text-[#54846B]'
                            }`}
                          >
                            {veh.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (drv) setSelectedDriverId(drv.id);
                              setActiveTab('driver');
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Smartphone className="w-3 h-3 text-[#52677D]" />
                            Driver View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'DRIVERS' && (
        <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0]">
            <h2 className="text-sm font-semibold text-[#1F2937]">
              Commercial Long-Haul Driver Roster (12 Operators)
            </h2>
            <p className="text-xs text-[#64748B]">
              Verified Indian HMV driving licenses, shift hours remaining, safety scores, and direct Driver View launch
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B]">
                  <th className="py-2.5 px-4">Driver ID & Name</th>
                  <th className="py-2.5 px-4">HMV License Number</th>
                  <th className="py-2.5 px-4">Contact Phone</th>
                  <th className="py-2.5 px-4">Assigned Vehicle</th>
                  <th className="py-2.5 px-4">Current Shipment</th>
                  <th className="py-2.5 px-4 text-right">Safety Score</th>
                  <th className="py-2.5 px-4 text-right">Shift Remaining</th>
                  <th className="py-2.5 px-4">Duty Status</th>
                  <th className="py-2.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {drivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-medium text-[#1F2937]">
                      <span className="font-mono text-[#64748B] mr-2">{drv.id}</span>
                      {drv.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#64748B]">{drv.licenseNumber}</td>
                    <td className="py-3 px-4 font-mono text-[#1F2937]">{drv.phone}</td>
                    <td className="py-3 px-4 font-mono text-[#1F2937]">{drv.assignedVehicleId}</td>
                    <td className="py-3 px-4 font-mono text-[#52677D] font-semibold">
                      {drv.currentShipmentId || 'Standby'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#54846B]">
                      {drv.safetyScore}/100
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{drv.shiftHoursRemaining} hrs</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold ${
                          drv.dutyStatus === 'On Duty - Driving' ? 'text-[#54846B]' : 'text-[#B58A45]'
                        }`}
                      >
                        {drv.dutyStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedDriverId(drv.id);
                          setActiveTab('driver');
                        }}
                        className="px-2.5 py-1 text-xs font-medium bg-[#52677D] text-white rounded hover:bg-[#415366] cursor-pointer"
                      >
                        Open Driver App
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'EMERGENCY' && (
        <div className="space-y-6">
          {/* Prototype Simulation Notice Banner */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-md px-4 py-3 flex items-center justify-between gap-4 text-xs text-[#92400E]">
            <div>
              <span className="font-bold">PROTOTYPE SIMULATION MODE:</span> Emergency response dispatch is a simulated control-tower workflow. NETRA explicitly distinguishes{' '}
              <b>Confirmed Vehicle Incidents</b> from <b>Predicted Accident-Risk Blackspots</b> and never automatically dispatches real emergency services.
            </div>
            <span className="font-mono text-[11px] shrink-0">SOP Section 5.3 Compliant</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left 7 cols: Map with Hotspots & Nearby Trauma Hospitals */}
            <div className="xl:col-span-7 bg-white border border-[#E2E8F0] rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#1F2937]">
                    Highway Incident Locations, Blackspots & Nearby Trauma Hospitals (H)
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Showing SOS incident pins and verified highway trauma hospitals with estimated ambulance travel time
                  </p>
                </div>
              </div>
              <CorridorMap heightClass="h-[440px]" showHospitalsAndEmergencies={true} />
            </div>

            {/* Right 5 cols: 5-Step Simulated Emergency-Response Workflow */}
            <div className="xl:col-span-5 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="border-b border-[#E2E8F0] pb-2.5">
                  <h2 className="text-sm font-semibold text-[#1F2937]">
                    5-Step Simulated Emergency Response Workflow
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Review incident → Inspect location → Select nearby hospital → Prepare notification → Confirm simulated response
                  </p>
                </div>

                {/* Step 1: Review Reported Incident vs Predicted Risk */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">
                    Step 1 — Select Reported Incident or Predicted Risk Hotspot
                  </label>
                  <div className="space-y-2">
                    {emergencyIncidents.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => {
                          setSelectedIncidentId(inc.id);
                          setSelectedHospitalIdx(0);
                        }}
                        className={`p-3 rounded border text-xs cursor-pointer transition-colors ${
                          selectedIncidentId === inc.id
                            ? 'bg-[#F8FAFC] border-[#52677D]'
                            : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[11px] font-bold ${
                              inc.isConfirmed ? 'text-[#B85C5C]' : 'text-[#B58A45]'
                            }`}
                          >
                            {inc.isConfirmed
                              ? 'CONFIRMED VEHICLE INCIDENT'
                              : 'PREDICTED ACCIDENT-RISK HOTSPOT'}
                          </span>
                          <span className="font-mono text-[11px] text-[#64748B]">{inc.status}</span>
                        </div>
                        <div className="font-semibold text-[#1F2937] mt-1">
                          {inc.id}: {inc.incidentType} — Vehicle {inc.involvedVehicleId} ({inc.involvedShipmentId})
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">{inc.locationName}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Inspect Exact Location & Telemetry */}
                {selectedIncident && (
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs space-y-1">
                    <div className="font-semibold text-[#1F2937] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B85C5C]" />
                      Step 2 — Location & Telemetry Inspection
                    </div>
                    <div className="text-[#64748B]">
                      Highway Marker: <b className="text-[#1F2937]">{selectedIncident.highwayMarker}</b>
                    </div>
                    <div className="font-mono text-[11px] text-[#64748B]">
                      GPS: {selectedIncident.lat.toFixed(4)}°N, {selectedIncident.lng.toFixed(4)}°E · Driver:{' '}
                      {selectedIncident.driverName} ({selectedIncident.driverPhone})
                    </div>
                  </div>
                )}

                {/* Step 3: Identify Nearby Trauma Hospitals */}
                {selectedIncident && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">
                      Step 3 — Identify Nearby Trauma Hospitals & Est. Emergency Travel Time
                    </label>
                    <div className="space-y-2">
                      {selectedIncident.nearbyHospitals.map((hosp, idx) => (
                        <div
                          key={hosp.name}
                          onClick={() => setSelectedHospitalIdx(idx)}
                          className={`p-2.5 rounded border text-xs cursor-pointer flex items-center justify-between ${
                            selectedHospitalIdx === idx
                              ? 'bg-[#F1F5F9] border-[#54846B]'
                              : 'bg-white border-[#E2E8F0]'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[#1F2937]">{hosp.name}</div>
                            <div className="text-[11px] text-[#64748B]">
                              {hosp.traumaLevel} · {hosp.city} · <span className="font-mono">{hosp.contactPhone}</span>
                            </div>
                          </div>
                          <div className="text-right font-mono shrink-0 ml-2">
                            <div className="font-bold text-[#54846B]">{hosp.etaMinutes} mins ETA</div>
                            <div className="text-[11px] text-[#64748B]">{hosp.distanceKm} km</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Prepare Emergency Notification */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Step 4 — Prepare Emergency Notification Packet
                  </label>
                  <textarea
                    rows={2}
                    value={emergencyNote}
                    onChange={(e) => setEmergencyNote(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
                  />
                </div>
              </div>

              {/* Step 5: Confirm Simulated Response */}
              {selectedIncident && (
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() =>
                      confirmEmergencyDispatch(
                        selectedIncident.id,
                        chosenHospital?.name || 'Highway Trauma Center',
                        emergencyNote
                      )
                    }
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#B85C5C] hover:bg-[#9E4B4B] rounded flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedIncident.status === 'Hospital Notified (Simulated)'
                      ? `Simulated Dispatch Confirmed (${chosenHospital?.name})`
                      : `Step 5 — Confirm Simulated Emergency Response (${chosenHospital?.etaMinutes}m ETA)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
