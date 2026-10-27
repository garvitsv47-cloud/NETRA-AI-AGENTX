import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  NavigationTab,
  FreightCorridor,
  Vehicle,
  Driver,
  Shipment,
  DisruptionAlert,
  EmergencyIncident,
  KnowledgeDocument,
  SimulationState,
  ChatSession,
  CompanySettings,
  OperationalActivityLog,
  AgentMessage,
  OperatingDataMode,
  LiveCorridorWeather,
  LiveCorridorTraffic,
  LiveIncidentsFeed,
  TraccarFleetStatus,
  ShipmentImportResult,
} from '../types/netra';
import {
  INITIAL_CORRIDORS,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_SHIPMENTS,
  INITIAL_ALERTS,
  INITIAL_EMERGENCY_INCIDENTS,
  INITIAL_KNOWLEDGE_DOCUMENTS,
  INITIAL_SETTINGS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_CHAT_SESSIONS,
  computeExplainableCorridorRisk,
} from '../data/initialData';

interface NetraContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedCorridorId: string;
  setSelectedCorridorId: (id: string) => void;
  selectedShipmentId: string | null;
  setSelectedShipmentId: (id: string | null) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Core Entities
  corridors: FreightCorridor[];
  vehicles: Vehicle[];
  drivers: Driver[];
  shipments: Shipment[];
  alerts: DisruptionAlert[];
  emergencyIncidents: EmergencyIncident[];
  documents: KnowledgeDocument[];
  settings: CompanySettings;
  activityLogs: OperationalActivityLog[];
  chatSessions: ChatSession[];
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  simulation: SimulationState;

  // Hackathon Demo Mode (null = inactive, 1..6 = stages)
  demoStage: number | null;
  startHackathonDemo: () => void;
  setDemoStage: (stage: number | null) => void;
  resetAllDemoData: () => void;

  // Derived Live KPIs
  kpis: {
    activeShipmentsCount: number;
    activeVehiclesCount: number;
    highRiskCorridorsCount: number;
    predictedDelaysCount: number;
    onTimeDeliveryPercentage: number;
    estimatedFinancialExposureINR: number;
  };

  // Actions
  addShipment: (newShipment: Omit<Shipment, 'riskScore' | 'predictedDelayHours' | 'etaText'>) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  deleteShipment: (id: string) => void;
  rerouteShipmentToBypass: (shipmentId: string, bypassName?: string) => void;
  applyCoordinatedFleetReroute: (corridorId: string) => void;
  updateCorridorRiskFactors: (
    corridorId: string,
    factors: Partial<
      Pick<
        FreightCorridor,
        | 'weatherSeverity'
        | 'rainfallIntensity'
        | 'trafficCongestion'
        | 'historicalIncidentFreq'
        | 'infrastructureCondition'
        | 'routeFlexibility'
      >
    >
  ) => void;
  runDisruptionSimulation: (params: {
    corridorId: string;
    scenarioType: SimulationState['scenarioType'];
    severity: number;
    durationHours: number;
    affectedVehiclesCount: number;
  }) => Promise<SimulationState>;
  generateSimulationActionPlan: () => void;
  applySimulationActionStep: (stepId: string) => void;
  rejectSimulationActionStep: (stepId: string) => void;
  resetSimulation: () => void;
  uploadKnowledgeDocument: (doc: Omit<KnowledgeDocument, 'id' | 'uploadedAt'>) => void;
  deleteKnowledgeDocument: (id: string) => void;
  confirmEmergencyDispatch: (incidentId: string, hospitalName: string, note: string) => void;
  updateCompanySettings: (newSettings: Partial<CompanySettings>) => void;
  addChatMessage: (sessionId: string, message: AgentMessage) => void;
  createNewChatSession: (title?: string) => string;
  markAgentActionExecuted: (sessionId: string, messageId: string, actionId: string) => void;
  rejectAgentAction: (sessionId: string, messageId: string, actionId: string) => void;
  logActivity: (category: OperationalActivityLog['category'], summary: string, referenceId: string) => void;

  // Real-World Data Integration & Operating Mode (Phases 1-8)
  operatingMode: OperatingDataMode;
  setOperatingMode: (mode: OperatingDataMode) => { allowed: boolean; reason?: string };
  canEnableConnectedFleetMode: boolean;
  connectedCapabilities: {
    hasLiveGps: boolean;
    hasImportedShipments: boolean;
  };
  activeHorizonMode: 'CURRENT_OBSERVED' | 'FORECAST_3H';
  liveWeatherByCorridor: Record<string, LiveCorridorWeather>;
  liveTrafficByCorridor: Record<string, LiveCorridorTraffic>;
  liveIncidentsFeed: LiveIncidentsFeed;
  traccarStatus: TraccarFleetStatus;
  importedShipments: Shipment[];
  lastImportResult: ShipmentImportResult | null;
  isRefreshingLiveTelemetry: boolean;
  lastTelemetryRefreshIso: string | null;
  refreshLiveTelemetry: (force?: boolean) => Promise<void>;
  applyLiveExternalConditionsToCorridors: (mode?: 'CURRENT_OBSERVED' | 'FORECAST_3H') => void;
  updateTraccarDeviceMapping: (traccarDeviceId: number, netraVehicleId: string) => Promise<void>;
  importShipmentsBatch: (records: any[], sourceLabel?: string) => Promise<ShipmentImportResult>;
}

const STORAGE_KEY = 'netra_enterprise_state_v2';
const WORKSPACE_SESSION_ID = (() => {
  try {
    const existing = sessionStorage.getItem('netra_workspace_session_id');
    if (existing) return existing;
    const generated = `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('netra_workspace_session_id', generated);
    return generated;
  } catch {
    return 'default';
  }
})();

export function computeDeterministicSimulation(params: {
  corridorId: string;
  scenarioType: SimulationState['scenarioType'];
  severity: number;
  durationHours: number;
  affectedVehiclesCount: number;
  corridors: FreightCorridor[];
  shipments: Shipment[];
  fuelPricePerLiter: number;
  active: boolean;
  runCount: number;
  executionMode?: 'BACKEND_SIMULATION_API' | 'LOCAL_DETERMINISTIC_ENGINE';
}): SimulationState {
  const numSeverity = Math.max(10, Math.min(100, Number(params.severity) || 86));
  const numDuration = Math.max(1, Math.min(48, Number(params.durationHours) || 6));
  const numVehicles = Math.max(1, Math.min(25, Number(params.affectedVehiclesCount) || 7));

  const cor = params.corridors.find((c) => c.id === params.corridorId) || params.corridors[0];

  const scenarioMultiplier =
    params.scenarioType === 'Highway Closure'
      ? 1.35
      : params.scenarioType === 'Accident-Related Road Blockage'
      ? 1.25
      : params.scenarioType === 'Heavy Rainfall'
      ? 1.18
      : params.scenarioType === 'Severe Congestion'
      ? 1.1
      : 1.05;

  const perShipmentAddedDelayHours = +(
    (numSeverity / 100) *
    numDuration *
    0.85 *
    scenarioMultiplier
  ).toFixed(1);

  const calculatedCorridorRisk = Math.min(
    99,
    Math.max(35, Math.round(cor.riskScore * 0.58 + numSeverity * 0.45))
  );
  const resilienceIndex = Math.max(
    12,
    Math.min(95, 100 - Math.round(calculatedCorridorRisk * 0.78))
  );

  // Scenario-dependent & corridor-flexibility-dependent residual delay model (replaces fixed 0.32 multiplier)
  const routeFlexScore = Number(cor.routeFlexibility ?? 45);
  const scenarioBaseResidualRatio =
    params.scenarioType === 'Highway Closure'
      ? 0.48
      : params.scenarioType === 'Accident-Related Road Blockage'
      ? 0.39
      : params.scenarioType === 'Heavy Rainfall'
      ? 0.34
      : params.scenarioType === 'Severe Congestion'
      ? 0.23
      : 0.19;
  const flexibilityAdjustment = ((50 - routeFlexScore) / 100) * 0.22;
  const durationFriction = Math.min(0.1, (numDuration / 24) * 0.08);
  const corridorResidualRatio = Math.max(
    0.16,
    Math.min(0.68, +(scenarioBaseResidualRatio + flexibilityAdjustment + durationFriction).toFixed(3))
  );

  const primaryCorridorShipments = params.shipments.filter(
    (s) => s.corridorId === cor.id && s.status !== 'Delivered'
  );
  const secondaryShipments = params.shipments.filter(
    (s) => s.corridorId !== cor.id && s.status !== 'Delivered'
  );
  const selectedShipments = [...primaryCorridorShipments, ...secondaryShipments].slice(
    0,
    numVehicles
  );

  const shipmentImpacts = selectedShipments.map((s, idx) => {
    const baselineDelay = Number(s.predictedDelayHours) || 0;
    const priorityFactor =
      s.priority === 'Critical' ? 1.05 : s.priority === 'High' ? 1.0 : 0.92;
    const addedDelay = +(perShipmentAddedDelayHours * priorityFactor).toFixed(1);
    const totalUnmitigatedDelay = +(baselineDelay + addedDelay).toFixed(1);
    const isBypassCandidate =
      s.priority === 'Critical' || s.priority === 'High' || idx < Math.ceil(numVehicles * 0.6);
    const shipmentResidualRatio = isBypassCandidate
      ? Math.max(0.14, corridorResidualRatio - 0.06)
      : Math.min(0.74, corridorResidualRatio + 0.09);
    const bypassDetourOverhead =
      params.scenarioType === 'Highway Closure'
        ? 0.6
        : params.scenarioType === 'Heavy Rainfall'
        ? 0.3
        : 0.15;
    const postMitigationDelay = Math.max(
      0.3,
      +(totalUnmitigatedDelay * shipmentResidualRatio + (isBypassCandidate ? bypassDetourOverhead : 0.4)).toFixed(1)
    );
    const penaltyRate = Number(s.delayPenaltyPerHour) || 15000;
    const unmitigatedExposure = Math.round(totalUnmitigatedDelay * penaltyRate);
    const mitigatedExposure = Math.round(postMitigationDelay * penaltyRate);
    const missesDeadline = totalUnmitigatedDelay >= 2.0 || s.priority === 'Critical';

    return {
      id: s.id,
      customerName: s.customerName,
      cargoType: s.cargoType,
      priority: s.priority,
      vehicleId: s.assignedVehicleId,
      driverId: s.assignedDriverId,
      baselineDelayHours: baselineDelay,
      addedDisruptionDelayHours: addedDelay,
      totalUnmitigatedDelayHours: totalUnmitigatedDelay,
      postMitigationDelayHours: postMitigationDelay,
      riskAdjustedEtaText: `${s.expectedDeliveryDate} (+${totalUnmitigatedDelay}h unmitigated → +${postMitigationDelay}h optimized)`,
      delayPenaltyPerHour: penaltyRate,
      unmitigatedExposureINR: unmitigatedExposure,
      mitigatedExposureINR: mitigatedExposure,
      missesDeadline,
      recommendedAction: isBypassCandidate
        ? `Divert via Secondary National Highway Bypass (-${(totalUnmitigatedDelay - postMitigationDelay).toFixed(1)}h saved)`
        : `Hold & Stage at ${cor.origin} Logistics Park for ${Math.min(4, numDuration)}h`,
      reroutedVia: s.reroutedVia || null,
    };
  });

  const beforeAggregateDelay = +(
    shipmentImpacts.reduce((sum, item) => sum + item.totalUnmitigatedDelayHours, 0)
  ).toFixed(1);
  const afterAggregateDelay = +(
    shipmentImpacts.reduce((sum, item) => sum + item.postMitigationDelayHours, 0)
  ).toFixed(1);

  const unmitigatedSlaPenaltyINR = shipmentImpacts.reduce(
    (sum, item) => sum + item.unmitigatedExposureINR,
    0
  );
  const congestionFuelWasteINR = Math.round(
    shipmentImpacts.length * numDuration * 2.4 * params.fuelPricePerLiter
  );
  const reeferCount = shipmentImpacts.filter(
    (item) =>
      item.cargoType.toLowerCase().includes('pharma') ||
      item.cargoType.toLowerCase().includes('cold') ||
      item.cargoType.toLowerCase().includes('vaccine') ||
      item.cargoType.toLowerCase().includes('chilled') ||
      item.cargoType.toLowerCase().includes('inhalation')
  ).length;
  const reeferAuxiliaryFuelINR = Math.round(
    Math.max(1, reeferCount) * numDuration * 3.2 * params.fuelPricePerLiter
  );
  const beforeTotalExposureINR =
    unmitigatedSlaPenaltyINR + congestionFuelWasteINR + reeferAuxiliaryFuelINR;

  const bypassExtraFuelCostINR = Math.round(
    Math.ceil(shipmentImpacts.length * 0.6) * 14.5 * params.fuelPricePerLiter
  );
  const afterTotalExposureINR =
    shipmentImpacts.reduce((sum, item) => sum + item.mitigatedExposureINR, 0) +
    bypassExtraFuelCostINR;
  const netSavingsINR = Math.max(0, beforeTotalExposureINR - afterTotalExposureINR);

  const criticalCount = shipmentImpacts.filter(
    (item) => item.priority === 'Critical' || item.totalUnmitigatedDelayHours >= 6.0
  ).length;
  const affectedIds = shipmentImpacts.map((item) => item.id);
  const totalDelaySaved = +(beforeAggregateDelay - afterAggregateDelay).toFixed(1);

  const actionPlanSteps = [
    {
      id: 'SIM-STEP-1',
      title: `Divert Critical & High-SLA Consignments (${affectedIds.slice(0, 3).join(', ')}) via Bypass Corridor`,
      agentRole: 'Route Recovery Agent',
      detail: `Execute immediate highway diversion around ${cor.name} (${cor.highway}) disruption zone (${params.scenarioType}, ${numSeverity}% severity) for priority vehicles.`,
      estimatedDelayReductionHours: +(totalDelaySaved * 0.58).toFixed(1),
      estimatedSavingINR: Math.round(netSavingsINR * 0.58),
      applied: false,
    },
    {
      id: 'SIM-STEP-2',
      title: `Stage & Convoy-Schedule Remaining Fleet (${affectedIds.slice(3).join(', ') || 'Feeder Units'}) at ${cor.origin} Hub`,
      agentRole: 'Fleet & Convoy Coordinator Agent',
      detail: `Hold non-critical departures for ${Math.min(4, numDuration)} hours to eliminate idle congestion fuel burn (₹${congestionFuelWasteINR.toLocaleString('en-IN')}) and dispatch in a staggered convoy.`,
      estimatedDelayReductionHours: +(totalDelaySaved * 0.27).toFixed(1),
      estimatedSavingINR: Math.round(netSavingsINR * 0.27),
      applied: false,
    },
    {
      id: 'SIM-STEP-3',
      title: 'Enforce Cold-Chain Reefer Auxiliary Fuel Reserve & Proactive SLA Customer Advisory',
      agentRole: 'SLA & Safety Compliance Agent',
      detail: `Mandate >65% diesel reserve across ${Math.max(1, reeferCount)} refrigerated units and transmit risk-adjusted ETAs to enterprise consignees.`,
      estimatedDelayReductionHours: +(totalDelaySaved * 0.15).toFixed(1),
      estimatedSavingINR: Math.round(netSavingsINR * 0.15),
      applied: false,
    },
  ];

  return {
    active: params.active,
    runCount: params.runCount,
    lastRunTimestamp: params.active
      ? new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : null,
    executionMode: params.executionMode || 'LOCAL_DETERMINISTIC_ENGINE',
    corridorId: cor.id,
    scenarioType: params.scenarioType,
    severity: numSeverity,
    durationHours: numDuration,
    affectedVehiclesCount: shipmentImpacts.length,
    calculatedCorridorRisk,
    resilienceIndex,
    perShipmentAddedDelayHours,
    criticalShipmentsCount: criticalCount,
    beforeMetrics: {
      atRiskShipments: shipmentImpacts.length,
      aggregateDelayHours: beforeAggregateDelay,
      financialExposureINR: beforeTotalExposureINR,
      criticalAlerts: Math.max(3, criticalCount),
    },
    afterMetrics: {
      atRiskShipments: Math.max(1, Math.floor(shipmentImpacts.length * 0.28)),
      aggregateDelayHours: afterAggregateDelay,
      financialExposureINR: afterTotalExposureINR,
      criticalAlerts: 1,
    },
    financialBreakdown: {
      unmitigatedSlaPenaltyINR,
      congestionFuelWasteINR,
      reeferAuxiliaryFuelINR,
      bypassExtraFuelCostINR,
      mitigatedTotalCostINR: afterTotalExposureINR,
      netSavingsINR,
    },
    affectedShipmentIds: affectedIds,
    shipmentImpacts,
    actionPlanGenerated: true,
    actionPlanSteps,
    convoyAdvisory: {
      convoyId: `CVY-${cor.id}-${numSeverity}`,
      stagingHub: `${cor.origin} ICD Logistics Staging Terminal`,
      recommendedDepartureWindow: `+${Math.min(3, Math.ceil(numDuration * 0.4))} hrs post-peak weather window`,
      vehicleIds: shipmentImpacts.map((item) => item.vehicleId),
      safetyDirective:
        numSeverity >= 75
          ? 'Mandatory 120m headway spacing, speed cap 45 km/h on wet gradients, hazard telemetry beacons active.'
          : 'Standard convoy spacing 80m, speed cap 60 km/h, scheduled rest check at midpoint plaza.',
    },
  };
}

const defaultSimulationState: SimulationState = computeDeterministicSimulation({
  corridorId: 'COR-01',
  scenarioType: 'Heavy Rainfall',
  severity: 86,
  durationHours: 6,
  affectedVehiclesCount: 7,
  corridors: INITIAL_CORRIDORS,
  shipments: INITIAL_SHIPMENTS,
  fuelPricePerLiter: INITIAL_SETTINGS.fuelPricePerLiter,
  active: false,
  runCount: 0,
  executionMode: 'LOCAL_DETERMINISTIC_ENGINE',
});

const NetraContext = createContext<NetraContextType | undefined>(undefined);

export const NetraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('COR-01');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>('SHP-1024');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('VEH-101');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('DRV-01');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [demoStage, setDemoStageState] = useState<number | null>(null);

  // Load persisted state or initialize from deterministic dataset
  // Also sanitize any duplicate IDs in persisted activityLogs or chatSessions from earlier sessions
  const loadSaved = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.activityLogs)) {
          const seenLogIds = new Set<string>();
          parsed.activityLogs = parsed.activityLogs.map((log: OperationalActivityLog, idx: number) => {
            const baseId = log?.id || `LOG-INIT-${idx}`;
            if (seenLogIds.has(baseId)) {
              const dedupedId = `${baseId}-dedup-${idx}`;
              seenLogIds.add(dedupedId);
              return { ...log, id: dedupedId };
            }
            seenLogIds.add(baseId);
            return log;
          });
        }
        if (parsed && Array.isArray(parsed.chatSessions)) {
          const seenChatIds = new Set<string>();
          parsed.chatSessions = parsed.chatSessions.map((sess: ChatSession, sIdx: number) => {
            const sessId = seenChatIds.has(sess.id) ? `${sess.id}-${sIdx}` : sess.id;
            seenChatIds.add(sessId);
            const seenMsgIds = new Set<string>();
            const messages = Array.isArray(sess.messages)
              ? sess.messages.map((m: AgentMessage, mIdx: number) => {
                  const msgId = seenMsgIds.has(m.id) ? `${m.id}-${mIdx}` : m.id;
                  seenMsgIds.add(msgId);
                  return { ...m, id: msgId };
                })
              : [];
            return { ...sess, id: sessId, messages };
          });
        }
        return parsed;
      }
    } catch (_e) {
      // ignore storage errors
    }
    return null;
  };

  const saved = useMemo(() => loadSaved(), []);
  const idCounterRef = useRef<number>(0);
  const generateUniqueId = (prefix: string): string => {
    idCounterRef.current += 1;
    return `${prefix}-${Date.now()}-${idCounterRef.current}`;
  };

  const [corridors, setCorridors] = useState<FreightCorridor[]>(saved?.corridors || INITIAL_CORRIDORS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(saved?.vehicles || INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(saved?.drivers || INITIAL_DRIVERS);
  const [shipments, setShipments] = useState<Shipment[]>(saved?.shipments || INITIAL_SHIPMENTS);
  const [alerts, setAlerts] = useState<DisruptionAlert[]>(saved?.alerts || INITIAL_ALERTS);
  const [emergencyIncidents, setEmergencyIncidents] = useState<EmergencyIncident[]>(
    saved?.emergencyIncidents || INITIAL_EMERGENCY_INCIDENTS
  );
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(
    saved?.documents || INITIAL_KNOWLEDGE_DOCUMENTS
  );
  const [settings, setSettings] = useState<CompanySettings>(saved?.settings || INITIAL_SETTINGS);
  const [activityLogs, setActivityLogs] = useState<OperationalActivityLog[]>(
    saved?.activityLogs || INITIAL_ACTIVITY_LOGS
  );
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(
    saved?.chatSessions || INITIAL_CHAT_SESSIONS
  );
  const [activeChatId, setActiveChatId] = useState<string>(INITIAL_CHAT_SESSIONS[0].id);
  const [simulation, setSimulation] = useState<SimulationState>(defaultSimulationState);

  // Real-World Live Data & 3-Mode State (Phases 1–8)
  const [operatingMode, setOperatingModeState] = useState<OperatingDataMode>(
    saved?.operatingMode || 'DEMO_MODE'
  );
  const operatingModeRef = useRef<OperatingDataMode>(saved?.operatingMode || 'DEMO_MODE');
  useEffect(() => {
    operatingModeRef.current = operatingMode;
  }, [operatingMode]);

  const [activeHorizonMode, setActiveHorizonMode] = useState<'CURRENT_OBSERVED' | 'FORECAST_3H'>(
    'CURRENT_OBSERVED'
  );
  const activeHorizonModeRef = useRef<'CURRENT_OBSERVED' | 'FORECAST_3H'>('CURRENT_OBSERVED');
  useEffect(() => {
    activeHorizonModeRef.current = activeHorizonMode;
  }, [activeHorizonMode]);

  const [liveWeatherByCorridor, setLiveWeatherByCorridor] = useState<Record<string, LiveCorridorWeather>>({});
  const [liveTrafficByCorridor, setLiveTrafficByCorridor] = useState<Record<string, LiveCorridorTraffic>>({});
  const [liveIncidentsFeed, setLiveIncidentsFeed] = useState<LiveIncidentsFeed>({
    configured: false,
    dataSource: 'TomTom Traffic Incidents API v5',
    freshnessStatus: 'UNCONFIGURED',
    lastSuccessfulRefresh: null,
    statusMessage: 'No incidents reported by provider (TOMTOM_API_KEY not configured on server).',
    incidents: [],
  });
  const [traccarStatus, setTraccarStatus] = useState<TraccarFleetStatus>({
    configured: false,
    connected: false,
    dataSource: 'Traccar GPS Server REST API',
    statusMessage: 'Live fleet tracking not connected.',
    lastSuccessfulRefresh: null,
    deviceMappings: {},
    liveVehicles: [],
  });
  const [importedShipments, setImportedShipments] = useState<Shipment[]>(saved?.importedShipments || []);
  const [lastImportResult, setLastImportResult] = useState<ShipmentImportResult | null>(null);
  const [isRefreshingLiveTelemetry, setIsRefreshingLiveTelemetry] = useState<boolean>(false);
  const [lastTelemetryRefreshIso, setLastTelemetryRefreshIso] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          operatingMode,
          corridors,
          vehicles,
          drivers,
          shipments,
          alerts,
          emergencyIncidents,
          documents,
          settings,
          activityLogs,
          chatSessions,
          importedShipments,
        })
      );
    } catch (_e) {
      // ignore quota warnings
    }
  }, [operatingMode, corridors, vehicles, drivers, shipments, alerts, emergencyIncidents, documents, settings, activityLogs, chatSessions, importedShipments]);

  const logActivity = (
    category: OperationalActivityLog['category'],
    summary: string,
    referenceId: string
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const uniqueLogId = generateUniqueId('LOG');
    setActivityLogs((prev) => [
      {
        id: uniqueLogId,
        timestamp: timeStr,
        category,
        summary,
        referenceId,
      },
      ...prev.slice(0, 29),
    ]);
  };

  // Live Calculated KPIs from underlying records
  const kpis = useMemo(() => {
    const activeShipments = shipments.filter((s) => s.status !== 'Delivered');
    const activeVehicles = vehicles.filter((v) => v.status !== 'Maintenance Alert');
    const highRiskCorridors = corridors.filter((c) => c.riskScore >= settings.riskAlertThreshold);
    const predictedDelays = activeShipments.filter((s) => s.predictedDelayHours > 0 || s.status === 'Delayed');
    const onTimeCount = shipments.filter(
      (s) => s.status === 'Delivered' || (s.status !== 'Delayed' && s.predictedDelayHours < 2.0)
    ).length;
    const onTimePct = shipments.length > 0 ? +((onTimeCount / shipments.length) * 100).toFixed(1) : 100;
    const exposureINR = activeShipments.reduce(
      (sum, s) => sum + Math.round((s.predictedDelayHours || 0) * (s.delayPenaltyPerHour || settings.defaultDelayPenaltyPerHour)),
      0
    );

    return {
      activeShipmentsCount: activeShipments.length,
      activeVehiclesCount: activeVehicles.length,
      highRiskCorridorsCount: highRiskCorridors.length,
      predictedDelaysCount: predictedDelays.length,
      onTimeDeliveryPercentage: onTimePct,
      estimatedFinancialExposureINR: exposureINR,
    };
  }, [shipments, vehicles, corridors, settings]);

  // Shipment CRUD
  const addShipment = (newShp: Omit<Shipment, 'riskScore' | 'predictedDelayHours' | 'etaText'>) => {
    const cor = corridors.find((c) => c.id === newShp.corridorId) || corridors[0];
    const priorityBump = newShp.priority === 'Critical' ? 4 : newShp.priority === 'High' ? 2 : 0;
    const riskScore = Math.min(96, cor.riskScore + priorityBump);
    const delayHrs = cor.riskScore >= settings.riskAlertThreshold ? cor.estimatedDelayHours : 0;
    const etaText =
      delayHrs > 0
        ? `${newShp.expectedDeliveryDate} (+${delayHrs}h predicted delay)`
        : `${newShp.expectedDeliveryDate} (On Schedule)`;

    const fullShipment: Shipment = {
      ...newShp,
      riskScore,
      predictedDelayHours: delayHrs,
      etaText,
    };

    setShipments((prev) => [fullShipment, ...prev]);
    if (newShp.assignedVehicleId) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === newShp.assignedVehicleId ? { ...v, currentShipmentId: fullShipment.id, corridorId: fullShipment.corridorId } : v
        )
      );
    }
    if (newShp.assignedDriverId) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === newShp.assignedDriverId ? { ...d, currentShipmentId: fullShipment.id } : d
        )
      );
    }
    setSelectedShipmentId(fullShipment.id);
    logActivity('SHIPMENT', `Created shipment ${fullShipment.id} (${fullShipment.origin} → ${fullShipment.destination}) for ${fullShipment.customerName}.`, fullShipment.id);
  };

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const merged = { ...s, ...updates };
        if (merged.status === 'Delivered') {
          merged.predictedDelayHours = 0;
          merged.riskScore = 10;
          merged.progressPercent = 100;
          merged.etaText = 'Delivered on schedule';
        }
        return merged;
      })
    );
    logActivity('SHIPMENT', `Updated shipment record ${id}.`, id);
  };

  const deleteShipment = (id: string) => {
    setShipments((prev) => prev.filter((s) => s.id !== id));
    setVehicles((prev) =>
      prev.map((v) => (v.currentShipmentId === id ? { ...v, currentShipmentId: null } : v))
    );
    if (selectedShipmentId === id) {
      setSelectedShipmentId(null);
    }
    logActivity('SHIPMENT', `Deleted shipment ${id} from active roster.`, id);
  };

  const rerouteShipmentToBypass = (shipmentId: string, bypassName = 'Kota–Ujjain–Dhule Eastern Bypass (NH52)') => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;
        const newDelay = Math.max(0, +(s.predictedDelayHours * 0.15).toFixed(1));
        const newRisk = Math.max(24, Math.min(36, s.riskScore - 42));
        return {
          ...s,
          status: 'In Transit',
          riskScore: newRisk,
          predictedDelayHours: newDelay,
          reroutedVia: bypassName,
          etaText: newDelay > 0 ? `Rerouted via NH52 (+${newDelay}h residual)` : `On Schedule via ${bypassName}`,
        };
      })
    );
    logActivity('ROUTE', `Rerouted shipment ${shipmentId} onto ${bypassName}; risk score reduced to Low Risk.`, shipmentId);
  };

  const applyCoordinatedFleetReroute = (corridorId: string) => {
    let count = 0;
    setShipments((prev) =>
      prev.map((s) => {
        if (s.corridorId !== corridorId || s.status === 'Delivered') return s;
        count++;
        if (s.priority === 'Critical' || s.priority === 'High') {
          return {
            ...s,
            status: 'In Transit',
            riskScore: 31,
            predictedDelayHours: 0.5,
            reroutedVia: 'Kota–Ujjain–Dhule Bypass (NH52)',
            etaText: 'Rerouted via NH52 Bypass (+0.5h)',
          };
        } else {
          return {
            ...s,
            status: 'In Transit',
            riskScore: 38,
            predictedDelayHours: 1.0,
            reroutedVia: 'Staged at Hub — Off-Peak Dispatch',
            etaText: 'Staged Departure (+1.0h managed)',
          };
        }
      })
    );
    logActivity('ROUTE', `Executed coordinated fleet-wide mitigation across ${count} shipments on corridor ${corridorId}.`, corridorId);
  };

  const updateCorridorRiskFactors = (
    corridorId: string,
    factors: Partial<
      Pick<
        FreightCorridor,
        | 'weatherSeverity'
        | 'rainfallIntensity'
        | 'trafficCongestion'
        | 'historicalIncidentFreq'
        | 'infrastructureCondition'
        | 'routeFlexibility'
      >
    >
  ) => {
    let updatedScore = 50;
    let updatedDelay = 1.0;

    setCorridors((prev) =>
      prev.map((c) => {
        if (c.id !== corridorId) return c;
        const merged = { ...c, ...factors };
        const calc = computeExplainableCorridorRisk({
          weatherSeverity: merged.weatherSeverity,
          rainfallIntensity: merged.rainfallIntensity,
          trafficCongestion: merged.trafficCongestion,
          historicalIncidentFreq: merged.historicalIncidentFreq,
          infrastructureCondition: merged.infrastructureCondition,
          routeFlexibility: merged.routeFlexibility,
        });
        updatedScore = calc.score;
        updatedDelay = calc.estimatedDelayHours;
        return {
          ...merged,
          riskScore: calc.score,
          estimatedDelayHours: calc.estimatedDelayHours,
        };
      })
    );

    // Propagate updated corridor risk and delay to active non-rerouted shipments on this corridor
    setShipments((prev) =>
      prev.map((s) => {
        if (s.corridorId !== corridorId || s.status === 'Delivered' || s.reroutedVia) return s;
        const bump = s.priority === 'Critical' ? 4 : s.priority === 'High' ? 2 : 0;
        const newRisk = Math.min(98, updatedScore + bump);
        const newStatus =
          newRisk >= 75 ? 'Delayed' : newRisk >= settings.riskAlertThreshold ? 'At Risk' : 'In Transit';
        return {
          ...s,
          riskScore: newRisk,
          predictedDelayHours: updatedScore >= 50 ? updatedDelay : 0,
          status: newStatus,
        };
      })
    );

    logActivity('RISK', `Recalculated risk score for ${corridorId}: ${updatedScore}/100 (Est. delay +${updatedDelay}h).`, corridorId);
  };

  const runDisruptionSimulation = async (params: {
    corridorId: string;
    scenarioType: SimulationState['scenarioType'];
    severity: number;
    durationHours: number;
    affectedVehiclesCount: number;
  }): Promise<SimulationState> => {
    const cor = corridors.find((c) => c.id === params.corridorId) || corridors[0];
    const nextRunCount = (simulation.runCount || 0) + 1;

    // 1. Compute deterministic baseline immediately so UI never blocks or fails if offline
    let computedState = computeDeterministicSimulation({
      ...params,
      corridors,
      shipments,
      fuelPricePerLiter: settings.fuelPricePerLiter,
      active: true,
      runCount: nextRunCount,
      executionMode: 'LOCAL_DETERMINISTIC_ENGINE',
    });

    // 2. Attempt backend simulation API execution for server-verified state
    try {
      const response = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          corridor: cor,
          shipments,
          fuelPricePerLiter: settings.fuelPricePerLiter,
        }),
      });
      if (response.ok) {
        const apiData = await response.json();
        computedState = {
          ...computedState,
          ...apiData,
          active: true,
          runCount: nextRunCount,
          executionMode: 'BACKEND_SIMULATION_API',
        };
      }
    } catch (err) {
      console.warn('Backend /api/simulation/run unreachable, using local deterministic simulation engine:', err);
    }

    // 3. Update corridor risk & delay telemetry in global state
    setCorridors((prev) =>
      prev.map((c) =>
        c.id === cor.id
          ? {
              ...c,
              riskScore: computedState.calculatedCorridorRisk,
              estimatedDelayHours: +(
                cor.estimatedDelayHours +
                computedState.perShipmentAddedDelayHours * 0.45
              ).toFixed(1),
            }
          : c
      )
    );

    // 4. Propagate simulated delays & risk scores to affected shipments so Command Center Dashboard KPIs reflect the active simulation
    const impactMap = new Map(
      (computedState.shipmentImpacts || []).map((imp) => [imp.id, imp])
    );
    setShipments((prev) =>
      prev.map((s) => {
        const imp = impactMap.get(s.id);
        if (!imp || s.status === 'Delivered' || s.reroutedVia) return s;
        const simRisk = Math.min(99, Math.max(s.riskScore, computedState.calculatedCorridorRisk));
        return {
          ...s,
          riskScore: simRisk,
          predictedDelayHours: imp.totalUnmitigatedDelayHours,
          status: imp.totalUnmitigatedDelayHours >= 3.0 ? 'Delayed' : 'At Risk',
          etaText: `${s.expectedDeliveryDate} (+${imp.totalUnmitigatedDelayHours}h sim delay)`,
        };
      })
    );

    // 5. Upsert active simulation disruption alert so Dashboard & Map alerts reflect the active scenario
    const midPt =
      cor.roadGeometry[Math.floor(cor.roadGeometry.length / 2)] || [22.3072, 73.1812];
    const simAlert: DisruptionAlert = {
      id: `ALT-SIM-${cor.id}`,
      corridorId: cor.id,
      corridorName: cor.name,
      type:
        params.scenarioType === 'Heavy Rainfall'
          ? 'Weather'
          : params.scenarioType === 'Highway Closure'
          ? 'Infrastructure'
          : params.scenarioType === 'Accident-Related Road Blockage'
          ? 'Accident'
          : params.scenarioType === 'Vehicle Breakdown'
          ? 'Breakdown'
          : 'Congestion',
      severity: params.severity >= 70 ? 'Critical' : 'Warning',
      title: `[Digital Twin Active] ${params.scenarioType} on ${cor.name} (${params.severity}% Severity)`,
      description: `Simulated ${params.durationHours}h ${params.scenarioType.toLowerCase()} impacting ${computedState.affectedVehiclesCount} vehicles (+${computedState.perShipmentAddedDelayHours}h delay/truck).`,
      timestamp: 'Just now',
      lat: midPt[0],
      lng: midPt[1],
      affectedShipmentIds: computedState.affectedShipmentIds,
      estimatedDelayHours: computedState.perShipmentAddedDelayHours,
      recommendedAction:
        computedState.actionPlanSteps[0]?.title ||
        `Divert priority shipments on ${cor.name} via bypass corridor`,
      isHistorical: false,
    };
    setAlerts((prev) => [simAlert, ...prev.filter((a) => !a.id.startsWith('ALT-SIM-'))]);

    setSimulation(computedState);
    setSelectedCorridorId(cor.id);

    logActivity(
      'SIMULATION',
      `Ran Digital Twin Simulation #${nextRunCount}: ${params.scenarioType} (Severity ${params.severity}%, ${params.durationHours}h, ${computedState.affectedVehiclesCount} vehicles) on ${cor.name}. Potential savings: ₹${computedState.financialBreakdown.netSavingsINR.toLocaleString('en-IN')}.`,
      cor.id
    );

    return computedState;
  };

  const generateSimulationActionPlan = () => {
    setSimulation((prev) => {
      if (prev.actionPlanSteps && prev.actionPlanSteps.length > 0) {
        return { ...prev, active: true, actionPlanGenerated: true };
      }
      const rebuilt = computeDeterministicSimulation({
        corridorId: prev.corridorId,
        scenarioType: prev.scenarioType,
        severity: prev.severity,
        durationHours: prev.durationHours,
        affectedVehiclesCount: prev.affectedVehiclesCount,
        corridors,
        shipments,
        fuelPricePerLiter: settings.fuelPricePerLiter,
        active: true,
        runCount: (prev.runCount || 0) + 1,
      });
      return { ...rebuilt, actionPlanGenerated: true };
    });
    logActivity(
      'SIMULATION',
      `Generated Multi-Agent Recovery Action Plan for ${simulation.corridorId} (${simulation.scenarioType}).`,
      simulation.corridorId
    );
  };

  const applySimulationActionStep = (stepId: string) => {
    const existingStep = simulation.actionPlanSteps.find((st) => st.id === stepId);
    if (!existingStep || existingStep.applied || existingStep.rejected) {
      return;
    }
    setSimulation((prev) => ({
      ...prev,
      actionPlanSteps: prev.actionPlanSteps.map((st) =>
        st.id === stepId ? { ...st, applied: true, rejected: false } : st
      ),
    }));
    if (stepId === 'SIM-STEP-1') {
      simulation.affectedShipmentIds.slice(0, 3).forEach((id) => rerouteShipmentToBypass(id));
    } else if (stepId === 'SIM-STEP-2') {
      applyCoordinatedFleetReroute(simulation.corridorId);
    }
    logActivity('SIMULATION', `Approved & executed mitigation step ${stepId} for corridor ${simulation.corridorId}.`, simulation.corridorId);
  };

  const rejectSimulationActionStep = (stepId: string) => {
    const existingStep = simulation.actionPlanSteps.find((st) => st.id === stepId);
    if (!existingStep || existingStep.applied || existingStep.rejected) {
      return;
    }
    setSimulation((prev) => ({
      ...prev,
      actionPlanSteps: prev.actionPlanSteps.map((st) =>
        st.id === stepId ? { ...st, rejected: true, applied: false } : st
      ),
    }));
    logActivity(
      'SIMULATION',
      `Operator rejected mitigation step ${stepId} for corridor ${simulation.corridorId}. Committed shipment routes unchanged.`,
      simulation.corridorId
    );
  };

  const resetSimulation = () => {
    const freshDefault = computeDeterministicSimulation({
      corridorId: 'COR-01',
      scenarioType: 'Heavy Rainfall',
      severity: 86,
      durationHours: 6,
      affectedVehiclesCount: 7,
      corridors: INITIAL_CORRIDORS,
      shipments: INITIAL_SHIPMENTS,
      fuelPricePerLiter: INITIAL_SETTINGS.fuelPricePerLiter,
      active: false,
      runCount: 0,
      executionMode: 'LOCAL_DETERMINISTIC_ENGINE',
    });
    setSimulation(freshDefault);
    setCorridors(INITIAL_CORRIDORS);
    setAlerts(INITIAL_ALERTS);
    setShipments((prev) =>
      prev.map((s) => {
        const init = INITIAL_SHIPMENTS.find((i) => i.id === s.id);
        return init ? { ...init } : s;
      })
    );
    logActivity('SIMULATION', 'Reset Digital Twin Simulator to baseline network telemetry.', 'COR-01');
  };

  const uploadKnowledgeDocument = (doc: Omit<KnowledgeDocument, 'id' | 'uploadedAt'>) => {
    const newDoc: KnowledgeDocument = {
      ...doc,
      id: generateUniqueId('DOC'),
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    logActivity('AGENT', `Indexed new policy document "${newDoc.title}" (${newDoc.chunks.length} chunks) into RAG Knowledge Base.`, newDoc.id);
  };

  const deleteKnowledgeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const confirmEmergencyDispatch = (incidentId: string, hospitalName: string, note: string) => {
    setEmergencyIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId ? { ...inc, status: 'Hospital Notified (Simulated)' } : inc
      )
    );
    logActivity(
      'EMERGENCY',
      `Confirmed simulated emergency response for ${incidentId} with ${hospitalName}. (${note})`,
      incidentId
    );
  };

  const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
    logActivity('SHIPMENT', 'Updated company operational parameters & risk thresholds.', 'SETTINGS');
  };

  const addChatMessage = (sessionId: string, message: AgentMessage) => {
    setChatSessions((prev) =>
      prev.map((sess) =>
        sess.id === sessionId
          ? {
              ...sess,
              updatedAt: 'Just now',
              messages: [...sess.messages, message],
            }
          : sess
      )
    );
  };

  const createNewChatSession = (title = 'Operational Investigation') => {
    const id = generateUniqueId('CHAT');
    const newSess: ChatSession = {
      id,
      title,
      updatedAt: 'Just now',
      messages: [
        {
          id: generateUniqueId('MSG'),
          role: 'assistant',
          content:
            'New operational session initialized. Ask me to analyze corridor risks, inspect any shipment (e.g., **SHP-1024**), compare alternative routes, or simulate highway disruptions.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setChatSessions((prev) => [newSess, ...prev]);
    setActiveChatId(id);
    return id;
  };

  const markAgentActionExecuted = (sessionId: string, messageId: string, actionId: string) => {
    let targetShpId: string | null = null;
    const sess = chatSessions.find((s) => s.id === sessionId);
    const msg = sess?.messages.find((m) => m.id === messageId);
    const act = msg?.recommendedActions?.find((a) => a.id === actionId);
    if (!act || act.executed || act.rejected) {
      return;
    }
    targetShpId = act.targetId;
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          messages: s.messages.map((m) => {
            if (m.id !== messageId) return m;
            return {
              ...m,
              recommendedActions: m.recommendedActions?.map((a) =>
                a.id === actionId ? { ...a, executed: true, rejected: false } : a
              ),
            };
          }),
        };
      })
    );
    if (targetShpId) {
      rerouteShipmentToBypass(targetShpId);
    }
  };

  const rejectAgentAction = (sessionId: string, messageId: string, actionId: string) => {
    const sess = chatSessions.find((s) => s.id === sessionId);
    const msg = sess?.messages.find((m) => m.id === messageId);
    const act = msg?.recommendedActions?.find((a) => a.id === actionId);
    if (!act || act.executed || act.rejected) {
      return;
    }
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          messages: s.messages.map((m) => {
            if (m.id !== messageId) return m;
            return {
              ...m,
              recommendedActions: m.recommendedActions?.map((a) =>
                a.id === actionId ? { ...a, rejected: true, executed: false } : a
              ),
            };
          }),
        };
      })
    );
    logActivity(
      'AGENT',
      `Operator rejected AI Agent recommendation ${actionId} (${act.title}). Committed route for ${act.targetId} unchanged.`,
      act.targetId
    );
  };

  // Guided 6-Stage Hackathon Demo Orchestrator
  const setDemoStage = (stage: number | null) => {
    setDemoStageState(stage);
    if (stage === null) return;

    setSelectedCorridorId('COR-01');
    setSelectedShipmentId('SHP-1024');
    setSelectedVehicleId('VEH-101');

    if (stage === 1) {
      // Stage 1: Monitor
      setActiveTab('overview');
    } else if (stage === 2) {
      // Stage 2: Predict
      setActiveTab('risk');
    } else if (stage === 3) {
      // Stage 3: Analyze
      setActiveTab('shipments');
    } else if (stage === 4) {
      // Stage 4: Optimize
      setActiveTab('optimization');
    } else if (stage === 5) {
      // Stage 5: Explain
      setActiveTab('agent');
    } else if (stage === 6) {
      // Stage 6: Demonstrate Impact
      runDisruptionSimulation({
        corridorId: 'COR-01',
        scenarioType: 'Heavy Rainfall',
        severity: 86,
        durationHours: 6,
        affectedVehiclesCount: 7,
      });
      setActiveTab('simulator');
    }
  };

  const startHackathonDemo = () => {
    if (operatingModeRef.current !== 'DEMO_MODE') {
      setOperatingMode('DEMO_MODE');
    }
    setDemoStage(1);
    logActivity('SIMULATION', 'Launched NH48 Freight Disruption Guided Hackathon Demo in Demo Mode.', 'COR-01');
  };

  const resetAllDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    operatingModeRef.current = 'DEMO_MODE';
    setOperatingModeState('DEMO_MODE');
    setCorridors(INITIAL_CORRIDORS);
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setShipments(INITIAL_SHIPMENTS);
    setAlerts(INITIAL_ALERTS);
    setEmergencyIncidents(INITIAL_EMERGENCY_INCIDENTS);
    setDocuments(INITIAL_KNOWLEDGE_DOCUMENTS);
    setSettings(INITIAL_SETTINGS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setChatSessions(INITIAL_CHAT_SESSIONS);
    setSimulation(defaultSimulationState);
    setSelectedCorridorId('COR-01');
    setSelectedShipmentId('SHP-1024');
    setDemoStageState(null);
    setActiveTab('overview');
  };

  const connectedCapabilities = useMemo(
    () => ({
      hasLiveGps: Boolean(traccarStatus.connected && traccarStatus.liveVehicles.length > 0),
      hasImportedShipments: Boolean(importedShipments.length > 0),
    }),
    [traccarStatus.connected, traccarStatus.liveVehicles.length, importedShipments.length]
  );

  const canEnableConnectedFleetMode = Boolean(
    connectedCapabilities.hasLiveGps || connectedCapabilities.hasImportedShipments
  );

  const synchronizeCorridorsAndShipmentsWithLiveWeather = (
    wMap: Record<string, LiveCorridorWeather>,
    tMap: Record<string, LiveCorridorTraffic>,
    iFeed: LiveIncidentsFeed,
    horizonMode: 'CURRENT_OBSERVED' | 'FORECAST_3H',
    targetMode: OperatingDataMode
  ) => {
    if (Object.keys(wMap).length === 0) return;

    // 1. Recompute all 8 corridors from live Open-Meteo observations + configured traffic or labeled baseline
    const updatedCorridors: FreightCorridor[] = INITIAL_CORRIDORS.map((cor) => {
      const liveW = wMap[cor.id];
      const liveT = tMap[cor.id];
      const corIncidents = (iFeed?.incidents || []).filter(
        (inc) => inc.associatedCorridorId === cor.id
      );

      const nextWeatherSeverity =
        liveW?.derivedWeatherSeverityIndex !== null && liveW?.derivedWeatherSeverityIndex !== undefined
          ? horizonMode === 'FORECAST_3H'
            ? Math.min(
                100,
                Math.round(
                  liveW.derivedWeatherSeverityIndex * 1.15 +
                    (liveW.forecastMaxPrecipProbPct || 0) * 0.2
                )
              )
            : liveW.derivedWeatherSeverityIndex
          : cor.weatherSeverity;

      const nextRainfall =
        liveW?.observedMaxRainfallMmHr !== null && liveW?.observedMaxRainfallMmHr !== undefined
          ? horizonMode === 'FORECAST_3H'
            ? Math.max(liveW.observedMaxRainfallMmHr, liveW.forecastMaxRainNext3hMm ?? 0)
            : liveW.observedMaxRainfallMmHr
          : cor.rainfallIntensity;

      const nextCongestion =
        liveT?.configured && liveT.observedCongestionIndex !== null
          ? liveT.observedCongestionIndex
          : cor.trafficCongestion;

      const nextIncidentFreq =
        iFeed?.configured && corIncidents.length > 0
          ? Math.min(100, cor.historicalIncidentFreq + corIncidents.length * 12)
          : cor.historicalIncidentFreq;

      const calc = computeExplainableCorridorRisk({
        weatherSeverity: nextWeatherSeverity,
        rainfallIntensity: nextRainfall,
        trafficCongestion: nextCongestion,
        historicalIncidentFreq: nextIncidentFreq,
        infrastructureCondition: cor.infrastructureCondition,
        routeFlexibility: cor.routeFlexibility,
      });

      const obsTimeLabel = liveW?.observationTimestamp || 'Latest Open-Meteo sync';
      const updatedFactors = [
        `Open-Meteo Observed (${obsTimeLabel}): Avg ${liveW?.observedAvgTempC ?? '--'}°C · Max Rain ${nextRainfall} mm/hr · Wind ${liveW?.observedMaxWindKmh ?? '--'} km/h (${liveW?.freshnessStatus || 'LIVE'})`,
        `Derived Weather Severity Index: ${nextWeatherSeverity}/100 (${horizonMode === 'FORECAST_3H' ? '+3h Forecast Horizon' : 'Measured Checkpoint Baseline'})`,
        liveT?.configured && liveT.observedCongestionIndex !== null
          ? `TomTom Observed Traffic Congestion Index: ${nextCongestion}/100`
          : `Traffic Congestion Baseline: ${nextCongestion}/100 (Simulated Scenario Assumption — TomTom Unconfigured)`,
        `Historical Incident Frequency (${nextIncidentFreq}/100) & Highway Bottleneck Index (${cor.infrastructureCondition}/100)`,
      ];

      return {
        ...cor,
        weatherSeverity: nextWeatherSeverity,
        rainfallIntensity: nextRainfall,
        trafficCongestion: nextCongestion,
        historicalIncidentFreq: nextIncidentFreq,
        riskScore: calc.score,
        estimatedDelayHours: calc.estimatedDelayHours,
        contributingFactors: updatedFactors,
      };
    });

    const corMap = new Map<string, FreightCorridor>(updatedCorridors.map((c) => [c.id, c]));
    const initShpMap = new Map<string, Shipment>(INITIAL_SHIPMENTS.map((s) => [s.id, s]));

    // 2. Recompute affected shipment risk scores, predicted delays, and statuses from updated corridors
    setShipments((prevShipments) => {
      // Preserve any custom user-created shipments while resetting base shipments for the target mode
      const customUserShipments = prevShipments.filter(
        (s) => !initShpMap.has(s.id) && !importedShipments.some((imp) => imp.id === s.id)
      );
      const sourceRoster =
        targetMode === 'CONNECTED_FLEET_MODE' && importedShipments.length > 0
          ? [...importedShipments, ...customUserShipments]
          : [...INITIAL_SHIPMENTS, ...customUserShipments];

      return sourceRoster.map((baseShp) => {
        // Preserve existing operator reroutes if already applied in current session
        const existingInState = prevShipments.find((p) => p.id === baseShp.id);
        if (baseShp.status === 'Delivered') return baseShp;
        if (existingInState?.reroutedVia) return existingInState;

        const updCor = corMap.get(baseShp.corridorId) || updatedCorridors[0];
        const liveW = wMap[updCor.id];
        const priorityBump =
          baseShp.priority === 'Critical'
            ? 4
            : baseShp.priority === 'High'
            ? 2
            : baseShp.priority === 'Standard'
            ? 0
            : -3;
        const newRisk = Math.max(12, Math.min(98, updCor.riskScore + priorityBump));

        // Calculate explainable delay based on live-weather-adjusted corridor risk & shipment priority
        let newDelay = 0;
        if (updCor.riskScore >= 65) {
          const mult =
            baseShp.priority === 'Critical' ? 1.05 : baseShp.priority === 'High' ? 1.0 : 0.85;
          newDelay = +(updCor.estimatedDelayHours * mult).toFixed(1);
        } else if (updCor.riskScore >= 44) {
          // Under moderate risk (e.g., clear live weather + baseline highway congestion), only shipments that had baseline bottleneck exposure experience residual congestion delay
          if (baseShp.predictedDelayHours > 0) {
            const mult =
              baseShp.priority === 'Critical'
                ? 1.0
                : baseShp.priority === 'High'
                ? 0.85
                : 0.45;
            const rawDelay = +(updCor.estimatedDelayHours * mult).toFixed(1);
            newDelay = rawDelay >= 0.8 ? rawDelay : 0;
          } else {
            newDelay = 0;
          }
        } else {
          newDelay = 0;
        }

        const newStatus: Shipment['status'] =
          newRisk >= 72 || newDelay >= 2.5
            ? 'Delayed'
            : newRisk >= 50 || newDelay > 0
            ? 'At Risk'
            : 'In Transit';

        const tempStr =
          liveW?.observedAvgTempC !== null && liveW?.observedAvgTempC !== undefined
            ? `${liveW.observedAvgTempC}°C`
            : 'Live';
        const rainStr = `${updCor.rainfallIntensity} mm/hr`;
        const newEtaText =
          newDelay > 0
            ? `${baseShp.expectedDeliveryDate} (+${newDelay}h est. · Open-Meteo ${tempStr}, ${rainStr})`
            : `On Schedule · Open-Meteo ${tempStr}, ${rainStr}`;

        return {
          ...baseShp,
          riskScore: newRisk,
          predictedDelayHours: newDelay,
          status: newStatus,
          etaText: newEtaText,
        };
      });
    });

    // 3. Synchronize vehicle statuses with live-weather-adjusted corridor congestion
    setVehicles((prevVehicles) => {
      if (targetMode === 'CONNECTED_FLEET_MODE' && traccarStatus.connected && traccarStatus.liveVehicles.length > 0) {
        return prevVehicles;
      }
      return INITIAL_VEHICLES.map((v) => {
        if (v.status === 'Maintenance Alert' || v.status === 'At Hub / Loading') return v;
        const updCor = corMap.get(v.corridorId);
        if (!updCor) return v;
        const nextStatus: Vehicle['status'] =
          updCor.riskScore >= 65
            ? 'Delayed in Congestion'
            : v.status === 'Delayed in Congestion' && updCor.riskScore < 55
            ? 'Active En Route'
            : v.status;
        return {
          ...v,
          status: nextStatus,
        };
      });
    });

    // 4. Update active alerts to reflect live Open-Meteo weather + explicitly labeled traffic baseline
    const historicalOnly = INITIAL_ALERTS.filter((a) => a.isHistorical);
    const liveActiveAlerts: DisruptionAlert[] = updatedCorridors
      .filter((c) => c.riskScore >= 44 || c.rainfallIntensity > 0)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3)
      .map((c, idx) => {
        const liveW = wMap[c.id];
        const midPt = c.roadGeometry[Math.floor(c.roadGeometry.length / 2)] || [22.3072, 73.1812];
        const hasRain = c.rainfallIntensity >= 2;
        const affectedIds = INITIAL_SHIPMENTS.filter(
          (s) => s.corridorId === c.id && s.status !== 'Delivered'
        )
          .slice(0, 4)
          .map((s) => s.id);

        return {
          id: `ALT-LIVE-0${idx + 1}`,
          corridorId: c.id,
          corridorName: c.name,
          type: hasRain ? 'Weather' : 'Congestion',
          severity: c.riskScore >= 70 ? 'Critical' : 'Warning',
          title: hasRain
            ? `[Open-Meteo Live] ${c.rainfallIntensity} mm/hr Precipitation on ${c.name} (${c.highway.split(' ')[0]})`
            : `[Hybrid Telemetry] ${c.name}: Clear Sky (${liveW?.observedAvgTempC ?? '--'}°C, 0 mm/hr) + Baseline Toll Congestion`,
          description: `Open-Meteo observed ${liveW?.observedAvgTempC ?? '--'}°C, ${c.rainfallIntensity} mm/hr rain, ${liveW?.observedMaxWindKmh ?? '--'} km/h wind at ${liveW?.observationTimestamp || 'latest sync'}. Corridor risk ${c.riskScore}/100 (Est. +${c.estimatedDelayHours}h). Traffic baseline is a simulated assumption (TomTom unconfigured).`,
          timestamp: liveW?.observationTimestamp || 'Live Sync',
          lat: midPt[0],
          lng: midPt[1],
          affectedShipmentIds: affectedIds,
          estimatedDelayHours: c.estimatedDelayHours,
          recommendedAction:
            c.riskScore >= 65
              ? c.recommendedActions[0]
              : `Maintain standard dispatch along ${c.highway.split(' ')[0]}; monitor +3h Open-Meteo forecast.`,
          isHistorical: false,
        };
      });

    setCorridors(updatedCorridors);
    setAlerts([...liveActiveAlerts, ...historicalOnly]);
  };

  const refreshLiveTelemetry = async (force = false) => {
    setIsRefreshingLiveTelemetry(true);
    try {
      const q = force ? '?force=true' : '';
      const wsHeaders = {
        'x-netra-workspace-id': WORKSPACE_SESSION_ID,
        'x-netra-operator-role': 'control-tower-operator',
      };
      const [wRes, tRes, iRes, fRes, sRes] = await Promise.all([
        fetch(`/api/live/weather${q}`, { headers: wsHeaders }).then((r) => r.json()).catch(() => null),
        fetch(`/api/live/traffic${q}`, { headers: wsHeaders }).then((r) => r.json()).catch(() => null),
        fetch(`/api/live/incidents`, { headers: wsHeaders }).then((r) => r.json()).catch(() => null),
        fetch(`/api/live/fleet/traccar`, { headers: wsHeaders }).then((r) => r.json()).catch(() => null),
        fetch(`/api/live/shipments`, { headers: wsHeaders }).then((r) => r.json()).catch(() => null),
      ]);

      let nextWMap = liveWeatherByCorridor;
      if (wRes && Array.isArray(wRes.corridors)) {
        const wMap: Record<string, LiveCorridorWeather> = {};
        wRes.corridors.forEach((c: LiveCorridorWeather) => {
          wMap[c.corridorId] = c;
        });
        nextWMap = wMap;
        setLiveWeatherByCorridor(wMap);
        if (wRes.lastSuccessfulRefresh) {
          setLastTelemetryRefreshIso(wRes.lastSuccessfulRefresh);
        }
      }

      let nextTMap = liveTrafficByCorridor;
      if (tRes && Array.isArray(tRes.corridors)) {
        const tMap: Record<string, LiveCorridorTraffic> = {};
        tRes.corridors.forEach((c: LiveCorridorTraffic) => {
          tMap[c.corridorId] = c;
        });
        nextTMap = tMap;
        setLiveTrafficByCorridor(tMap);
      }

      let nextIFeed = liveIncidentsFeed;
      if (iRes && iRes.statusMessage) {
        nextIFeed = iRes;
        setLiveIncidentsFeed(iRes);
      }

      if (fRes && fRes.statusMessage) {
        setTraccarStatus(fRes);
      }

      if (sRes && Array.isArray(sRes.shipments) && sRes.shipments.length > 0) {
        setImportedShipments(sRes.shipments);
      }

      // CRITICAL: Only apply live telemetry to corridors & shipments if current mode is NOT DEMO_MODE
      if (
        operatingModeRef.current === 'LIVE_CONDITIONS_DEMO_FLEET' ||
        operatingModeRef.current === 'CONNECTED_FLEET_MODE'
      ) {
        synchronizeCorridorsAndShipmentsWithLiveWeather(
          nextWMap,
          nextTMap,
          nextIFeed,
          activeHorizonModeRef.current,
          operatingModeRef.current
        );
      }
    } finally {
      setIsRefreshingLiveTelemetry(false);
    }
  };

  useEffect(() => {
    refreshLiveTelemetry(false);
    const interval = setInterval(() => {
      refreshLiveTelemetry(false);
    }, 180_000); // Refresh every 3 minutes
    return () => clearInterval(interval);
  }, []);

  const applyLiveExternalConditionsToCorridors = (
    horizonMode: 'CURRENT_OBSERVED' | 'FORECAST_3H' = 'CURRENT_OBSERVED'
  ) => {
    setActiveHorizonMode(horizonMode);
    activeHorizonModeRef.current = horizonMode;

    if (operatingModeRef.current === 'DEMO_MODE') {
      operatingModeRef.current = 'LIVE_CONDITIONS_DEMO_FLEET';
      setOperatingModeState('LIVE_CONDITIONS_DEMO_FLEET');
    }

    synchronizeCorridorsAndShipmentsWithLiveWeather(
      liveWeatherByCorridor,
      liveTrafficByCorridor,
      liveIncidentsFeed,
      horizonMode,
      operatingModeRef.current
    );

    logActivity(
      'RISK',
      `Synchronized corridor & shipment risk engine with live Open-Meteo (${horizonMode}) observations.`,
      selectedCorridorId
    );
  };

  const setOperatingMode = (
    mode: OperatingDataMode
  ): { allowed: boolean; reason?: string } => {
    if (mode === 'CONNECTED_FLEET_MODE' && !canEnableConnectedFleetMode) {
      return {
        allowed: false,
        reason:
          'Connected Fleet Mode is locked: Neither an authorized Traccar GPS server connection nor validated operational shipments (CSV/JSON TMS import) are currently active.',
      };
    }

    operatingModeRef.current = mode;
    setOperatingModeState(mode);

    if (mode === 'DEMO_MODE') {
      const initShpIds = new Set(INITIAL_SHIPMENTS.map((s) => s.id));
      const importedIds = new Set(importedShipments.map((s) => s.id));
      setCorridors(INITIAL_CORRIDORS);
      setShipments((prev) => {
        const userCreated = prev.filter((s) => !initShpIds.has(s.id) && !importedIds.has(s.id));
        return [...INITIAL_SHIPMENTS, ...userCreated];
      });
      setVehicles(INITIAL_VEHICLES);
      setAlerts(INITIAL_ALERTS);
      if (!simulation.active) {
        setSimulation(defaultSimulationState);
      }
      logActivity(
        'SIMULATION',
        'Switched workspace to DEMO MODE (deterministic NH48 monsoon baseline: COR-01 risk 78/100, SHP-1024 risk 88/100, +5.5h delay).',
        'MODE-DEMO'
      );
    } else if (mode === 'LIVE_CONDITIONS_DEMO_FLEET') {
      if (Object.keys(liveWeatherByCorridor).length > 0) {
        synchronizeCorridorsAndShipmentsWithLiveWeather(
          liveWeatherByCorridor,
          liveTrafficByCorridor,
          liveIncidentsFeed,
          activeHorizonModeRef.current,
          'LIVE_CONDITIONS_DEMO_FLEET'
        );
      } else {
        refreshLiveTelemetry(false);
      }
      logActivity(
        'RISK',
        'Switched workspace to LIVE EXTERNAL CONDITIONS + DEMO FLEET (Open-Meteo 24-checkpoint weather applied to corridors & shipments; fleet/shipments labeled SIMULATED).',
        'MODE-HYBRID'
      );
    } else if (mode === 'CONNECTED_FLEET_MODE') {
      if (Object.keys(liveWeatherByCorridor).length > 0) {
        synchronizeCorridorsAndShipmentsWithLiveWeather(
          liveWeatherByCorridor,
          liveTrafficByCorridor,
          liveIncidentsFeed,
          activeHorizonModeRef.current,
          'CONNECTED_FLEET_MODE'
        );
      } else {
        refreshLiveTelemetry(false);
      }
      logActivity(
        'SHIPMENT',
        `Switched workspace to CONNECTED FLEET MODE (Imported Shipments: ${importedShipments.length}, Connected GPS Vehicles: ${traccarStatus.liveVehicles.length}).`,
        'MODE-CONNECTED'
      );
    }
    return { allowed: true };
  };

  const updateTraccarDeviceMapping = async (
    traccarDeviceId: number,
    netraVehicleId: string
  ) => {
    await fetch('/api/live/fleet/mapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-netra-operator-role': 'control-tower-operator',
        'x-netra-workspace-id': WORKSPACE_SESSION_ID,
      },
      body: JSON.stringify({ traccarDeviceId, netraVehicleId }),
    });
    await refreshLiveTelemetry(false);
    logActivity(
      'SHIPMENT',
      `Mapped Traccar GPS Device #${traccarDeviceId} to NETRA Vehicle ${netraVehicleId || 'Unmapped'}.`,
      netraVehicleId || 'TRACCAR'
    );
  };

  const importShipmentsBatch = async (
    records: any[],
    sourceLabel = 'CSV / TMS Adapter'
  ): Promise<ShipmentImportResult> => {
    const resp = await fetch('/api/live/shipments/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-netra-operator-role': 'control-tower-operator',
        'x-netra-workspace-id': WORKSPACE_SESSION_ID,
      },
      body: JSON.stringify({ records, sourceLabel }),
    });
    const result: ShipmentImportResult = await resp.json();
    setLastImportResult(result);
    if (Array.isArray(result.importedShipments) && result.importedShipments.length > 0) {
      setImportedShipments(result.importedShipments);
      setShipments((prev) => {
        const importedIds = new Set(result.importedShipments.map((s) => s.id));
        return [
          ...result.importedShipments,
          ...prev.filter((s) => !importedIds.has(s.id)),
        ];
      });
      logActivity(
        'SHIPMENT',
        `Imported ${result.validCount} validated operational shipment(s) via ${sourceLabel} (${result.rejectedCount} rejected).`,
        'TMS-IMPORT'
      );
    }
    return result;
  };

  return (
    <NetraContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCorridorId,
        setSelectedCorridorId,
        selectedShipmentId,
        setSelectedShipmentId,
        selectedVehicleId,
        setSelectedVehicleId,
        selectedDriverId,
        setSelectedDriverId,
        globalSearchQuery,
        setGlobalSearchQuery,
        corridors,
        vehicles,
        drivers,
        shipments,
        alerts,
        emergencyIncidents,
        documents,
        settings,
        activityLogs,
        chatSessions,
        activeChatId,
        setActiveChatId,
        simulation,
        demoStage,
        startHackathonDemo,
        setDemoStage,
        resetAllDemoData,
        kpis,
        addShipment,
        updateShipment,
        deleteShipment,
        rerouteShipmentToBypass,
        applyCoordinatedFleetReroute,
        updateCorridorRiskFactors,
        runDisruptionSimulation,
        generateSimulationActionPlan,
        applySimulationActionStep,
        rejectSimulationActionStep,
        resetSimulation,
        uploadKnowledgeDocument,
        deleteKnowledgeDocument,
        confirmEmergencyDispatch,
        updateCompanySettings,
        addChatMessage,
        createNewChatSession,
        markAgentActionExecuted,
        rejectAgentAction,
        logActivity,
        operatingMode,
        setOperatingMode,
        canEnableConnectedFleetMode,
        connectedCapabilities,
        activeHorizonMode,
        liveWeatherByCorridor,
        liveTrafficByCorridor,
        liveIncidentsFeed,
        traccarStatus,
        importedShipments,
        lastImportResult,
        isRefreshingLiveTelemetry,
        lastTelemetryRefreshIso,
        refreshLiveTelemetry,
        applyLiveExternalConditionsToCorridors,
        updateTraccarDeviceMapping,
        importShipmentsBatch,
      }}
    >
      {children}
    </NetraContext.Provider>
  );
};

export const useNetra = () => {
  const ctx = useContext(NetraContext);
  if (!ctx) throw new Error('useNetra must be used within NetraProvider');
  return ctx;
};
