import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNetra } from '../context/NetraContext';
import { CityHub } from '../types/netra';

interface CorridorMapProps {
  heightClass?: string;
  focusedCorridorOnly?: boolean;
  showAlternativeRoutes?: boolean;
  activeRouteOptionId?: string;
  customRouteGeometry?: [number, number][];
  customRouteStops?: CityHub[];
  showHospitalsAndEmergencies?: boolean;
  onSelectShipment?: (shipmentId: string) => void;
}

export const CorridorMap: React.FC<CorridorMapProps> = ({
  heightClass = 'h-[480px]',
  focusedCorridorOnly = false,
  showAlternativeRoutes = false,
  activeRouteOptionId = 'OPT-SAFE',
  customRouteGeometry,
  customRouteStops,
  showHospitalsAndEmergencies = false,
  onSelectShipment,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const {
    corridors,
    vehicles,
    drivers,
    shipments,
    alerts,
    emergencyIncidents,
    selectedCorridorId,
    setSelectedCorridorId,
    selectedVehicleId,
    setSelectedVehicleId,
    setSelectedShipmentId,
    setSelectedDriverId,
    setActiveTab,
  } = useNetra();

  // Initialize Leaflet map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.45, 78.2],
      zoom: 5,
      minZoom: 4,
      maxZoom: 15,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | NETRA Geospatial Engine',
      maxZoom: 18,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = group;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Re-render corridors, vehicles, stops, and disruptions when state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const getRiskColor = (score: number) => {
      if (score >= 70) return '#B85C5C'; // Critical
      if (score >= 35) return '#B58A45'; // Warning
      return '#54846B'; // Nominal/Success
    };

    // 1. If custom multi-stop route is active and has geometry, render it prominently
    if (customRouteGeometry && customRouteGeometry.length > 1) {
      const customLine = L.polyline(customRouteGeometry, {
        color: '#52677D',
        weight: 5,
        opacity: 0.95,
      }).addTo(group);

      if (customRouteStops && customRouteStops.length > 0) {
        customRouteStops.forEach((stop, idx) => {
          const isOrigin = idx === 0;
          const isDest = idx === customRouteStops.length - 1;
          const badgeBg = isOrigin ? '#111827' : isDest ? '#54846B' : '#52677D';
          const label = isOrigin ? 'O' : isDest ? 'D' : String(idx);

          const stopIcon = L.divIcon({
            className: 'custom-stop-marker',
            html: `<div style="background:${badgeBg};color:#FFFFFF;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.28);">${label}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([stop.lat, stop.lng], { icon: stopIcon })
            .bindPopup(
              `<div style="min-width:160px;">
                <div style="font-size:11px;color:#64748B;font-weight:600;">${
                  isOrigin ? 'ORIGIN HUB' : isDest ? 'DESTINATION HUB' : `INTERMEDIATE STOP ${idx}`
                }</div>
                <div style="font-size:13px;font-weight:700;color:#1F2937;margin-top:2px;">${stop.name}, ${stop.state}</div>
                <div style="font-size:11px;color:#52677D;font-family:monospace;margin-top:2px;">Hub Code: ${stop.hubCode}</div>
              </div>`
            )
            .addTo(group);
        });
      }

      try {
        map.fitBounds(customLine.getBounds(), { padding: [36, 36], maxZoom: 7 });
      } catch (_e) {
        // ignore bounds error
      }
    } else {
      // 2. Render Freight Corridors
      const visibleCorridors = focusedCorridorOnly
        ? corridors.filter((c) => c.id === selectedCorridorId)
        : corridors;

      visibleCorridors.forEach((corridor) => {
        const isSelected = corridor.id === selectedCorridorId;
        const color = getRiskColor(corridor.riskScore);

        // Main highway road geometry
        const line = L.polyline(corridor.roadGeometry, {
          color,
          weight: isSelected ? 5 : 3.5,
          opacity: isSelected ? 0.95 : 0.72,
        }).addTo(group);

        line.on('click', () => {
          setSelectedCorridorId(corridor.id);
        });

        line.bindTooltip(
          `${corridor.name} (${corridor.highway}) · Risk: ${corridor.riskScore}/100 · Delay: +${corridor.estimatedDelayHours}h`,
          { sticky: true, direction: 'top' }
        );

        // If route comparison mode is enabled on selected corridor, render alternative & balanced bypass geometries
        if (showAlternativeRoutes && isSelected) {
          if (corridor.alternateGeometry) {
            const isAltActive = activeRouteOptionId === 'OPT-SAFE' || activeRouteOptionId === 'OPT-COST';
            L.polyline(corridor.alternateGeometry, {
              color: '#54846B',
              weight: isAltActive ? 5 : 3.5,
              dashArray: isAltActive ? undefined : '8, 6',
              opacity: 0.92,
            })
              .bindTooltip('Lowest Risk Bypass: Kota → Ujjain → Indore → Dhule (Risk: 31/100)', { sticky: true })
              .addTo(group);
          }

          if (corridor.balancedGeometry) {
            const isBalActive = activeRouteOptionId === 'OPT-BALANCED';
            L.polyline(corridor.balancedGeometry, {
              color: '#52677D',
              weight: isBalActive ? 5 : 3.5,
              dashArray: '6, 6',
              opacity: 0.88,
            })
              .bindTooltip('Balanced Hybrid Connector: Chittorgarh → Ratlam → Godhra (Risk: 42/100)', { sticky: true })
              .addTo(group);
          }
        }

        // Origin & Destination Endpoint Hub Markers
        const startPt = corridor.roadGeometry[0];
        const endPt = corridor.roadGeometry[corridor.roadGeometry.length - 1];

        [
          { pt: startPt, city: corridor.origin, role: 'Origin Terminal' },
          { pt: endPt, city: corridor.destination, role: 'Destination Terminal' },
        ].forEach((ep) => {
          const hubIcon = L.divIcon({
            className: 'corridor-hub-pin',
            html: `<div style="background:#FFFFFF;border:2px solid #1F2937;width:10px;height:10px;border-radius:50%;"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          L.marker(ep.pt, { icon: hubIcon })
            .bindTooltip(`${ep.city} (${ep.role})`)
            .addTo(group);
        });
      });
    }

    // 3. Render Active Disruption Markers
    const activeAlerts = alerts.filter((a) => !a.isHistorical);
    activeAlerts.forEach((alert) => {
      if (focusedCorridorOnly && alert.corridorId !== selectedCorridorId) return;
      const bg = alert.severity === 'Critical' ? '#B85C5C' : '#B58A45';
      const alertIcon = L.divIcon({
        className: 'disruption-marker',
        html: `<div style="background:${bg};color:#FFFFFF;width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.25);">!</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      L.marker([alert.lat, alert.lng], { icon: alertIcon })
        .bindPopup(
          `<div style="min-width:210px;">
            <div style="font-size:10px;font-weight:700;color:${bg};text-transform:uppercase;">${alert.severity} ${alert.type} DISRUPTION</div>
            <div style="font-size:12px;font-weight:700;color:#1F2937;margin-top:2px;">${alert.title}</div>
            <div style="font-size:11px;color:#64748B;margin-top:4px;">${alert.description}</div>
            <div style="font-size:11px;font-weight:600;color:#1F2937;margin-top:6px;">Est. Corridor Delay: +${alert.estimatedDelayHours} hrs · Affected: ${alert.affectedShipmentIds.length} shipments</div>
          </div>`
        )
        .addTo(group);
    });

    // 4. Render Emergency Hotspots & Nearby Trauma Hospitals when enabled
    if (showHospitalsAndEmergencies) {
      emergencyIncidents.forEach((inc) => {
        const incIcon = L.divIcon({
          className: 'emergency-incident-pin',
          html: `<div style="background:#B85C5C;color:#FFFFFF;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;border:2px solid #FFFFFF;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">SOS ${inc.involvedVehicleId}</div>`,
          iconSize: [68, 22],
          iconAnchor: [34, 11],
        });
        L.marker([inc.lat, inc.lng], { icon: incIcon })
          .bindPopup(
            `<div style="min-width:200px;">
              <div style="font-size:10px;font-weight:700;color:#B85C5C;">${inc.isConfirmed ? 'CONFIRMED INCIDENT' : 'PREDICTED ACCIDENT HOTSPOT'}</div>
              <div style="font-size:12px;font-weight:700;color:#1F2937;margin-top:2px;">${inc.incidentType}</div>
              <div style="font-size:11px;color:#64748B;margin-top:2px;">${inc.locationName}</div>
              <div style="font-size:11px;color:#1F2937;margin-top:4px;">Vehicle: <b>${inc.involvedVehicleId}</b> · Driver: ${inc.driverName}</div>
            </div>`
          )
          .addTo(group);

        inc.nearbyHospitals.forEach((hosp) => {
          const hospIcon = L.divIcon({
            className: 'hospital-pin',
            html: `<div style="background:#54846B;color:#FFFFFF;width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #FFFFFF;box-shadow:0 2px 5px rgba(0,0,0,0.2);">H</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          L.marker([hosp.lat, hosp.lng], { icon: hospIcon })
            .bindPopup(
              `<div style="min-width:190px;">
                <div style="font-size:10px;font-weight:700;color:#54846B;">EMERGENCY TRAUMA FACILITY</div>
                <div style="font-size:12px;font-weight:700;color:#1F2937;margin-top:2px;">${hosp.name}</div>
                <div style="font-size:11px;color:#64748B;">${hosp.traumaLevel} · ${hosp.city}</div>
                <div style="font-size:11px;font-weight:600;color:#1F2937;margin-top:4px;">Distance: ${hosp.distanceKm} km · Est. Ambulance ETA: ${hosp.etaMinutes} mins</div>
                <div style="font-size:11px;font-family:monospace;color:#52677D;margin-top:2px;">${hosp.contactPhone}</div>
              </div>`
            )
            .addTo(group);
        });
      });
    }

    // 5. Render Simulated Commercial Truck Markers along routes
    vehicles.forEach((veh) => {
      if (focusedCorridorOnly && veh.corridorId !== selectedCorridorId) return;
      const shp = shipments.find((s) => s.id === veh.currentShipmentId);
      const drv = drivers.find((d) => d.id === veh.driverId);
      const isSelectedVeh = veh.id === selectedVehicleId;
      const riskScore = shp?.riskScore ?? 32;
      const markerBg =
        veh.status === 'Delayed in Congestion' || riskScore >= 70
          ? '#B85C5C'
          : riskScore >= 35
          ? '#52677D'
          : '#54846B';

      const truckIcon = L.divIcon({
        className: 'simulated-truck-marker',
        html: `<div style="background:${markerBg};color:#FFFFFF;width:${isSelectedVeh ? 28 : 22}px;height:${
          isSelectedVeh ? 28 : 22
        }px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;border:2px solid #FFFFFF;box-shadow:0 2px 6px rgba(15,23,42,0.35);cursor:pointer;">T</div>`,
        iconSize: [isSelectedVeh ? 28 : 22, isSelectedVeh ? 28 : 22],
        iconAnchor: [isSelectedVeh ? 14 : 11, isSelectedVeh ? 14 : 11],
      });

      const marker = L.marker([veh.lat, veh.lng], { icon: truckIcon }).addTo(group);

      const popupContainer = document.createElement('div');
      popupContainer.style.minWidth = '225px';
      popupContainer.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:6px;">
          <div>
            <div style="font-size:10px;color:#64748B;font-weight:600;">SIMULATED GPS TELEMETRY</div>
            <div style="font-size:13px;font-weight:700;color:#1F2937;font-family:monospace;">${veh.registrationNumber}</div>
          </div>
          <span style="font-size:10px;font-weight:600;color:${markerBg};">${
            riskScore >= 70 ? 'HIGH RISK' : riskScore >= 35 ? 'MODERATE' : 'NOMINAL'
          } (${riskScore}/100)</span>
        </div>
        <div style="font-size:11px;line-height:1.5;color:#1F2937;">
          <div><span style="color:#64748B;">Vehicle ID:</span> <b>${veh.id}</b> (${veh.type})</div>
          <div><span style="color:#64748B;">Driver:</span> <b>${drv?.name || 'Assigned Operator'}</b></div>
          <div><span style="color:#64748B;">Shipment ID:</span> <b style="font-family:monospace;">${shp?.id || 'Unassigned / Staging'}</b></div>
          <div><span style="color:#64748B;">Current Route:</span> ${shp ? `${shp.origin} → ${shp.destination}` : veh.corridorId}</div>
          <div><span style="color:#64748B;">Destination:</span> <b>${shp?.destination || 'Hub'}</b></div>
          <div><span style="color:#64748B;">ETA:</span> ${shp?.etaText || 'Standby'}</div>
          <div><span style="color:#64748B;">Speed / Fuel:</span> ${veh.speedKmh} km/h · ${veh.fuelLevelPercent}% Diesel</div>
        </div>
        <div style="display:flex;gap:6px;margin-top:8px;">
          <button id="btn-inspect-${veh.id}" style="flex:1;background:#52677D;color:#FFFFFF;border:none;border-radius:4px;padding:5px 8px;font-size:11px;font-weight:600;cursor:pointer;">Inspect Shipment</button>
          <button id="btn-driver-${veh.id}" style="background:#F1F5F9;color:#1F2937;border:1px solid #CBD5E1;border-radius:4px;padding:5px 8px;font-size:11px;font-weight:600;cursor:pointer;">Driver View</button>
        </div>
      `;

      marker.bindPopup(popupContainer);

      marker.on('popupopen', () => {
        setSelectedVehicleId(veh.id);
        setSelectedCorridorId(veh.corridorId);
        if (shp) setSelectedShipmentId(shp.id);

        const inspectBtn = document.getElementById(`btn-inspect-${veh.id}`);
        if (inspectBtn) {
          inspectBtn.onclick = () => {
            if (shp) {
              setSelectedShipmentId(shp.id);
              if (onSelectShipment) onSelectShipment(shp.id);
              else setActiveTab('shipments');
            }
          };
        }

        const drvBtn = document.getElementById(`btn-driver-${veh.id}`);
        if (drvBtn) {
          drvBtn.onclick = () => {
            if (drv) setSelectedDriverId(drv.id);
            setActiveTab('driver');
          };
        }
      });
    });
  }, [
    corridors,
    vehicles,
    drivers,
    shipments,
    alerts,
    emergencyIncidents,
    selectedCorridorId,
    selectedVehicleId,
    focusedCorridorOnly,
    showAlternativeRoutes,
    activeRouteOptionId,
    customRouteGeometry,
    customRouteStops,
    showHospitalsAndEmergencies,
  ]);

  return (
    <div className={`relative w-full ${heightClass} bg-[#F1F5F9] rounded-md overflow-hidden border border-[#E2E8F0]`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Legend & Telemetry Overlay */}
      <div className="absolute bottom-3 left-3 z-[25] bg-white/95 border border-[#E2E8F0] rounded px-3 py-2 text-[11px] text-[#1F2937] shadow-xs flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-semibold text-[#1F2937]">Corridor Risk & Telemetry:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-1 bg-[#B85C5C]" /> High Risk (70–100)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-1 bg-[#B58A45]" /> Moderate (35–69)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-1 bg-[#54846B]" /> Low Risk (0–34)
        </span>
        <span className="text-[#64748B]">·</span>
        <span className="text-[#64748B]">Truck Markers (T): Simulated Fleet GPS</span>
      </div>
    </div>
  );
};
