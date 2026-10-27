export type NavigationTab =
  | 'overview'
  | 'corridors'
  | 'fleet'
  | 'shipments'
  | 'optimization'
  | 'risk'
  | 'simulator'
  | 'agent'
  | 'knowledge'
  | 'analytics'
  | 'settings'
  | 'freight-companies'
  | 'driver';

export type ShipmentStatus = 'In Transit' | 'Delayed' | 'At Risk' | 'Loading' | 'Delivered';
export type DeliveryPriority = 'Critical' | 'High' | 'Medium' | 'Standard';
export type RiskClassification = 'Low Risk' | 'Moderate Risk' | 'High Risk';

export interface CityHub {
  name: string;
  state: string;
  lat: number;
  lng: number;
  hubCode: string;
}

export interface FreightCorridor {
  id: string;
  name: string;
  highway: string;
  origin: string;
  destination: string;
  distanceKm: number;
  baselineHours: number;
  riskScore: number; // 0 - 100
  weatherSeverity: number; // 0 - 100
  rainfallIntensity: number; // mm/hr
  trafficCongestion: number; // 0 - 100
  historicalIncidentFreq: number; // 0 - 100
  infrastructureCondition: number; // 0 - 100
  routeFlexibility: number; // 0 - 100
  estimatedDelayHours: number;
  contributingFactors: string[];
  recommendedActions: string[];
  roadGeometry: [number, number][];
  alternateGeometry?: [number, number][];
  balancedGeometry?: [number, number][];
  trendHistory: { timeLabel: string; score: number }[];
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: '32ft Multi-Axle Container' | '24ft Refrigerated Reefer' | '40ft Heavy Flatbed Trailer' | '20ft LCV Express';
  capacityTons: number;
  fuelEfficiencyKmPerL: number;
  driverId: string;
  currentShipmentId: string | null;
  corridorId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  status: 'Active En Route' | 'Delayed in Congestion' | 'At Hub / Loading' | 'Maintenance Alert';
  fuelLevelPercent: number;
  lastUpdated: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  assignedVehicleId: string;
  currentShipmentId: string | null;
  safetyScore: number;
  dutyStatus: 'On Duty - Driving' | 'Rest Break' | 'Standby at Hub';
  shiftHoursRemaining: number;
  emergencyContact: string;
}

export interface Shipment {
  id: string;
  customerName: string;
  cargoType: string;
  cargoWeightTons: number;
  origin: string;
  destination: string;
  intermediateStops: string[];
  pickupDate: string;
  expectedDeliveryDate: string;
  assignedVehicleId: string;
  assignedDriverId: string;
  priority: DeliveryPriority;
  estimatedValueINR: number;
  delayPenaltyPerHour: number;
  status: ShipmentStatus;
  corridorId: string;
  progressPercent: number;
  riskScore: number;
  predictedDelayHours: number;
  etaText: string;
  reroutedVia?: string;
}

export interface DisruptionAlert {
  id: string;
  title: string;
  corridorId: string;
  corridorName: string;
  type: 'Weather' | 'Congestion' | 'Accident' | 'Infrastructure' | 'Breakdown';
  severity: 'Critical' | 'Warning' | 'Advisory';
  description: string;
  timestamp: string;
  lat: number;
  lng: number;
  estimatedDelayHours: number;
  affectedShipmentIds: string[];
  recommendedAction: string;
  isHistorical?: boolean;
}

export interface EmergencyIncident {
  id: string;
  corridorId: string;
  locationName: string;
  highwayMarker: string;
  lat: number;
  lng: number;
  incidentType: 'Confirmed Rollover / Collision' | 'Predicted High-Risk Blackspot' | 'Brake Thermal Warning';
  isConfirmed: boolean;
  involvedVehicleId: string;
  involvedShipmentId: string;
  driverName: string;
  driverPhone: string;
  severity: 'Critical' | 'High' | 'Moderate';
  reportedAt: string;
  status: 'Pending Operator Review' | 'Hospital Notified (Simulated)' | 'Resolved';
  nearbyHospitals: {
    name: string;
    city: string;
    distanceKm: number;
    etaMinutes: number;
    traumaLevel: string;
    contactPhone: string;
    lat: number;
    lng: number;
  }[];
  recommendedProtocol: string[];
}

export interface KnowledgeChunk {
  id: string;
  sectionTitle: string;
  content: string;
  tokensCount: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: 'PDF' | 'TXT' | 'DOCX' | 'SOP';
  category: 'SLA Policy' | 'Safety Manual' | 'Weather SOP' | 'Route Policy';
  uploadedAt: string;
  fileSizeKB: number;
  rawText: string;
  chunks: KnowledgeChunk[];
}

export interface SimulationShipmentImpact {
  id: string;
  customerName: string;
  cargoType: string;
  priority: DeliveryPriority;
  vehicleId: string;
  driverId: string;
  baselineDelayHours: number;
  addedDisruptionDelayHours: number;
  totalUnmitigatedDelayHours: number;
  postMitigationDelayHours: number;
  riskAdjustedEtaText: string;
  delayPenaltyPerHour: number;
  unmitigatedExposureINR: number;
  mitigatedExposureINR: number;
  missesDeadline: boolean;
  recommendedAction: string;
  reroutedVia?: string | null;
}

export interface SimulationState {
  active: boolean;
  runCount: number;
  lastRunTimestamp: string | null;
  executionMode: 'BACKEND_SIMULATION_API' | 'LOCAL_DETERMINISTIC_ENGINE';
  corridorId: string;
  scenarioType:
    | 'Heavy Rainfall'
    | 'Highway Closure'
    | 'Severe Congestion'
    | 'Vehicle Breakdown'
    | 'Accident-Related Road Blockage';
  severity: number;
  durationHours: number;
  affectedVehiclesCount: number;
  calculatedCorridorRisk: number;
  resilienceIndex: number;
  perShipmentAddedDelayHours: number;
  criticalShipmentsCount: number;
  beforeMetrics: {
    atRiskShipments: number;
    aggregateDelayHours: number;
    financialExposureINR: number;
    criticalAlerts: number;
  };
  afterMetrics: {
    atRiskShipments: number;
    aggregateDelayHours: number;
    financialExposureINR: number;
    criticalAlerts: number;
  };
  financialBreakdown: {
    unmitigatedSlaPenaltyINR: number;
    congestionFuelWasteINR: number;
    reeferAuxiliaryFuelINR: number;
    bypassExtraFuelCostINR: number;
    mitigatedTotalCostINR: number;
    netSavingsINR: number;
  };
  affectedShipmentIds: string[];
  shipmentImpacts: SimulationShipmentImpact[];
  actionPlanGenerated: boolean;
  actionPlanSteps: {
    id: string;
    title: string;
    agentRole: string;
    detail: string;
    estimatedDelayReductionHours: number;
    estimatedSavingINR: number;
    applied: boolean;
    rejected?: boolean;
  }[];
  convoyAdvisory: {
    convoyId: string;
    stagingHub: string;
    recommendedDepartureWindow: string;
    vehicleIds: string[];
    safetyDirective: string;
  };
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
  toolCalls?: {
    toolName: string;
    args: Record<string, any>;
    result: any;
  }[];
  recommendedActions?: {
    id: string;
    title: string;
    targetId: string;
    actionType: 'REROUTE_SHIPMENT' | 'PRIORITIZE_SHIPMENT' | 'HOLD_DISPATCH';
    impactSummary: string;
    executed?: boolean;
    rejected?: boolean;
  }[];
  providerStatus?: string;
  errorNotice?: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: AgentMessage[];
}

export interface CompanySettings {
  companyName: string;
  industry: string;
  operatingRegion: string;
  headquarters: string;
  gstin: string;
  controlTowerContact: string;
  fuelPricePerLiter: number;
  defaultFuelEfficiency: number;
  riskAlertThreshold: number;
  defaultDelayPenaltyPerHour: number;
  co2FactorKgPerLiter: number;
  enableWeatherAlerts: boolean;
  enableSlaEscalation: boolean;
  enableAutoRouteCaching: boolean;
  demoEnvironmentLabel: string;
}

export interface OperationalActivityLog {
  id: string;
  timestamp: string;
  category: 'SHIPMENT' | 'RISK' | 'ROUTE' | 'SIMULATION' | 'AGENT' | 'EMERGENCY';
  summary: string;
  referenceId: string;
}

export type OperatingDataMode =
  | 'DEMO_MODE'
  | 'LIVE_CONDITIONS_DEMO_FLEET'
  | 'CONNECTED_FLEET_MODE';

export type DataFreshnessStatus = 'LIVE' | 'CACHED' | 'STALE_CACHED' | 'UNCONFIGURED' | 'UNAVAILABLE';

export interface CorridorWeatherSamplePoint {
  segmentLabel: string;
  lat: number;
  lng: number;
  temperatureC: number | null;
  rainfallMmHr: number | null;
  precipitationProbabilityPct: number | null;
  windSpeedKmh: number | null;
  weatherCode: number | null;
  weatherCondition: string;
  observationTimestamp: string | null;
  forecastNext3h: {
    time: string;
    temperatureC: number;
    precipitationMm: number;
    precipitationProbabilityPct: number;
    windSpeedKmh: number;
  }[];
}

export interface LiveCorridorWeather {
  corridorId: string;
  corridorName: string;
  dataSource: string;
  freshnessStatus: DataFreshnessStatus;
  observationTimestamp: string | null;
  lastSuccessfulRefresh: string | null;
  samplePoints: CorridorWeatherSamplePoint[];
  observedAvgTempC: number | null;
  observedMaxRainfallMmHr: number | null;
  observedMaxWindKmh: number | null;
  forecastMaxPrecipProbPct: number | null;
  forecastMaxRainNext3hMm: number | null;
  derivedWeatherSeverityIndex: number | null; // Calculated 0-100 index from measurements (not an official weather warning)
  severeWeatherIndicators: string[];
  errorWarning?: string | null;
}

export interface CorridorTrafficSamplePoint {
  segmentLabel: string;
  lat: number;
  lng: number;
  currentSpeedKmh: number | null;
  freeFlowSpeedKmh: number | null;
  congestionPercent: number | null;
  delaySecondsPerKm: number | null;
  confidence: number | null;
  observationTimestamp: string | null;
}

export interface LiveCorridorTraffic {
  corridorId: string;
  corridorName: string;
  configured: boolean;
  dataSource: string;
  freshnessStatus: DataFreshnessStatus;
  observationTimestamp: string | null;
  lastSuccessfulRefresh: string | null;
  coverageDisclosure: string;
  samplePoints: CorridorTrafficSamplePoint[];
  avgCurrentSpeedKmh: number | null;
  avgFreeFlowSpeedKmh: number | null;
  observedCongestionIndex: number | null;
  estimatedTrafficDelayHours: number | null;
  avgConfidence: number | null;
  staleWarning?: string | null;
}

export interface LiveRoadIncident {
  id: string;
  incidentType: 'Accident' | 'Road Closure' | 'Roadworks' | 'Congestion' | 'Flooding' | 'Other Disruption';
  location: string;
  lat: number;
  lng: number;
  reportedSeverity: 'Major' | 'Moderate' | 'Minor' | 'Unknown';
  providerTimestamp: string;
  affectedRoadSegment: string;
  associatedCorridorId: string | null;
  distanceToCorridorKm: number | null;
  source: string;
  currentStatus: 'Active' | 'Clearing' | 'Reported';
  delayMinutes: number | null;
}

export interface LiveIncidentsFeed {
  configured: boolean;
  dataSource: string;
  freshnessStatus: DataFreshnessStatus;
  lastSuccessfulRefresh: string | null;
  statusMessage: string;
  incidents: LiveRoadIncident[];
}

export interface TraccarLiveVehiclePosition {
  traccarDeviceId: number;
  deviceName: string;
  uniqueId: string;
  mappedNetraVehicleId: string | null;
  lat: number | null;
  lng: number | null;
  speedKmh: number | null;
  lastPositionTimestamp: string | null;
  connectivityStatus: 'online' | 'offline' | 'unknown';
  events: string[];
}

export interface TraccarFleetStatus {
  configured: boolean;
  connected: boolean;
  dataSource: string;
  statusMessage: string;
  lastSuccessfulRefresh: string | null;
  deviceMappings: Record<string, string>; // traccarDeviceId -> netraVehicleId
  liveVehicles: TraccarLiveVehiclePosition[];
}

export interface ShipmentValidationIssue {
  rowNumber: number;
  shipmentId: string;
  field: string;
  reason: string;
}

export interface ShipmentImportResult {
  success: boolean;
  sourceLabel: string;
  importedAt: string;
  validCount: number;
  rejectedCount: number;
  validationIssues: ShipmentValidationIssue[];
  importedShipments: Shipment[];
}

