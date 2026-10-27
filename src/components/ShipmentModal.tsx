import React, { useState, useEffect } from 'react';
import { useNetra } from '../context/NetraContext';
import { Shipment, DeliveryPriority, ShipmentStatus } from '../types/netra';
import { INDIAN_CITY_HUBS } from '../data/initialData';
import { X, Plus, Trash2 } from 'lucide-react';

interface ShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingShipment?: Shipment | null;
}

export const ShipmentModal: React.FC<ShipmentModalProps> = ({ isOpen, onClose, editingShipment }) => {
  const { corridors, vehicles, drivers, addShipment, updateShipment, shipments } = useNetra();

  const [id, setId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [cargoWeightTons, setCargoWeightTons] = useState(18);
  const [origin, setOrigin] = useState('Delhi');
  const [destination, setDestination] = useState('Mumbai');
  const [intermediateStops, setIntermediateStops] = useState<string[]>(['Jaipur']);
  const [newStopCity, setNewStopCity] = useState('Vadodara');
  const [pickupDate, setPickupDate] = useState('2026-10-26 08:00');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('2026-10-28 18:00');
  const [assignedVehicleId, setAssignedVehicleId] = useState('VEH-101');
  const [assignedDriverId, setAssignedDriverId] = useState('DRV-01');
  const [priority, setPriority] = useState<DeliveryPriority>('High');
  const [estimatedValueINR, setEstimatedValueINR] = useState(12500000);
  const [delayPenaltyPerHour, setDelayPenaltyPerHour] = useState(18000);
  const [status, setStatus] = useState<ShipmentStatus>('In Transit');
  const [corridorId, setCorridorId] = useState('COR-01');

  useEffect(() => {
    if (editingShipment) {
      setId(editingShipment.id);
      setCustomerName(editingShipment.customerName);
      setCargoType(editingShipment.cargoType);
      setCargoWeightTons(editingShipment.cargoWeightTons);
      setOrigin(editingShipment.origin);
      setDestination(editingShipment.destination);
      setIntermediateStops(editingShipment.intermediateStops || []);
      setPickupDate(editingShipment.pickupDate);
      setExpectedDeliveryDate(editingShipment.expectedDeliveryDate);
      setAssignedVehicleId(editingShipment.assignedVehicleId);
      setAssignedDriverId(editingShipment.assignedDriverId);
      setPriority(editingShipment.priority);
      setEstimatedValueINR(editingShipment.estimatedValueINR);
      setDelayPenaltyPerHour(editingShipment.delayPenaltyPerHour);
      setStatus(editingShipment.status);
      setCorridorId(editingShipment.corridorId);
    } else {
      const nextNum = 1041 + shipments.length;
      setId(`SHP-${nextNum}`);
      setCustomerName('Mahindra Logistics Enterprise');
      setCargoType('Automotive EV Drivetrain Modules');
      setCargoWeightTons(20.5);
      setOrigin('Delhi');
      setDestination('Mumbai');
      setIntermediateStops(['Jaipur', 'Vadodara']);
      setPickupDate('2026-10-26 09:00');
      setExpectedDeliveryDate('2026-10-28 19:00');
      setAssignedVehicleId(vehicles[0]?.id || 'VEH-101');
      setAssignedDriverId(drivers[0]?.id || 'DRV-01');
      setPriority('High');
      setEstimatedValueINR(14500000);
      setDelayPenaltyPerHour(18500);
      setStatus('In Transit');
      setCorridorId('COR-01');
    }
  }, [editingShipment, isOpen, shipments.length, vehicles, drivers]);

  if (!isOpen) return null;

  const handleAddStop = () => {
    if (newStopCity && !intermediateStops.includes(newStopCity)) {
      setIntermediateStops([...intermediateStops, newStopCity]);
    }
  };

  const handleRemoveStop = (stop: string) => {
    setIntermediateStops(intermediateStops.filter((s) => s !== stop));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !cargoType.trim()) return;

    if (editingShipment) {
      updateShipment(editingShipment.id, {
        customerName,
        cargoType,
        cargoWeightTons: Number(cargoWeightTons),
        origin,
        destination,
        intermediateStops,
        pickupDate,
        expectedDeliveryDate,
        assignedVehicleId,
        assignedDriverId,
        priority,
        estimatedValueINR: Number(estimatedValueINR),
        delayPenaltyPerHour: Number(delayPenaltyPerHour),
        status,
        corridorId,
      });
    } else {
      addShipment({
        id: id.trim() || `SHP-${Date.now().toString().slice(-4)}`,
        customerName,
        cargoType,
        cargoWeightTons: Number(cargoWeightTons),
        origin,
        destination,
        intermediateStops,
        pickupDate,
        expectedDeliveryDate,
        assignedVehicleId,
        assignedDriverId,
        priority,
        estimatedValueINR: Number(estimatedValueINR),
        delayPenaltyPerHour: Number(delayPenaltyPerHour),
        status,
        corridorId,
        progressPercent: status === 'Loading' ? 5 : status === 'Delivered' ? 100 : 25,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-md w-full max-w-3xl shadow-lg overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div>
            <h3 className="text-base font-semibold text-[#1F2937]">
              {editingShipment ? `Edit Shipment Record — ${editingShipment.id}` : 'Register New Freight Consignment'}
            </h3>
            <p className="text-xs text-[#64748B]">
              Bharat Freight Logistics Pvt. Ltd. · Multi-stop corridor & SLA configuration
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#64748B] hover:text-[#1F2937] rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Shipment ID</label>
              <input
                type="text"
                value={id}
                disabled={Boolean(editingShipment)}
                onChange={(e) => setId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Customer / Enterprise Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Cargo Type / Description</label>
              <input
                type="text"
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Cargo Weight (Tons)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="45"
                value={cargoWeightTons}
                onChange={(e) => setCargoWeightTons(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Primary Freight Corridor</label>
              <select
                value={corridorId}
                onChange={(e) => {
                  const cid = e.target.value;
                  setCorridorId(cid);
                  const found = corridors.find((c) => c.id === cid);
                  if (found) {
                    setOrigin(found.origin);
                    setDestination(found.destination);
                  }
                }}
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
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Origin Hub</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              >
                {INDIAN_CITY_HUBS.map((h) => (
                  <option key={h.hubCode} value={h.name}>
                    {h.name} ({h.state})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Delivery Destination</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              >
                {INDIAN_CITY_HUBS.map((h) => (
                  <option key={h.hubCode} value={h.name}>
                    {h.name} ({h.state})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Intermediate Stops */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded">
            <label className="block text-xs font-medium text-[#1F2937] mb-2">
              Intermediate Pickup / Delivery Stops ({origin} → {intermediateStops.join(' → ') || 'Direct'} → {destination})
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {intermediateStops.length === 0 && (
                <span className="text-xs text-[#64748B]">No intermediate stops configured (Direct Corridor Run)</span>
              )}
              {intermediateStops.map((stop, idx) => (
                <div
                  key={stop}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E2E8F0] rounded text-xs text-[#1F2937]"
                >
                  <span className="font-mono text-[11px] text-[#64748B]">Stop {idx + 1}:</span>
                  <span className="font-medium">{stop}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(stop)}
                    className="text-[#64748B] hover:text-[#B85C5C] ml-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={newStopCity}
                onChange={(e) => setNewStopCity(e.target.value)}
                className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              >
                {INDIAN_CITY_HUBS.map((h) => (
                  <option key={h.hubCode} value={h.name}>
                    {h.name} ({h.state})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddStop}
                className="px-3 py-1.5 text-xs font-medium bg-[#52677D] text-white rounded hover:bg-[#415366] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Stop
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Pickup Date & Time</label>
              <input
                type="text"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Expected Delivery Deadline</label>
              <input
                type="text"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Assigned Vehicle</label>
              <select
                value={assignedVehicleId}
                onChange={(e) => setAssignedVehicleId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id} · {v.registrationNumber} ({v.type.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Assigned Driver</label>
              <select
                value={assignedDriverId}
                onChange={(e) => setAssignedDriverId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id} · {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Delivery Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DeliveryPriority)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              >
                <option value="Critical">Critical (Tier-1 SLA)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Shipment Value (₹ INR)</label>
              <input
                type="number"
                step="50000"
                value={estimatedValueINR}
                onChange={(e) => setEstimatedValueINR(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Delay Penalty / Hr (₹ INR)</label>
              <input
                type="number"
                step="500"
                value={delayPenaltyPerHour}
                onChange={(e) => setDelayPenaltyPerHour(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Current Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded bg-white text-[#1F2937]"
              >
                <option value="In Transit">In Transit</option>
                <option value="At Risk">At Risk</option>
                <option value="Delayed">Delayed</option>
                <option value="Loading">Loading</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#1F2937] bg-white border border-[#E2E8F0] rounded hover:bg-[#F8FAFC] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#52677D] rounded hover:bg-[#415366] cursor-pointer"
            >
              {editingShipment ? 'Save Shipment Changes' : 'Create & Dispatch Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
