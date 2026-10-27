import {
  CityHub,
  FreightCorridor,
  Vehicle,
  Driver,
  Shipment,
  DisruptionAlert,
  EmergencyIncident,
  KnowledgeDocument,
  CompanySettings,
  OperationalActivityLog,
  ChatSession,
} from '../types/netra';

export const INDIAN_CITY_HUBS: CityHub[] = [
  { name: 'Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.209, hubCode: 'DEL-NCR' },
  { name: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266, hubCode: 'GGN-01' },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, hubCode: 'JAI-01' },
  { name: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lng: 74.6399, hubCode: 'AJM-02' },
  { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, hubCode: 'UDR-01' },
  { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648, hubCode: 'KOT-01' },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, hubCode: 'AMD-01' },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, hubCode: 'BDQ-01' },
  { name: 'Bharuch', state: 'Gujarat', lat: 21.7051, lng: 72.9959, hubCode: 'BHC-01' },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, hubCode: 'STV-01' },
  { name: 'Vapi', state: 'Gujarat', lat: 20.3893, lng: 72.9106, hubCode: 'VAP-01' },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777, hubCode: 'BOM-01' },
  { name: 'Navi Mumbai', state: 'Maharashtra', lat: 19.033, lng: 73.0297, hubCode: 'NMB-02' },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, hubCode: 'PNQ-01' },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898, hubCode: 'NSK-01' },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, hubCode: 'NAG-01' },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, hubCode: 'IDR-01' },
  { name: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885, hubCode: 'UJJ-01' },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, hubCode: 'AGR-01' },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, hubCode: 'LKO-01' },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, hubCode: 'KNU-01' },
  { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463, hubCode: 'IXD-01' },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, hubCode: 'VNS-01' },
  { name: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lng: 86.4304, hubCode: 'DBD-01' },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, hubCode: 'CCU-01' },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, hubCode: 'BLR-01' },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, hubCode: 'MAA-01' },
  { name: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lng: 79.1325, hubCode: 'VLR-01' },
  { name: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.5186, lng: 78.2137, hubCode: 'KGI-01' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867, hubCode: 'HYD-01' },
  { name: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373, hubCode: 'KJB-01' },
  { name: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lng: 77.6006, hubCode: 'ATP-01' },
];

export const INITIAL_SETTINGS: CompanySettings = {
  companyName: 'Bharat Freight Logistics Pvt. Ltd.',
  industry: 'Road Freight Transportation & Cold-Chain Control Tower',
  operatingRegion: 'Pan-India (National Highways Network)',
  headquarters: 'Cyber City Tower B, Gurugram, Delhi NCR - 122002',
  gstin: '06AAACB4829K1Z5',
  controlTowerContact: '+91-124-4892100 / ops-desk@bharatfreight.in',
  fuelPricePerLiter: 94.5,
  defaultFuelEfficiency: 4.2,
  riskAlertThreshold: 65,
  defaultDelayPenaltyPerHour: 15000,
  co2FactorKgPerLiter: 2.68,
  enableWeatherAlerts: true,
  enableSlaEscalation: true,
  enableAutoRouteCaching: true,
  demoEnvironmentLabel: 'NATIONAL HACKATHON LIVE CONTROL TOWER',
};

export const INITIAL_CORRIDORS: FreightCorridor[] = [
  {
    id: 'COR-01',
    name: 'Delhi–Mumbai',
    highway: 'NH48 Western Dedicated Freight Corridor',
    origin: 'Delhi',
    destination: 'Mumbai',
    distanceKm: 1415,
    baselineHours: 27.5,
    riskScore: 78,
    weatherSeverity: 84,
    rainfallIntensity: 48,
    trafficCongestion: 83,
    historicalIncidentFreq: 72,
    infrastructureCondition: 64,
    routeFlexibility: 68,
    estimatedDelayHours: 5.5,
    contributingFactors: [
      'Heavy monsoon depression across Bharuch–Vadodara–Surat belt (48 mm/hr)',
      'Elevated toll plaza congestion at Narmada Bridge & Vasai Creek',
      'Historical waterlogging & multi-axle bottleneck frequency on NH48',
      'Limited heavy-vehicle bypass flexibility across South Gujarat river crossings',
    ],
    recommendedActions: [
      'Divert Critical & Cold-Chain shipments via Kota–Ujjain–Dhule bypass (NH52)',
      'Hold non-urgent departures at Jaipur & Ahmedabad staging hubs for 4 hours',
      'Alert reefer drivers on NH48 to maintain >65% fuel reserve for auxiliary cooling',
    ],
    // Multi-waypoint actual NH48 road path from Delhi -> Gurugram -> Jaipur -> Ajmer -> Udaipur -> Ahmedabad -> Vadodara -> Bharuch -> Surat -> Vapi -> Mumbai
    roadGeometry: [
      [28.6139, 77.209],
      [28.4595, 77.0266],
      [28.192, 76.6191],
      [27.8891, 76.2845],
      [27.553, 76.0644],
      [26.9124, 75.7873],
      [26.6812, 75.2319],
      [26.4499, 74.6399],
      [25.7711, 74.3218],
      [25.3407, 73.9822],
      [24.5854, 73.7125],
      [23.834, 73.3612],
      [23.0225, 72.5714],
      [22.6916, 72.8634],
      [22.3072, 73.1812],
      [21.7051, 72.9959],
      [21.1702, 72.8311],
      [20.7645, 72.9621],
      [20.3893, 72.9106],
      [19.7667, 72.9115],
      [19.2183, 72.9781],
      [19.076, 72.8777],
    ],
    // Eastern Safer Bypass via Jaipur -> Kota -> Ujjain -> Indore -> Dhule -> Nashik -> Mumbai
    alternateGeometry: [
      [28.6139, 77.209],
      [28.4595, 77.0266],
      [27.553, 76.0644],
      [26.9124, 75.7873],
      [26.0338, 75.7924],
      [25.2138, 75.8648],
      [24.267, 75.8331],
      [23.1765, 75.7885],
      [22.7196, 75.8577],
      [21.8257, 75.349],
      [20.9042, 74.7749],
      [20.5579, 74.5089],
      [19.9975, 73.7898],
      [19.4711, 73.2695],
      [19.076, 72.8777],
    ],
    // Balanced Connector via Jaipur -> Chittorgarh -> Ratlam -> Godhra -> Surat -> Mumbai
    balancedGeometry: [
      [28.6139, 77.209],
      [28.4595, 77.0266],
      [26.9124, 75.7873],
      [25.3463, 74.6364],
      [24.8887, 74.6269],
      [23.3315, 75.0367],
      [22.7788, 73.6143],
      [21.9522, 73.2856],
      [21.1702, 72.8311],
      [19.9833, 72.9115],
      [19.076, 72.8777],
    ],
    trendHistory: [
      { timeLabel: '04:00', score: 52 },
      { timeLabel: '06:00', score: 61 },
      { timeLabel: '08:00', score: 69 },
      { timeLabel: '10:00', score: 74 },
      { timeLabel: '12:00', score: 78 },
    ],
  },
  {
    id: 'COR-02',
    name: 'Delhi–Jaipur',
    highway: 'NH48 Northern Industrial Spine',
    origin: 'Delhi',
    destination: 'Jaipur',
    distanceKm: 272,
    baselineHours: 5.5,
    riskScore: 46,
    weatherSeverity: 38,
    rainfallIntensity: 12,
    trafficCongestion: 58,
    historicalIncidentFreq: 45,
    infrastructureCondition: 42,
    routeFlexibility: 35,
    estimatedDelayHours: 1.2,
    contributingFactors: [
      'Peak industrial freight congestion near Manesar & Dharuhera ICD',
      'Ongoing flyover maintenance near Behror highway junction',
    ],
    recommendedActions: [
      'Use Delhi–Mumbai Expressway Sohna–Dausa link for high-priority departures',
    ],
    roadGeometry: [
      [28.6139, 77.209],
      [28.4595, 77.0266],
      [28.3588, 76.926],
      [28.2065, 76.7947],
      [27.8891, 76.2845],
      [27.7024, 76.1986],
      [27.3911, 75.9612],
      [26.9124, 75.7873],
    ],
    trendHistory: [
      { timeLabel: '04:00', score: 34 },
      { timeLabel: '06:00', score: 39 },
      { timeLabel: '08:00', score: 48 },
      { timeLabel: '10:00', score: 45 },
      { timeLabel: '12:00', score: 46 },
    ],
  },
  {
    id: 'COR-03',
    name: 'Mumbai–Pune',
    highway: 'Mumbai–Pune Expressway / NH48 Ghat Section',
    origin: 'Mumbai',
    destination: 'Pune',
    distanceKm: 149,
    baselineHours: 3.5,
    riskScore: 72,
    weatherSeverity: 76,
    rainfallIntensity: 41,
    trafficCongestion: 74,
    historicalIncidentFreq: 68,
    infrastructureCondition: 55,
    routeFlexibility: 72,
    estimatedDelayHours: 2.8,
    contributingFactors: [
      'Intense Western Ghats downpour & low visibility at Khandala–Lonavala Boreghat',
      'Slow-moving heavy container queue near Khalapur Toll Plaza',
      'Steep gradient braking hazards for 40ft trailers',
    ],
    recommendedActions: [
      'Enforce mandatory brake inspection & 35 km/h speed cap through Lonavala Ghat',
      'Hold non-essential JNPT port departures for 90 minutes',
    ],
    roadGeometry: [
      [19.076, 72.8777],
      [19.033, 73.0297],
      [18.9894, 73.1175],
      [18.8266, 73.2812],
      [18.7557, 73.4091],
      [18.7351, 73.6756],
      [18.6298, 73.7997],
      [18.5204, 73.8567],
    ],
    trendHistory: [
      { timeLabel: '04:00', score: 54 },
      { timeLabel: '06:00', score: 62 },
      { timeLabel: '08:00', score: 68 },
      { timeLabel: '10:00', score: 71 },
      { timeLabel: '12:00', score: 72 },
    ],
  },
  {
    id: 'COR-04',
    name: 'Delhi–Kolkata',
    highway: 'NH19 Grand Trunk Eastern Freight Corridor',
    origin: 'Delhi',
    destination: 'Kolkata',
    distanceKm: 1530,
    baselineHours: 31.0,
    riskScore: 58,
    weatherSeverity: 52,
    rainfallIntensity: 24,
    trafficCongestion: 64,
    historicalIncidentFreq: 61,
    infrastructureCondition: 58,
    routeFlexibility: 50,
    estimatedDelayHours: 2.6,
    contributingFactors: [
      'Heavy coal & steel truck density between Dhanbad, Asansol, and Dankuni',
      'Intermittent rain showers across Prayagraj–Varanasi belt',
    ],
    recommendedActions: [
      'Route Kanpur–Varanasi segment via outer ring bypasses to avoid city bottlenecks',
    ],
    roadGeometry: [
      [28.6139, 77.209],
      [27.8974, 77.6841],
      [27.1767, 78.0081],
      [26.7922, 79.0185],
      [26.4499, 80.3319],
      [25.9211, 81.1842],
      [25.4358, 81.8463],
      [25.3176, 82.9739],
      [24.8913, 84.1856],
      [24.4512, 85.3214],
      [23.7957, 86.4304],
      [23.6889, 86.9661],
      [23.2324, 87.8615],
      [22.5726, 88.3639],
    ],
    trendHistory: [
      { timeLabel: '04:00', score: 49 },
      { timeLabel: '06:00', score: 53 },
      { timeLabel: '08:00', score: 56 },
      { timeLabel: '10:00', score: 59 },
      { timeLabel: '12:00', score: 58 },
    ],
  },
  {
    id: 'COR-05',
    name: 'Chennai–Bengaluru',
    highway: 'NH48 Southern Automotive & Electronics Corridor',
    origin: 'Chennai',
    destination: 'Bengaluru',
    distanceKm: 348,
    baselineHours: 6.8,
    riskScore: 28,
    weatherSeverity: 22,
    rainfallIntensity: 4,
    trafficCongestion: 38,
    historicalIncidentFreq: 26,
    infrastructureCondition: 24,
    routeFlexibility: 30,
    estimatedDelayHours: 0.4,
    contributingFactors: [
      'Moderate evening shift traffic near Sriperumbudur & Hosur electronic hubs',
    ],
    recommendedActions: [
      'Maintain standard dispatch cadence; optimal conditions for high-utilization runs',
    ],
    roadGeometry: [
      [13.0827, 80.2707],
      [12.9675, 79.9419],
      [12.9165, 79.1325],
      [12.7825, 78.7169],
      [12.5186, 78.2137],
      [12.7409, 77.8253],
      [12.9716, 77.5946],
    ],
    trendHistory: [
      { timeLabel: '04:00', score: 22 },
      { timeLabel: '06:00', score: 25 },
      { timeLabel: '08:00', score: 31 },
      { timeLabel: '10:00', score: 29 },
      { timeLabel: '12:00', score: 28 },
    ],
  },
  {
    id: 'COR-06',
    name: 'Bengaluru–Hyderabad',
    highway: 'NH44 Deccan Tech & Pharma Spine',
    origin: 'Bengaluru',
    destination: 'Hyderabad',
    distanceKm: 570,
    baselineHours: 10.5,
    riskScore: 31,
    weatherSeverity: 26,
    rainfallIntensity: 6,
    trafficCongestion: 34,
    historicalIncidentFreq: 32,
    infrastructureCondition: 28,
    routeFlexibility: 35,
    estimatedDelayHours: 0.5,
    contributingFactors: [
      'Clear 6-lane highway telemetry; minor toll queue near Devanahalli & Kurnool',
    ],
    recommendedActions: [
      'Continue scheduled express cold-chain runs between Genome Valley and Peenya',
    ],
    roadGeometry: [
      [12.9716, 77.5946],
      [13.4355, 77.728],
      [14.167, 77.8092],
      [14.6819, 77.6006],
      [15.2289, 77.815],
      [15.8281, 78.0373],
      [16.3821, 78.0815],
      [16.758, 78.1322],
      [17.385, 78.4867],
    ],
    trendHistory: [
      { timeLabel: '04:00', score: 26 },
      { timeLabel: '06:00', score: 28 },
      { timeLabel: '08:00', score: 33 },
      { timeLabel: '10:00', score: 30 },
      { timeLabel: '12:00', score: 31 },
    ],
  },
  {
    id: 'COR-07',
    name: 'Ahmedabad–Mumbai',
    highway: 'NH48 Golden Quadrilateral West Coast Segment',
    origin: 'Ahmedabad',
    destination: 'Mumbai',
    distanceKm: 526,
    baselineHours: 10.2,
    riskScore: 67,
    weatherSeverity: 74,
    rainfallIntensity: 36,
    trafficCongestion: 71,
    historicalIncidentFreq: 62,
    infrastructureCondition: 54,
    routeFlexibility: 60,
    estimatedDelayHours: 3.4,
    contributingFactors: [
      'Coastal rainfall across Surat–Navsari–Vapi industrial belt',
      'Congestion at Ankleshwar GIDC & Dahisar check-naka',
    ],
    recommendedActions: [
      'Coordinate port-bound container arrivals outside 08:00–11:00 peak window',
    ],
    roadGeometry: [
      [23.0225, 72.5714],
      [22.6916, 72.8634],
      [22.3072, 73.1812],
      [21.7051, 72.9959],
      [21.1702, 72.8311],
      [20.7645, 72.9621],
      [20.3893, 72.9106],
      [19.7667, 72.9115],
      [19.076, 72.8777],
    ],
    trendHistory: [
      { timeLabel: '04:00', score: 51 },
      { timeLabel: '06:00', score: 58 },
      { timeLabel: '08:00', score: 63 },
      { timeLabel: '10:00', score: 66 },
      { timeLabel: '12:00', score: 67 },
    ],
  },
  {
    id: 'COR-08',
    name: 'Lucknow–Delhi',
    highway: 'Agra–Lucknow & Yamuna Expressway / NH27',
    origin: 'Lucknow',
    destination: 'Delhi',
    distanceKm: 554,
    baselineHours: 8.8,
    riskScore: 39,
    weatherSeverity: 35,
    rainfallIntensity: 10,
    trafficCongestion: 44,
    historicalIncidentFreq: 41,
    infrastructureCondition: 30,
    routeFlexibility: 32,
    estimatedDelayHours: 0.9,
    contributingFactors: [
      'Localized morning haze near Etawah–Agra river plain',
      'Moderate commercial queue at Greater Noida Zero Point',
    ],
    recommendedActions: [
      'Maintain expressway routing; monitor speed compliance below 80 km/h',
    ],
    roadGeometry: [
      [26.8467, 80.9462],
      [26.9214, 80.4321],
      [27.0512, 79.9134],
      [26.7821, 79.0215],
      [27.1767, 78.0081],
      [27.6845, 77.6912],
      [28.1245, 77.5412],
      [28.4744, 77.504],
      [28.6139, 77.209],
    ],
    trendHistory: [
      { timeLabel: '04:00', score: 42 },
      { timeLabel: '06:00', score: 44 },
      { timeLabel: '08:00', score: 41 },
      { timeLabel: '10:00', score: 38 },
      { timeLabel: '12:00', score: 39 },
    ],
  },
];

export const INITIAL_DRIVERS: Driver[] = [
  { id: 'DRV-01', name: 'Rajeshwar Singh Shekhawat', phone: '+91-98290-41102', licenseNumber: 'RJ14-20140089211', experienceYears: 12, assignedVehicleId: 'VEH-101', currentShipmentId: 'SHP-1024', safetyScore: 96, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 5.5, emergencyContact: '+91-98290-99100' },
  { id: 'DRV-02', name: 'Gurmukh Singh Gill', phone: '+91-98112-73419', licenseNumber: 'HR55-20120045109', experienceYears: 15, assignedVehicleId: 'VEH-102', currentShipmentId: 'SHP-1001', safetyScore: 94, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 4.2, emergencyContact: '+91-98112-00122' },
  { id: 'DRV-03', name: 'Mahadev Patil', phone: '+91-98220-61830', licenseNumber: 'MH12-20160031982', experienceYears: 9, assignedVehicleId: 'VEH-103', currentShipmentId: 'SHP-1003', safetyScore: 91, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 6.0, emergencyContact: '+91-98220-11209' },
  { id: 'DRV-04', name: 'Sukhdev Yadav', phone: '+91-94150-88214', licenseNumber: 'UP32-20150077312', experienceYears: 11, assignedVehicleId: 'VEH-104', currentShipmentId: 'SHP-1004', safetyScore: 89, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 3.8, emergencyContact: '+91-94150-33219' },
  { id: 'DRV-05', name: 'Karthikeya Murugan', phone: '+91-94441-52901', licenseNumber: 'TN09-20170019482', experienceYears: 8, assignedVehicleId: 'VEH-105', currentShipmentId: 'SHP-1005', safetyScore: 97, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 6.5, emergencyContact: '+91-94441-88012' },
  { id: 'DRV-06', name: 'Basavaraj Gowda', phone: '+91-99001-34812', licenseNumber: 'KA01-20130091823', experienceYears: 13, assignedVehicleId: 'VEH-106', currentShipmentId: 'SHP-1006', safetyScore: 95, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 5.0, emergencyContact: '+91-99001-77123' },
  { id: 'DRV-07', name: 'Pravinbhai Solanki', phone: '+91-98250-71920', licenseNumber: 'GJ01-20150064120', experienceYears: 10, assignedVehicleId: 'VEH-107', currentShipmentId: 'SHP-1007', safetyScore: 92, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 4.7, emergencyContact: '+91-98250-22104' },
  { id: 'DRV-08', name: 'Harvinder Kumar', phone: '+91-98180-49281', licenseNumber: 'DL01-20180028194', experienceYears: 7, assignedVehicleId: 'VEH-108', currentShipmentId: 'SHP-1008', safetyScore: 90, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 7.1, emergencyContact: '+91-98180-66512' },
  { id: 'DRV-09', name: 'Subhash Chatterjee', phone: '+91-98301-65109', licenseNumber: 'WB23-20140051290', experienceYears: 11, assignedVehicleId: 'VEH-109', currentShipmentId: 'SHP-1009', safetyScore: 93, dutyStatus: 'Rest Break', shiftHoursRemaining: 2.5, emergencyContact: '+91-98301-00981' },
  { id: 'DRV-10', name: 'Rameshchandra Meena', phone: '+91-94140-92811', licenseNumber: 'RJ27-20160081234', experienceYears: 9, assignedVehicleId: 'VEH-110', currentShipmentId: 'SHP-1010', safetyScore: 88, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 5.2, emergencyContact: '+91-94140-11420' },
  { id: 'DRV-11', name: 'Venkatesh Reddy', phone: '+91-98480-31092', licenseNumber: 'TS09-20150039104', experienceYears: 10, assignedVehicleId: 'VEH-111', currentShipmentId: 'SHP-1011', safetyScore: 96, dutyStatus: 'On Duty - Driving', shiftHoursRemaining: 6.2, emergencyContact: '+91-98480-77890' },
  { id: 'DRV-12', name: 'Dineshwar Tiwari', phone: '+91-99350-44128', licenseNumber: 'UP78-20130074129', experienceYears: 14, assignedVehicleId: 'VEH-112', currentShipmentId: 'SHP-1012', safetyScore: 94, dutyStatus: 'Standby at Hub', shiftHoursRemaining: 8.0, emergencyContact: '+91-99350-88211' },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'VEH-101', registrationNumber: 'HR-55-AN-4821', type: '24ft Refrigerated Reefer', capacityTons: 18, fuelEfficiencyKmPerL: 4.1, driverId: 'DRV-01', currentShipmentId: 'SHP-1024', corridorId: 'COR-01', lat: 24.5854, lng: 73.7125, speedKmh: 44, status: 'Delayed in Congestion', fuelLevelPercent: 78, lastUpdated: '2 mins ago' },
  { id: 'VEH-102', registrationNumber: 'MH-04-KU-9104', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 3.9, driverId: 'DRV-02', currentShipmentId: 'SHP-1001', corridorId: 'COR-01', lat: 22.3072, lng: 73.1812, speedKmh: 28, status: 'Delayed in Congestion', fuelLevelPercent: 64, lastUpdated: '1 min ago' },
  { id: 'VEH-103', registrationNumber: 'MH-12-PQ-7731', type: '40ft Heavy Flatbed Trailer', capacityTons: 35, fuelEfficiencyKmPerL: 3.2, driverId: 'DRV-03', currentShipmentId: 'SHP-1003', corridorId: 'COR-03', lat: 18.7557, lng: 73.4091, speedKmh: 31, status: 'Delayed in Congestion', fuelLevelPercent: 71, lastUpdated: '3 mins ago' },
  { id: 'VEH-104', registrationNumber: 'UP-32-DN-8412', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.0, driverId: 'DRV-04', currentShipmentId: 'SHP-1004', corridorId: 'COR-04', lat: 25.4358, lng: 81.8463, speedKmh: 56, status: 'Active En Route', fuelLevelPercent: 82, lastUpdated: '2 mins ago' },
  { id: 'VEH-105', registrationNumber: 'TN-09-BL-5520', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.4, driverId: 'DRV-05', currentShipmentId: 'SHP-1005', corridorId: 'COR-05', lat: 12.9165, lng: 79.1325, speedKmh: 64, status: 'Active En Route', fuelLevelPercent: 88, lastUpdated: '1 min ago' },
  { id: 'VEH-106', registrationNumber: 'KA-01-MP-6190', type: '24ft Refrigerated Reefer', capacityTons: 18, fuelEfficiencyKmPerL: 4.5, driverId: 'DRV-06', currentShipmentId: 'SHP-1006', corridorId: 'COR-06', lat: 15.8281, lng: 78.0373, speedKmh: 62, status: 'Active En Route', fuelLevelPercent: 75, lastUpdated: '4 mins ago' },
  { id: 'VEH-107', registrationNumber: 'GJ-01-HT-7742', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.1, driverId: 'DRV-07', currentShipmentId: 'SHP-1007', corridorId: 'COR-07', lat: 21.1702, lng: 72.8311, speedKmh: 36, status: 'Delayed in Congestion', fuelLevelPercent: 69, lastUpdated: '2 mins ago' },
  { id: 'VEH-108', registrationNumber: 'DL-01-GC-3390', type: '20ft LCV Express', capacityTons: 12, fuelEfficiencyKmPerL: 5.4, driverId: 'DRV-08', currentShipmentId: 'SHP-1008', corridorId: 'COR-02', lat: 27.8891, lng: 76.2845, speedKmh: 58, status: 'Active En Route', fuelLevelPercent: 91, lastUpdated: '1 min ago' },
  { id: 'VEH-109', registrationNumber: 'WB-23-FC-2940', type: '40ft Heavy Flatbed Trailer', capacityTons: 35, fuelEfficiencyKmPerL: 3.4, driverId: 'DRV-09', currentShipmentId: 'SHP-1009', corridorId: 'COR-04', lat: 23.7957, lng: 86.4304, speedKmh: 48, status: 'Active En Route', fuelLevelPercent: 60, lastUpdated: '5 mins ago' },
  { id: 'VEH-110', registrationNumber: 'RJ-14-GT-3319', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.2, driverId: 'DRV-10', currentShipmentId: 'SHP-1010', corridorId: 'COR-01', lat: 26.4499, lng: 74.6399, speedKmh: 52, status: 'Active En Route', fuelLevelPercent: 84, lastUpdated: '2 mins ago' },
  { id: 'VEH-111', registrationNumber: 'TS-09-UB-4418', type: '24ft Refrigerated Reefer', capacityTons: 18, fuelEfficiencyKmPerL: 4.6, driverId: 'DRV-11', currentShipmentId: 'SHP-1011', corridorId: 'COR-06', lat: 14.6819, lng: 77.6006, speedKmh: 65, status: 'Active En Route', fuelLevelPercent: 79, lastUpdated: '3 mins ago' },
  { id: 'VEH-112', registrationNumber: 'UP-78-AT-9012', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.3, driverId: 'DRV-12', currentShipmentId: 'SHP-1012', corridorId: 'COR-08', lat: 27.1767, lng: 78.0081, speedKmh: 61, status: 'Active En Route', fuelLevelPercent: 86, lastUpdated: '2 mins ago' },
  { id: 'VEH-113', registrationNumber: 'HR-38-V-8821', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.0, driverId: 'DRV-01', currentShipmentId: 'SHP-1013', corridorId: 'COR-01', lat: 21.7051, lng: 72.9959, speedKmh: 24, status: 'Delayed in Congestion', fuelLevelPercent: 57, lastUpdated: '1 min ago' },
  { id: 'VEH-114', registrationNumber: 'GJ-05-BX-1920', type: '24ft Refrigerated Reefer', capacityTons: 18, fuelEfficiencyKmPerL: 4.2, driverId: 'DRV-02', currentShipmentId: 'SHP-1014', corridorId: 'COR-07', lat: 20.3893, lng: 72.9106, speedKmh: 39, status: 'Active En Route', fuelLevelPercent: 73, lastUpdated: '3 mins ago' },
  { id: 'VEH-115', registrationNumber: 'MH-46-F-6612', type: '40ft Heavy Flatbed Trailer', capacityTons: 35, fuelEfficiencyKmPerL: 3.3, driverId: 'DRV-03', currentShipmentId: 'SHP-1015', corridorId: 'COR-03', lat: 18.9894, lng: 73.1175, speedKmh: 34, status: 'Delayed in Congestion', fuelLevelPercent: 68, lastUpdated: '4 mins ago' },
  { id: 'VEH-116', registrationNumber: 'DL-04-CA-5501', type: '20ft LCV Express', capacityTons: 12, fuelEfficiencyKmPerL: 5.5, driverId: 'DRV-04', currentShipmentId: 'SHP-1016', corridorId: 'COR-02', lat: 28.192, lng: 76.6191, speedKmh: 55, status: 'Active En Route', fuelLevelPercent: 90, lastUpdated: '2 mins ago' },
  { id: 'VEH-117', registrationNumber: 'TN-22-CR-7104', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.4, driverId: 'DRV-05', currentShipmentId: 'SHP-1017', corridorId: 'COR-05', lat: 12.5186, lng: 78.2137, speedKmh: 63, status: 'Active En Route', fuelLevelPercent: 81, lastUpdated: '1 min ago' },
  { id: 'VEH-118', registrationNumber: 'KA-51-AD-3091', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.3, driverId: 'DRV-06', currentShipmentId: 'SHP-1018', corridorId: 'COR-06', lat: 16.3821, lng: 78.0815, speedKmh: 59, status: 'Active En Route', fuelLevelPercent: 77, lastUpdated: '2 mins ago' },
  { id: 'VEH-119', registrationNumber: 'UP-16-BT-4190', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.1, driverId: 'DRV-07', currentShipmentId: 'SHP-1019', corridorId: 'COR-08', lat: 26.9214, lng: 80.4321, speedKmh: 60, status: 'Active En Route', fuelLevelPercent: 85, lastUpdated: '3 mins ago' },
  { id: 'VEH-120', registrationNumber: 'WB-11-D-8834', type: '40ft Heavy Flatbed Trailer', capacityTons: 35, fuelEfficiencyKmPerL: 3.5, driverId: 'DRV-08', currentShipmentId: 'SHP-1020', corridorId: 'COR-04', lat: 25.3176, lng: 82.9739, speedKmh: 49, status: 'Active En Route', fuelLevelPercent: 66, lastUpdated: '5 mins ago' },
  { id: 'VEH-121', registrationNumber: 'RJ-06-GA-9921', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.2, driverId: 'DRV-09', currentShipmentId: 'SHP-1021', corridorId: 'COR-01', lat: 25.3407, lng: 73.9822, speedKmh: 47, status: 'Active En Route', fuelLevelPercent: 74, lastUpdated: '2 mins ago' },
  { id: 'VEH-122', registrationNumber: 'GJ-18-Z-4410', type: '24ft Refrigerated Reefer', capacityTons: 18, fuelEfficiencyKmPerL: 4.3, driverId: 'DRV-10', currentShipmentId: 'SHP-1022', corridorId: 'COR-07', lat: 22.6916, lng: 72.8634, speedKmh: 42, status: 'Active En Route', fuelLevelPercent: 80, lastUpdated: '4 mins ago' },
  { id: 'VEH-123', registrationNumber: 'MH-14-EM-2201', type: '20ft LCV Express', capacityTons: 12, fuelEfficiencyKmPerL: 5.2, driverId: 'DRV-11', currentShipmentId: 'SHP-1023', corridorId: 'COR-03', lat: 18.6298, lng: 73.7997, speedKmh: 45, status: 'Active En Route', fuelLevelPercent: 83, lastUpdated: '2 mins ago' },
  { id: 'VEH-124', registrationNumber: 'HR-55-AC-1108', type: '32ft Multi-Axle Container', capacityTons: 25, fuelEfficiencyKmPerL: 4.1, driverId: 'DRV-12', currentShipmentId: 'SHP-1025', corridorId: 'COR-01', lat: 28.4595, lng: 77.0266, speedKmh: 0, status: 'At Hub / Loading', fuelLevelPercent: 96, lastUpdated: 'Just now' },
  { id: 'VEH-125', registrationNumber: 'KA-04-C-7812', type: '20ft LCV Express', capacityTons: 12, fuelEfficiencyKmPerL: 5.1, driverId: 'DRV-05', currentShipmentId: null, corridorId: 'COR-05', lat: 12.9716, lng: 77.5946, speedKmh: 0, status: 'Maintenance Alert', fuelLevelPercent: 52, lastUpdated: '12 mins ago' },
];

// Deterministic generator for 40 internally consistent Indian freight shipments (including SHP-1024)
const RAW_SHIPMENTS_CONFIG: Array<{
  id: string;
  customer: string;
  cargo: string;
  weight: number;
  origin: string;
  dest: string;
  stops: string[];
  corridorId: string;
  vehId: string;
  drvId: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Standard';
  valueINR: number;
  penaltyPerHr: number;
  status: 'In Transit' | 'Delayed' | 'At Risk' | 'Loading' | 'Delivered';
  progress: number;
  delayHrs: number;
}> = [
  { id: 'SHP-1024', customer: 'Cipla Lifesciences Ltd.', cargo: 'Pharmaceutical Cold-Chain Biologics', weight: 16.5, origin: 'Delhi', dest: 'Mumbai', stops: ['Jaipur', 'Ahmedabad'], corridorId: 'COR-01', vehId: 'VEH-101', drvId: 'DRV-01', priority: 'Critical', valueINR: 18500000, penaltyPerHr: 22000, status: 'At Risk', progress: 48, delayHrs: 5.5 },
  { id: 'SHP-1001', customer: 'Tata Motors Passenger Vehicles', cargo: 'Precision Powertrain Assemblies', weight: 22.0, origin: 'Delhi', dest: 'Mumbai', stops: ['Jaipur', 'Vadodara'], corridorId: 'COR-01', vehId: 'VEH-102', drvId: 'DRV-02', priority: 'Critical', valueINR: 14200000, penaltyPerHr: 19500, status: 'Delayed', progress: 64, delayHrs: 6.0 },
  { id: 'SHP-1002', customer: 'Reliance Retail Supply Chain', cargo: 'FMCG & Packaged Consumer Goods', weight: 24.0, origin: 'Ahmedabad', dest: 'Mumbai', stops: ['Vadodara', 'Surat'], corridorId: 'COR-07', vehId: 'VEH-107', drvId: 'DRV-07', priority: 'High', valueINR: 6800000, penaltyPerHr: 14000, status: 'At Risk', progress: 55, delayHrs: 3.4 },
  { id: 'SHP-1003', customer: 'Larsen & Toubro Heavy Engg.', cargo: 'Industrial Switchgear & Turbines', weight: 32.5, origin: 'Mumbai', dest: 'Pune', stops: ['Navi Mumbai', 'Lonavala'], corridorId: 'COR-03', vehId: 'VEH-103', drvId: 'DRV-03', priority: 'Critical', valueINR: 21000000, penaltyPerHr: 24000, status: 'Delayed', progress: 52, delayHrs: 2.8 },
  { id: 'SHP-1004', customer: 'ITC Limited — Agri & Foods', cargo: 'Packaged Staples & Confectionery', weight: 23.0, origin: 'Delhi', dest: 'Kolkata', stops: ['Agra', 'Kanpur', 'Varanasi'], corridorId: 'COR-04', vehId: 'VEH-104', drvId: 'DRV-04', priority: 'High', valueINR: 7400000, penaltyPerHr: 12500, status: 'In Transit', progress: 46, delayHrs: 2.2 },
  { id: 'SHP-1005', customer: 'Foxconn Hon Hai India', cargo: 'High-Value Smartphone PCB Modules', weight: 14.0, origin: 'Chennai', dest: 'Bengaluru', stops: ['Sriperumbudur', 'Vellore', 'Hosur'], corridorId: 'COR-05', vehId: 'VEH-105', drvId: 'DRV-05', priority: 'Critical', valueINR: 26500000, penaltyPerHr: 25000, status: 'In Transit', progress: 68, delayHrs: 0 },
  { id: 'SHP-1006', customer: 'Dr. Reddy’s Laboratories', cargo: 'Active Pharmaceutical Ingredients', weight: 15.5, origin: 'Bengaluru', dest: 'Hyderabad', stops: ['Anantapur', 'Kurnool'], corridorId: 'COR-06', vehId: 'VEH-106', drvId: 'DRV-06', priority: 'Critical', valueINR: 19200000, penaltyPerHr: 21000, status: 'In Transit', progress: 61, delayHrs: 0 },
  { id: 'SHP-1007', customer: 'Asian Paints Industrial', cargo: 'Specialty Polymers & Pigments', weight: 24.5, origin: 'Ahmedabad', dest: 'Mumbai', stops: ['Bharuch', 'Vapi'], corridorId: 'COR-07', vehId: 'VEH-114', drvId: 'DRV-02', priority: 'Medium', valueINR: 5400000, penaltyPerHr: 9500, status: 'Delayed', progress: 72, delayHrs: 3.8 },
  { id: 'SHP-1008', customer: 'Maruti Suzuki India Ltd.', cargo: 'Just-In-Time Stamped Body Panels', weight: 11.5, origin: 'Delhi', dest: 'Jaipur', stops: ['Gurugram', 'Behror'], corridorId: 'COR-02', vehId: 'VEH-108', drvId: 'DRV-08', priority: 'High', valueINR: 8900000, penaltyPerHr: 16000, status: 'In Transit', progress: 58, delayHrs: 0.8 },
  { id: 'SHP-1009', customer: 'Tata Steel Downstream', cargo: 'Cold-Rolled Galvanized Coils', weight: 34.0, origin: 'Delhi', dest: 'Kolkata', stops: ['Kanpur', 'Dhanbad'], corridorId: 'COR-04', vehId: 'VEH-109', drvId: 'DRV-09', priority: 'Medium', valueINR: 11200000, penaltyPerHr: 13000, status: 'In Transit', progress: 74, delayHrs: 2.5 },
  { id: 'SHP-1010', customer: 'Mahindra & Mahindra Farm', cargo: 'Tractor Hydraulic Transmissions', weight: 21.0, origin: 'Delhi', dest: 'Mumbai', stops: ['Jaipur', 'Udaipur', 'Surat'], corridorId: 'COR-01', vehId: 'VEH-110', drvId: 'DRV-10', priority: 'High', valueINR: 12800000, penaltyPerHr: 17500, status: 'At Risk', progress: 35, delayHrs: 4.8 },
  { id: 'SHP-1011', customer: 'Biocon Biologics Ltd.', cargo: 'Temperature-Controlled Insulin Vials', weight: 14.2, origin: 'Bengaluru', dest: 'Hyderabad', stops: ['Kurnool'], corridorId: 'COR-06', vehId: 'VEH-111', drvId: 'DRV-11', priority: 'Critical', valueINR: 22400000, penaltyPerHr: 23500, status: 'In Transit', progress: 42, delayHrs: 0 },
  { id: 'SHP-1012', customer: 'Flipkart Instakart North', cargo: 'E-Commerce Consolidated Fulfillment', weight: 19.5, origin: 'Lucknow', dest: 'Delhi', stops: ['Agra', 'Greater Noida'], corridorId: 'COR-08', vehId: 'VEH-112', drvId: 'DRV-12', priority: 'High', valueINR: 9600000, penaltyPerHr: 15000, status: 'In Transit', progress: 63, delayHrs: 0.5 },
  { id: 'SHP-1013', customer: 'Sun Pharmaceutical Ind.', cargo: 'Sterile Injectable Formulations', weight: 16.0, origin: 'Delhi', dest: 'Mumbai', stops: ['Vadodara', 'Bharuch'], corridorId: 'COR-01', vehId: 'VEH-113', drvId: 'DRV-01', priority: 'Critical', valueINR: 17600000, penaltyPerHr: 21000, status: 'Delayed', progress: 71, delayHrs: 5.8 },
  { id: 'SHP-1014', customer: 'Amul GCMMF Dairy Co-op', cargo: 'Chilled Dairy & Butter Bulk Packs', weight: 17.8, origin: 'Ahmedabad', dest: 'Mumbai', stops: ['Vadodara', 'Surat'], corridorId: 'COR-07', vehId: 'VEH-122', drvId: 'DRV-10', priority: 'High', valueINR: 6200000, penaltyPerHr: 14500, status: 'At Risk', progress: 39, delayHrs: 3.1 },
  { id: 'SHP-1015', customer: 'Bharat Forge Limited', cargo: 'Forged Crankshafts & Axles', weight: 31.0, origin: 'Mumbai', dest: 'Pune', stops: ['Panvel'], corridorId: 'COR-03', vehId: 'VEH-115', drvId: 'DRV-03', priority: 'High', valueINR: 13400000, penaltyPerHr: 16500, status: 'Delayed', progress: 44, delayHrs: 2.9 },
  { id: 'SHP-1016', customer: 'Hero MotoCorp Supply', cargo: 'Alloy Wheels & Braking Systems', weight: 11.0, origin: 'Delhi', dest: 'Jaipur', stops: ['Dharuhera'], corridorId: 'COR-02', vehId: 'VEH-116', drvId: 'DRV-04', priority: 'Medium', valueINR: 5800000, penaltyPerHr: 10500, status: 'In Transit', progress: 41, delayHrs: 0.6 },
  { id: 'SHP-1017', customer: 'Ashok Leyland Ennore', cargo: 'Heavy Diesel Engine Blocks', weight: 23.5, origin: 'Chennai', dest: 'Bengaluru', stops: ['Vellore', 'Krishnagiri'], corridorId: 'COR-05', vehId: 'VEH-117', drvId: 'DRV-05', priority: 'High', valueINR: 11900000, penaltyPerHr: 14000, status: 'In Transit', progress: 77, delayHrs: 0 },
  { id: 'SHP-1018', customer: 'Bharat Electronics (BEL)', cargo: 'Defense Avionics & Radar Rack Units', weight: 13.0, origin: 'Bengaluru', dest: 'Hyderabad', stops: ['Anantapur'], corridorId: 'COR-06', vehId: 'VEH-118', drvId: 'DRV-06', priority: 'Critical', valueINR: 28000000, penaltyPerHr: 26000, status: 'In Transit', progress: 79, delayHrs: 0 },
  { id: 'SHP-1019', customer: 'Hindustan Unilever (HUL)', cargo: 'Personal Care & Home Hygiene Skids', weight: 22.5, origin: 'Lucknow', dest: 'Delhi', stops: ['Kanpur', 'Agra'], corridorId: 'COR-08', vehId: 'VEH-119', drvId: 'DRV-07', priority: 'Medium', valueINR: 6400000, penaltyPerHr: 11000, status: 'In Transit', progress: 38, delayHrs: 0.4 },
  { id: 'SHP-1020', customer: 'Hindalco Industries', cargo: 'Extruded Aluminum Ingots', weight: 33.0, origin: 'Delhi', dest: 'Kolkata', stops: ['Prayagraj', 'Asansol'], corridorId: 'COR-04', vehId: 'VEH-120', drvId: 'DRV-08', priority: 'Medium', valueINR: 10800000, penaltyPerHr: 12000, status: 'In Transit', progress: 57, delayHrs: 1.9 },
  { id: 'SHP-1021', customer: 'Godrej & Boyce Mfg.', cargo: 'Commercial Refrigeration Compressors', weight: 20.0, origin: 'Delhi', dest: 'Mumbai', stops: ['Jaipur', 'Udaipur'], corridorId: 'COR-01', vehId: 'VEH-121', drvId: 'DRV-09', priority: 'High', valueINR: 9800000, penaltyPerHr: 15500, status: 'At Risk', progress: 45, delayHrs: 4.5 },
  { id: 'SHP-1022', customer: 'Zydus Lifesciences', cargo: 'Vaccine Cold-Box Consignment', weight: 15.0, origin: 'Ahmedabad', dest: 'Mumbai', stops: ['Surat'], corridorId: 'COR-07', vehId: 'VEH-122', drvId: 'DRV-10', priority: 'Critical', valueINR: 19500000, penaltyPerHr: 22500, status: 'At Risk', progress: 49, delayHrs: 3.2 },
  { id: 'SHP-1023', customer: 'Bajaj Auto Chakan Hub', cargo: 'EV Battery Packs & Controllers', weight: 11.8, origin: 'Mumbai', dest: 'Pune', stops: ['Talegaon'], corridorId: 'COR-03', vehId: 'VEH-123', drvId: 'DRV-11', priority: 'High', valueINR: 14600000, penaltyPerHr: 18000, status: 'At Risk', progress: 78, delayHrs: 2.1 },
  { id: 'SHP-1025', customer: 'Siemens Energy India', cargo: 'High-Voltage Transformer Bushings', weight: 24.0, origin: 'Delhi', dest: 'Mumbai', stops: ['Jaipur', 'Vadodara'], corridorId: 'COR-01', vehId: 'VEH-124', drvId: 'DRV-12', priority: 'High', valueINR: 15800000, penaltyPerHr: 18500, status: 'Loading', progress: 5, delayHrs: 3.5 },
  { id: 'SHP-1026', customer: 'Samsung India Electronics', cargo: 'OLED Display Panels & White Goods', weight: 18.0, origin: 'Delhi', dest: 'Kolkata', stops: ['Kanpur', 'Varanasi'], corridorId: 'COR-04', vehId: 'VEH-104', drvId: 'DRV-04', priority: 'High', valueINR: 16200000, penaltyPerHr: 17000, status: 'In Transit', progress: 52, delayHrs: 1.8 },
  { id: 'SHP-1027', customer: 'TVS Motor Company', cargo: 'Two-Wheeler CKD Export Kits', weight: 21.5, origin: 'Chennai', dest: 'Bengaluru', stops: ['Hosur'], corridorId: 'COR-05', vehId: 'VEH-105', drvId: 'DRV-05', priority: 'Medium', valueINR: 8200000, penaltyPerHr: 11500, status: 'Delivered', progress: 100, delayHrs: 0 },
  { id: 'SHP-1028', customer: 'Aurobindo Pharma Ltd.', cargo: 'Bulk Cephalosporin Intermediates', weight: 17.0, origin: 'Bengaluru', dest: 'Hyderabad', stops: ['Kurnool'], corridorId: 'COR-06', vehId: 'VEH-106', drvId: 'DRV-06', priority: 'High', valueINR: 13900000, penaltyPerHr: 16500, status: 'Delivered', progress: 100, delayHrs: 0 },
  { id: 'SHP-1029', customer: 'UltraTech Cement Infra', cargo: 'Specialty Waterproofing Admixtures', weight: 25.0, origin: 'Delhi', dest: 'Jaipur', stops: ['Gurugram'], corridorId: 'COR-02', vehId: 'VEH-108', drvId: 'DRV-08', priority: 'Standard', valueINR: 3800000, penaltyPerHr: 7500, status: 'Delivered', progress: 100, delayHrs: 0 },
  { id: 'SHP-1030', customer: 'Nestlé India Limited', cargo: 'Infant Nutrition & Dairy Powders', weight: 19.0, origin: 'Lucknow', dest: 'Delhi', stops: ['Agra'], corridorId: 'COR-08', vehId: 'VEH-112', drvId: 'DRV-12', priority: 'High', valueINR: 9100000, penaltyPerHr: 14000, status: 'In Transit', progress: 67, delayHrs: 0.3 },
  { id: 'SHP-1031', customer: 'Reliance Petrochemicals', cargo: 'Polypropylene Granules Grade-A', weight: 25.0, origin: 'Ahmedabad', dest: 'Mumbai', stops: ['Vadodara', 'Vapi'], corridorId: 'COR-07', vehId: 'VEH-107', drvId: 'DRV-07', priority: 'Medium', valueINR: 7600000, penaltyPerHr: 12000, status: 'At Risk', progress: 61, delayHrs: 3.0 },
  { id: 'SHP-1032', customer: 'Cummins India Pune', cargo: 'Industrial Diesel Generator Sets', weight: 28.0, origin: 'Mumbai', dest: 'Pune', stops: ['Khalapur'], corridorId: 'COR-03', vehId: 'VEH-103', drvId: 'DRV-03', priority: 'High', valueINR: 15400000, penaltyPerHr: 17500, status: 'Delayed', progress: 48, delayHrs: 2.6 },
  { id: 'SHP-1033', customer: 'Havells India Electricals', cargo: 'Industrial Armored Power Cables', weight: 23.0, origin: 'Delhi', dest: 'Jaipur', stops: ['Behror'], corridorId: 'COR-02', vehId: 'VEH-116', drvId: 'DRV-04', priority: 'Standard', valueINR: 6700000, penaltyPerHr: 9000, status: 'In Transit', progress: 73, delayHrs: 0.5 },
  { id: 'SHP-1034', customer: 'Dabur India Consumer', cargo: 'Ayurvedic Healthcare & Beverages', weight: 20.5, origin: 'Lucknow', dest: 'Delhi', stops: ['Etawah', 'Agra'], corridorId: 'COR-08', vehId: 'VEH-119', drvId: 'DRV-07', priority: 'Standard', valueINR: 5300000, penaltyPerHr: 8500, status: 'Delivered', progress: 100, delayHrs: 0 },
  { id: 'SHP-1035', customer: 'JSW Steel Coated Products', cargo: 'Pre-Painted Galvalume Sheets', weight: 34.5, origin: 'Mumbai', dest: 'Pune', stops: ['Panvel'], corridorId: 'COR-03', vehId: 'VEH-115', drvId: 'DRV-03', priority: 'Medium', valueINR: 9900000, penaltyPerHr: 13500, status: 'In Transit', progress: 60, delayHrs: 1.9 },
  { id: 'SHP-1036', customer: 'Dell Technologies Sriperumbudur', cargo: 'Enterprise Server Racks', weight: 15.0, origin: 'Chennai', dest: 'Bengaluru', stops: ['Vellore'], corridorId: 'COR-05', vehId: 'VEH-117', drvId: 'DRV-05', priority: 'Critical', valueINR: 24000000, penaltyPerHr: 23000, status: 'In Transit', progress: 84, delayHrs: 0 },
  { id: 'SHP-1037', customer: 'lupin Pharmaceuticals', cargo: 'Respiratory Inhalation Cartridges', weight: 14.8, origin: 'Delhi', dest: 'Mumbai', stops: ['Jaipur', 'Udaipur', 'Vadodara'], corridorId: 'COR-01', vehId: 'VEH-110', drvId: 'DRV-10', priority: 'Critical', valueINR: 16900000, penaltyPerHr: 20500, status: 'At Risk', progress: 40, delayHrs: 5.1 },
  { id: 'SHP-1038', customer: 'Exide Industries Haldia', cargo: 'Industrial Lead-Acid & Li-Ion Cells', weight: 24.8, origin: 'Delhi', dest: 'Kolkata', stops: ['Agra', 'Varanasi', 'Dhanbad'], corridorId: 'COR-04', vehId: 'VEH-120', drvId: 'DRV-08', priority: 'High', valueINR: 11500000, penaltyPerHr: 15000, status: 'In Transit', progress: 66, delayHrs: 2.1 },
  { id: 'SHP-1039', customer: 'Britannia Industries', cargo: 'Packaged Bakery & Export Assortment', weight: 18.5, origin: 'Bengaluru', dest: 'Hyderabad', stops: ['Anantapur'], corridorId: 'COR-06', vehId: 'VEH-118', drvId: 'DRV-06', priority: 'Standard', valueINR: 4900000, penaltyPerHr: 8000, status: 'Delivered', progress: 100, delayHrs: 0 },
  { id: 'SHP-1040', customer: 'Pidilite Industries Vapi', cargo: 'Industrial Adhesives & Sealants', weight: 22.0, origin: 'Ahmedabad', dest: 'Mumbai', stops: ['Bharuch', 'Vapi'], corridorId: 'COR-07', vehId: 'VEH-114', drvId: 'DRV-02', priority: 'Medium', valueINR: 7100000, penaltyPerHr: 11000, status: 'In Transit', progress: 80, delayHrs: 2.4 },
];

const corridorRiskLookup: Record<string, number> = {
  'COR-01': 78,
  'COR-02': 46,
  'COR-03': 72,
  'COR-04': 58,
  'COR-05': 28,
  'COR-06': 31,
  'COR-07': 67,
  'COR-08': 39,
};

export const INITIAL_SHIPMENTS: Shipment[] = RAW_SHIPMENTS_CONFIG.map((item, idx) => {
  const baseCorridorRisk = corridorRiskLookup[item.corridorId] || 45;
  const priorityBump = item.priority === 'Critical' ? 4 : item.priority === 'High' ? 2 : 0;
  const riskScore = item.status === 'Delivered' ? 12 : Math.min(96, baseCorridorRisk + priorityBump);
  const pickupDay = 24 + (idx % 3);
  const deliveryDay = pickupDay + (item.corridorId === 'COR-01' || item.corridorId === 'COR-04' ? 2 : 1);

  return {
    id: item.id,
    customerName: item.customer,
    cargoType: item.cargo,
    cargoWeightTons: item.weight,
    origin: item.origin,
    destination: item.dest,
    intermediateStops: item.stops,
    pickupDate: `2026-10-${pickupDay} 06:00`,
    expectedDeliveryDate: `2026-10-${deliveryDay} 18:00`,
    assignedVehicleId: item.vehId,
    assignedDriverId: item.drvId,
    priority: item.priority,
    estimatedValueINR: item.valueINR,
    delayPenaltyPerHour: item.penaltyPerHr,
    status: item.status,
    corridorId: item.corridorId,
    progressPercent: item.progress,
    riskScore,
    predictedDelayHours: item.delayHrs,
    etaText:
      item.status === 'Delivered'
        ? 'Delivered on schedule'
        : item.delayHrs > 0
        ? `2026-10-${deliveryDay} ${Math.min(23, Math.round(18 + item.delayHrs))}:30 (+${item.delayHrs}h delay)`
        : `2026-10-${deliveryDay} 17:45 (On Time)`,
  };
});

// 5 Active Alerts + 10 Historical Disruptions
export const INITIAL_ALERTS: DisruptionAlert[] = [
  {
    id: 'ALT-01',
    title: 'Severe Monsoon Depression & Waterlogging — NH48 Bharuch–Vadodara Sector',
    corridorId: 'COR-01',
    corridorName: 'Delhi–Mumbai (NH48)',
    type: 'Weather',
    severity: 'Critical',
    description: '48 mm/hr heavy rainfall causing 14 km slow-moving freight queue near Narmada Bridge KM-192. High SLA risk for cold-chain & automotive shipments.',
    timestamp: '14 mins ago',
    lat: 21.7051,
    lng: 72.9959,
    estimatedDelayHours: 5.5,
    affectedShipmentIds: ['SHP-1024', 'SHP-1001', 'SHP-1010', 'SHP-1013', 'SHP-1021', 'SHP-1025', 'SHP-1037'],
    recommendedAction: 'Reroute Critical shipments (SHP-1024, SHP-1001) via Kota–Ujjain–Dhule bypass (NH52).',
    isHistorical: false,
  },
  {
    id: 'ALT-02',
    title: 'Ghat Visibility & Heavy Container Bottleneck — Lonavala Boreghat',
    corridorId: 'COR-03',
    corridorName: 'Mumbai–Pune (NH48 / Expy)',
    type: 'Congestion',
    severity: 'Critical',
    description: 'Dense fog, 41 mm/hr rain, and stalled 40ft flatbed in middle lane near Khalapur–Khandala climb causing +2.8h delay.',
    timestamp: '28 mins ago',
    lat: 18.7557,
    lng: 73.4091,
    estimatedDelayHours: 2.8,
    affectedShipmentIds: ['SHP-1003', 'SHP-1015', 'SHP-1023', 'SHP-1032', 'SHP-1035'],
    recommendedAction: 'Enforce 35 km/h ghat descent protocol and hold non-urgent JNPT dispatches for 90 mins.',
    isHistorical: false,
  },
  {
    id: 'ALT-03',
    title: 'Coastal Squall & Check-Naka Congestion — Surat–Vapi Industrial Belt',
    corridorId: 'COR-07',
    corridorName: 'Ahmedabad–Mumbai (NH48)',
    type: 'Weather',
    severity: 'Warning',
    description: 'High crosswinds and heavy rain slowing multi-axle container movement between Surat and Vapi.',
    timestamp: '42 mins ago',
    lat: 20.3893,
    lng: 72.9106,
    estimatedDelayHours: 3.4,
    affectedShipmentIds: ['SHP-1002', 'SHP-1007', 'SHP-1014', 'SHP-1022', 'SHP-1031', 'SHP-1040'],
    recommendedAction: 'Stagger Vapi & Ankleshwar hub departures and verify reefer diesel levels.',
    isHistorical: false,
  },
  {
    id: 'ALT-04',
    title: 'Coal Corridor Axle Check & Toll Queue — NH19 Dhanbad–Asansol',
    corridorId: 'COR-04',
    corridorName: 'Delhi–Kolkata (NH19)',
    type: 'Congestion',
    severity: 'Warning',
    description: 'Elevated commercial queue at Jharkhand–West Bengal border weighbridge causing 2.6h transit delay.',
    timestamp: '1 hr ago',
    lat: 23.7957,
    lng: 86.4304,
    estimatedDelayHours: 2.6,
    affectedShipmentIds: ['SHP-1004', 'SHP-1009', 'SHP-1020', 'SHP-1026', 'SHP-1038'],
    recommendedAction: 'Pre-validate e-Way Bills and FASTag balances for all eastbound vehicles.',
    isHistorical: false,
  },
  {
    id: 'ALT-05',
    title: 'Flyover Expansion Lane Narrowing — NH48 Behror Junction',
    corridorId: 'COR-02',
    corridorName: 'Delhi–Jaipur (NH48)',
    type: 'Infrastructure',
    severity: 'Advisory',
    description: 'Single-lane diversion for 3.5 km near Behror industrial area adding 1.2h during peak shift.',
    timestamp: '2 hrs ago',
    lat: 27.8891,
    lng: 76.2845,
    estimatedDelayHours: 1.2,
    affectedShipmentIds: ['SHP-1008', 'SHP-1016', 'SHP-1033'],
    recommendedAction: 'Route time-critical Gurugram dispatches via Sohna–Dausa Expressway link.',
    isHistorical: false,
  },
  // 10 Historical Disruptions for pattern analysis
  { id: 'HIST-01', title: 'NH48 Narmada Bridge Approaches Flooding', corridorId: 'COR-01', corridorName: 'Delhi–Mumbai', type: 'Weather', severity: 'Critical', description: 'Monsoon surge caused 6.2h average fleet delay across 9 shipments.', timestamp: '2026-10-18', lat: 21.7051, lng: 72.9959, estimatedDelayHours: 6.2, affectedShipmentIds: ['SHP-1001', 'SHP-1024'], recommendedAction: 'Bypassed via Kota-Ujjain.', isHistorical: true },
  { id: 'HIST-02', title: 'Khandala Tunnel Multi-Axle Breakdown', corridorId: 'COR-03', corridorName: 'Mumbai–Pune', type: 'Breakdown', severity: 'Critical', description: 'Clutch failure on 40ft trailer blocked 2 lanes for 3.5 hours.', timestamp: '2026-10-15', lat: 18.7557, lng: 73.4091, estimatedDelayHours: 3.5, affectedShipmentIds: ['SHP-1003'], recommendedAction: 'Dispatched heavy crane from Khalapur.', isHistorical: true },
  { id: 'HIST-03', title: 'Varanasi Ring Road Overbridge Maintenance', corridorId: 'COR-04', corridorName: 'Delhi–Kolkata', type: 'Infrastructure', severity: 'Warning', description: 'Scheduled girder placement delayed eastbound convoys by 2.4 hours.', timestamp: '2026-10-12', lat: 25.3176, lng: 82.9739, estimatedDelayHours: 2.4, affectedShipmentIds: ['SHP-1004'], recommendedAction: 'Used Chunar bypass.', isHistorical: true },
  { id: 'HIST-04', title: 'Manesar ICD Toll System Outage', corridorId: 'COR-02', corridorName: 'Delhi–Jaipur', type: 'Congestion', severity: 'Warning', description: 'FASTag reader latency caused 4 km tailback.', timestamp: '2026-10-09', lat: 28.3588, lng: 76.926, estimatedDelayHours: 1.8, affectedShipmentIds: ['SHP-1008'], recommendedAction: 'Switched to Sohna expressway.', isHistorical: true },
  { id: 'HIST-05', title: 'Surat–Navsari Highway Tanker Spill', corridorId: 'COR-07', corridorName: 'Ahmedabad–Mumbai', type: 'Accident', severity: 'Critical', description: 'Non-hazardous industrial oil spill required 4.5h lane closure.', timestamp: '2026-10-06', lat: 21.1702, lng: 72.8311, estimatedDelayHours: 4.5, affectedShipmentIds: ['SHP-1002'], recommendedAction: 'Diverted local traffic via state highway SH-6.', isHistorical: true },
  { id: 'HIST-06', title: 'Hosur Border Checkpost Surge', corridorId: 'COR-05', corridorName: 'Chennai–Bengaluru', type: 'Congestion', severity: 'Advisory', description: 'Quarter-end commercial vehicle inspection delayed arrivals by 1.1h.', timestamp: '2026-09-30', lat: 12.7409, lng: 77.8253, estimatedDelayHours: 1.1, affectedShipmentIds: ['SHP-1005'], recommendedAction: 'Pre-cleared digital permits.', isHistorical: true },
  { id: 'HIST-07', title: 'Kurnool Tungabhadra Bridge Repair', corridorId: 'COR-06', corridorName: 'Bengaluru–Hyderabad', type: 'Infrastructure', severity: 'Advisory', description: 'Expansion joint resurfacing reduced speed to 25 km/h.', timestamp: '2026-09-25', lat: 15.8281, lng: 78.0373, estimatedDelayHours: 1.4, affectedShipmentIds: ['SHP-1006'], recommendedAction: 'Night-window transit scheduling.', isHistorical: true },
  { id: 'HIST-08', title: 'Etawah Dense Early Morning Haze', corridorId: 'COR-08', corridorName: 'Lucknow–Delhi', type: 'Weather', severity: 'Warning', description: 'Visibility dropped below 150m between 04:00 and 07:30.', timestamp: '2026-09-21', lat: 26.7821, lng: 79.0215, estimatedDelayHours: 2.0, affectedShipmentIds: ['SHP-1012'], recommendedAction: 'Enforced convoy fog-light protocol.', isHistorical: true },
  { id: 'HIST-09', title: 'Udaipur Kaya Ghat Landslide Debris', corridorId: 'COR-01', corridorName: 'Delhi–Mumbai', type: 'Weather', severity: 'Critical', description: 'Heavy hill runoff blocked southbound carriageway for 5 hours.', timestamp: '2026-09-14', lat: 24.5854, lng: 73.7125, estimatedDelayHours: 5.0, affectedShipmentIds: ['SHP-1010'], recommendedAction: 'Rerouted via Chittorgarh–Ratlam.', isHistorical: true },
  { id: 'HIST-10', title: 'Dankuni Toll Plaza Freight Bottleneck', corridorId: 'COR-04', corridorName: 'Delhi–Kolkata', type: 'Congestion', severity: 'Warning', description: 'No-entry window into Kolkata metropolitan zone held trucks for 3.1h.', timestamp: '2026-09-08', lat: 22.6726, lng: 88.2939, estimatedDelayHours: 3.1, affectedShipmentIds: ['SHP-1009'], recommendedAction: 'Scheduled arrivals before 06:00 AM.', isHistorical: true },
];

export const INITIAL_EMERGENCY_INCIDENTS: EmergencyIncident[] = [
  {
    id: 'EMG-201',
    corridorId: 'COR-03',
    locationName: 'Lonavala–Khandala Boreghat Descent (KM 74.2)',
    highwayMarker: 'NH48 / Mumbai–Pune Expressway Westbound',
    lat: 18.7557,
    lng: 73.4091,
    incidentType: 'Brake Thermal Warning',
    isConfirmed: true,
    involvedVehicleId: 'VEH-103',
    involvedShipmentId: 'SHP-1003',
    driverName: 'Mahadev Patil',
    driverPhone: '+91-98220-61830',
    severity: 'Critical',
    reportedAt: '11 mins ago',
    status: 'Pending Operator Review',
    nearbyHospitals: [
      {
        name: 'MGM Institute of Health Sciences & Trauma Center',
        city: 'Kamothe / Panvel',
        distanceKm: 18.4,
        etaMinutes: 22,
        traumaLevel: 'Level-1 Highway Trauma Facility',
        contactPhone: '+91-22-27437900',
        lat: 19.0182,
        lng: 73.0981,
      },
      {
        name: 'Sanjeevani Medical Foundation Hospital',
        city: 'Lonavala',
        distanceKm: 6.2,
        etaMinutes: 9,
        traumaLevel: '24x7 Emergency & Stabilization Unit',
        contactPhone: '+91-2114-273018',
        lat: 18.7512,
        lng: 73.4125,
      },
    ],
    recommendedProtocol: [
      'Direct Driver Mahadev Patil (VEH-103) into Runaway Truck Ramp / Emergency Lay-by at KM 73.8 immediately.',
      'Put Sanjeevani Emergency Unit (Lonavala, 9 mins ETA) and IRB Highway Patrol on standby.',
      'Dispatch backup prime-mover tractor from Talegaon Hub to secure SHP-1003 (L&T Switchgear).',
    ],
  },
  {
    id: 'EMG-202',
    corridorId: 'COR-01',
    locationName: 'Narmada Bridge Southern Approach, Bharuch (KM 194.5)',
    highwayMarker: 'NH48 Delhi–Mumbai Corridor',
    lat: 21.7051,
    lng: 72.9959,
    incidentType: 'Predicted High-Risk Blackspot',
    isConfirmed: false,
    involvedVehicleId: 'VEH-102',
    involvedShipmentId: 'SHP-1001',
    driverName: 'Gurmukh Singh Gill',
    driverPhone: '+91-98112-73419',
    severity: 'High',
    reportedAt: '19 mins ago',
    status: 'Pending Operator Review',
    nearbyHospitals: [
      {
        name: 'APEX Multispeciality & Trauma Hospital',
        city: 'Bharuch (NH48 Junction)',
        distanceKm: 4.8,
        etaMinutes: 8,
        traumaLevel: '24x7 Critical Care & Ortho Trauma',
        contactPhone: '+91-2642-247500',
        lat: 21.712,
        lng: 73.008,
      },
      {
        name: 'Baroda Heart & Multispeciality Hospital',
        city: 'Vadodara',
        distanceKm: 68.0,
        etaMinutes: 58,
        traumaLevel: 'Tertiary Level-1 Trauma Center',
        contactPhone: '+91-265-2356111',
        lat: 22.3072,
        lng: 73.1812,
      },
    ],
    recommendedProtocol: [
      'Predicted hydroplaning & rear-end collision risk score 89/100 due to 48 mm/hr rain and sudden queue tailbacks.',
      'Transmit automated cab audio alert to VEH-102, VEH-101, and VEH-113 to engage hazard beacons and 40 km/h speed limit.',
    ],
  },
];

export const INITIAL_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'DOC-01',
    title: 'Delivery SLA & Delay Escalation Policy v3.2',
    fileName: 'BharatFreight_SLA_Delay_Escalation_Policy_v3.2.pdf',
    fileType: 'PDF',
    category: 'SLA Policy',
    uploadedAt: '2026-10-01',
    fileSizeKB: 428,
    rawText: `SECTION 1: PRIORITY TIERS AND PENALTY THRESHOLDS
Bharat Freight Logistics classifies all road freight consignments into four SLA tiers: Critical, High, Medium, and Standard.
For Critical and High-priority shipments (including Pharmaceutical Cold-Chain, Just-In-Time Automotive Assemblies, and Defense Electronics), any predicted arrival delay exceeding 2.0 hours requires mandatory Control Tower intervention.

SECTION 2: MANDATORY REROUTING PROTOCOL FOR DELAYED HIGH-PRIORITY SHIPMENTS
When a corridor disruption (weather score >= 70 or highway closure) threatens a Critical or High-priority shipment with a delay exceeding 3.0 hours:
1. The Control Tower operator must immediately evaluate alternate national highway bypasses using the NETRA Route Optimization Engine.
2. If an alternative route reduces net SLA financial penalty exposure by more than the incremental fuel cost (calculated at ₹94.5/L), the operator is pre-authorized to approve the bypass reroute without waiting for customer sign-off.
3. The customer logistics desk must be notified within 30 minutes with the updated GeoJSON route and revised ETA.

SECTION 3: STAGING AND DEPARTURE HOLD POLICY
For Standard and Medium priority shipments scheduled on a High-Risk corridor (Risk Score >= 70), operators should hold dispatch at origin or intermediate ICD hubs (Gurugram, Jaipur, Ahmedabad, Panvel) for up to 4 hours rather than dispatching trucks into active highway gridlock.`,
    chunks: [
      {
        id: 'DOC-01-CHK-1',
        sectionTitle: 'Section 1: Priority Tiers & Escalation Thresholds',
        content:
          'Bharat Freight Logistics classifies consignments into Critical, High, Medium, and Standard tiers. For Critical and High-priority shipments (Pharmaceutical Cold-Chain, JIT Automotive, Defense Electronics), any predicted delay exceeding 2.0 hours requires mandatory Control Tower intervention.',
        tokensCount: 44,
      },
      {
        id: 'DOC-01-CHK-2',
        sectionTitle: 'Section 2: Mandatory Rerouting Policy for Delayed High-Priority Shipments',
        content:
          'When a corridor disruption threatens a Critical or High-priority shipment with a delay exceeding 3.0 hours: (1) Evaluate alternate highway bypasses immediately. (2) If an alternative route reduces SLA financial penalty exposure by more than the incremental fuel cost, the operator is pre-authorized to execute the bypass reroute immediately. (3) Notify the customer desk within 30 minutes with the revised ETA.',
        tokensCount: 68,
      },
      {
        id: 'DOC-01-CHK-3',
        sectionTitle: 'Section 3: Staging & Departure Hold Policy for Non-Urgent Freight',
        content:
          'For Standard and Medium priority shipments on a High-Risk corridor (Risk Score >= 70), operators must hold departure at origin or intermediate staging hubs (Gurugram, Jaipur, Ahmedabad, Panvel) for up to 4 hours rather than sending vehicles into active highway gridlock.',
        tokensCount: 49,
      },
    ],
  },
  {
    id: 'DOC-02',
    title: 'High-Value & Pharmaceutical Cold-Chain Route Planning Guidelines',
    fileName: 'ColdChain_Pharma_Route_Guidelines_2026.pdf',
    fileType: 'PDF',
    category: 'Route Policy',
    uploadedAt: '2026-10-05',
    fileSizeKB: 512,
    rawText: `SECTION 4.1: REEFER TELEMETRY AND FUEL RESERVES
All 24ft Refrigerated Reefer vehicles transporting biologics, insulin, or vaccines (such as Cipla, Biocon, Dr. Reddy's, Zydus consignments) must maintain internal cargo bay temperatures between +2.0°C and +8.0°C. Drivers must maintain at least 65% diesel tank capacity when entering heavy rainfall or congestion zones to ensure uninterrupted auxiliary cooling unit operation.

SECTION 4.2: NH48 DELHI-MUMBAI MONSOON BYPASS DIRECTIVE
During severe rainfall events on the Vadodara–Bharuch–Surat segment of NH48 (rainfall > 35 mm/hr), pharmaceutical shipments (including SHP-1024 and SHP-1037) must be diverted at Jaipur/Chittorgarh onto the Eastern Bypass (Kota → Ujjain → Indore → Dhule → Nashik) to avoid Narmada bridge flood queues.`,
    chunks: [
      {
        id: 'DOC-02-CHK-1',
        sectionTitle: 'Section 4.1: Reefer Telemetry & 65% Fuel Reserve Rule',
        content:
          'All 24ft Refrigerated Reefer vehicles carrying pharmaceuticals or biologics (+2°C to +8°C) must maintain at least 65% diesel reserve when entering heavy rainfall or congestion zones to guarantee uninterrupted auxiliary cooling unit operation.',
        tokensCount: 42,
      },
      {
        id: 'DOC-02-CHK-2',
        sectionTitle: 'Section 4.2: NH48 Delhi–Mumbai Monsoon Bypass Directive',
        content:
          'During severe rainfall on the Vadodara–Bharuch–Surat segment of NH48 (>35 mm/hr), pharmaceutical shipments (such as SHP-1024) must be diverted onto the Eastern Bypass (Jaipur → Kota → Ujjain → Indore → Dhule → Nashik) to avoid Narmada bridge waterlogging and protect cold-chain integrity.',
        tokensCount: 51,
      },
    ],
  },
  {
    id: 'DOC-03',
    title: 'Driver Safety, Ghat Descent & Emergency Response Manual',
    fileName: 'Driver_Safety_Ghat_Emergency_Manual.docx',
    fileType: 'DOCX',
    category: 'Safety Manual',
    uploadedAt: '2026-10-10',
    fileSizeKB: 380,
    rawText: `SECTION 2.1: WESTERN GHATS & LONAVALA BOREGHAT DESCENT PROTOCOL
Heavy multi-axle containers (32ft) and flatbed trailers (40ft) descending the Lonavala–Khandala Ghat on the Mumbai–Pune corridor must engage exhaust brakes, lock transmission in low gear, and strictly cap speed at 35 km/h during wet weather.

SECTION 5.3: EMERGENCY INCIDENT & TRAUMA TRIAGE WORKFLOW
Upon receiving a confirmed collision, rollover, or brake thermal warning:
1. Verify GPS coordinates and highway marker in NETRA Emergency Response Intelligence.
2. Identify the nearest Level-1 Highway Trauma Center within 25 minutes ETA.
3. Prepare and confirm the emergency notification packet containing Vehicle ID, Driver Name, Cargo Hazmat/Cold-Chain status, and GPS coordinates.`,
    chunks: [
      {
        id: 'DOC-03-CHK-1',
        sectionTitle: 'Section 2.1: Lonavala Boreghat 35 km/h Descent Protocol',
        content:
          'Heavy 32ft and 40ft vehicles descending the Lonavala–Khandala Boreghat on the Mumbai–Pune corridor must engage exhaust brakes, use low gear, and cap speed at 35 km/h during rainfall or low visibility.',
        tokensCount: 39,
      },
      {
        id: 'DOC-03-CHK-2',
        sectionTitle: 'Section 5.3: Emergency Incident & Trauma Hospital Triage Workflow',
        content:
          'Upon receiving a brake thermal warning or accident alert: (1) Inspect exact GPS coordinates and highway marker. (2) Select the nearest trauma hospital within 25 mins ETA. (3) Prepare and confirm the emergency dispatch notification with vehicle, driver, and cargo details.',
        tokensCount: 46,
      },
    ],
  },
  {
    id: 'DOC-04',
    title: 'Monsoon & Severe Weather Freight Operating Procedures',
    fileName: 'Monsoon_Freight_SOP_India_2026.txt',
    fileType: 'TXT',
    category: 'Weather SOP',
    uploadedAt: '2026-10-12',
    fileSizeKB: 215,
    rawText: `SECTION 1: WEATHER SEVERITY THRESHOLDS
- Rainfall 0-15 mm/hr: Normal highway operations.
- Rainfall 16-35 mm/hr: Moderate advisory; reduce highway cruising speed by 15% and monitor river bridge bottlenecks.
- Rainfall >35 mm/hr: Critical Monsoon Alert; run NETRA Digital Twin Simulation on affected corridors and activate fleet-wide coordinated rerouting.`,
    chunks: [
      {
        id: 'DOC-04-CHK-1',
        sectionTitle: 'Section 1: Rainfall Thresholds & Digital Twin Activation',
        content:
          'Rainfall >35 mm/hr triggers a Critical Monsoon Alert. Control Tower operators must run a NETRA Digital Twin Simulation on the affected corridor and activate coordinated fleet-level rerouting for time-sensitive shipments.',
        tokensCount: 38,
      },
    ],
  },
];

export const INITIAL_ACTIVITY_LOGS: OperationalActivityLog[] = [
  { id: 'LOG-01', timestamp: '10:42 AM', category: 'RISK', summary: 'NH48 Delhi–Mumbai risk score elevated to 78/100 due to 48 mm/hr rainfall in Bharuch–Vadodara sector.', referenceId: 'COR-01' },
  { id: 'LOG-02', timestamp: '10:35 AM', category: 'SHIPMENT', summary: 'Shipment SHP-1024 (Cipla Cold-Chain) flagged At Risk (+5.5h predicted delay on NH48).', referenceId: 'SHP-1024' },
  { id: 'LOG-03', timestamp: '10:18 AM', category: 'EMERGENCY', summary: 'Brake thermal warning logged for VEH-103 (SHP-1003) at Lonavala Boreghat KM 74.2.', referenceId: 'EMG-201' },
  { id: 'LOG-04', timestamp: '09:50 AM', category: 'ROUTE', summary: 'OSRM road-network geometry cached for 8 primary national freight corridors.', referenceId: 'COR-01' },
  { id: 'LOG-05', timestamp: '09:15 AM', category: 'SHIPMENT', summary: 'Shipment SHP-1005 (Foxconn PCB Modules) passed Vellore checkpoint on schedule.', referenceId: 'SHP-1005' },
];

export const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'CHAT-01',
    title: 'Morning Control Tower Risk Briefing',
    updatedAt: 'Today, 10:30 AM',
    messages: [
      {
        id: 'MSG-INIT-1',
        role: 'assistant',
        content: `Welcome to **NETRA Autonomous Operations Control**. I am connected to **Bharat Freight Logistics Pvt. Ltd.**'s live telemetry across **8 freight corridors**, **25 commercial vehicles**, and **40 shipments**.\n\n**Immediate Attention Required:**\n- **Delhi–Mumbai Corridor (NH48)** is at **78/100 (High Risk)** due to 48 mm/hr rainfall near Bharuch–Vadodara.\n- **Mumbai–Pune Corridor (NH48/Expy)** is at **72/100 (High Risk)** due to Lonavala Boreghat rain and congestion.\n- **Shipment SHP-1024** (Cipla Cold-Chain Biologics) faces a **5.5-hour predicted delay** (₹1,21,000 SLA penalty exposure).\n\nSelect a suggested operational query or ask me to analyze shipments, compare routes, or run a disruption simulation.`,
        timestamp: '10:30 AM',
        providerStatus: 'READY',
      },
    ],
  },
];

// Explainable AI Weighted Risk Scoring Formula (0 - 100)
export function computeExplainableCorridorRisk(params: {
  weatherSeverity: number;
  rainfallIntensity: number;
  trafficCongestion: number;
  historicalIncidentFreq: number;
  infrastructureCondition: number;
  routeFlexibility: number;
  horizonOffsetMinutes?: number;
}): {
  score: number;
  classification: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  estimatedDelayHours: number;
  factorBreakdown: { label: string; weightPercent: number; rawValue: string; contributionPoints: number }[];
} {
  const rainfallNorm = Math.min(100, (params.rainfallIntensity / 60) * 100);
  const wWeather = 0.24;
  const wRain = 0.18;
  const wTraffic = 0.25;
  const wHist = 0.13;
  const wInfra = 0.10;
  const wFlex = 0.10;

  const cWeather = +(params.weatherSeverity * wWeather).toFixed(1);
  const cRain = +(rainfallNorm * wRain).toFixed(1);
  const cTraffic = +(params.trafficCongestion * wTraffic).toFixed(1);
  const cHist = +(params.historicalIncidentFreq * wHist).toFixed(1);
  const cInfra = +(params.infrastructureCondition * wInfra).toFixed(1);
  const cFlex = +(params.routeFlexibility * wFlex).toFixed(1);

  let rawScore = cWeather + cRain + cTraffic + cHist + cInfra + cFlex;

  // Scenario forecast horizon adjustment
  if (params.horizonOffsetMinutes === 30) {
    rawScore = rawScore * 1.03;
  } else if (params.horizonOffsetMinutes === 60) {
    rawScore = rawScore * 1.06;
  } else if (params.horizonOffsetMinutes === 180) {
    rawScore = rawScore > 65 ? rawScore * 0.94 : rawScore * 1.04;
  }

  const score = Math.max(5, Math.min(99, Math.round(rawScore)));
  const classification = score >= 70 ? 'High Risk' : score >= 35 ? 'Moderate Risk' : 'Low Risk';
  const estimatedDelayHours =
    score >= 75
      ? +((score - 40) * 0.145).toFixed(1)
      : score >= 45
      ? +((score - 30) * 0.08).toFixed(1)
      : +((score / 100) * 1.2).toFixed(1);

  return {
    score,
    classification,
    estimatedDelayHours,
    factorBreakdown: [
      { label: 'Traffic Congestion Index', weightPercent: 25, rawValue: `${params.trafficCongestion}/100`, contributionPoints: cTraffic },
      { label: 'Weather Severity Index', weightPercent: 24, rawValue: `${params.weatherSeverity}/100`, contributionPoints: cWeather },
      { label: 'Rainfall Intensity', weightPercent: 18, rawValue: `${params.rainfallIntensity} mm/hr`, contributionPoints: cRain },
      { label: 'Historical Incident Frequency', weightPercent: 13, rawValue: `${params.historicalIncidentFreq}/100`, contributionPoints: cHist },
      { label: 'Road Infrastructure Bottlenecks', weightPercent: 10, rawValue: `${params.infrastructureCondition}/100`, contributionPoints: cInfra },
      { label: 'Limited Route Bypass Flexibility', weightPercent: 10, rawValue: `${params.routeFlexibility}/100`, contributionPoints: cFlex },
    ],
  };
}

// Live OSRM road-network route fetcher with deterministic cached highway road-network fallback
const osrmRouteCache = new Map<string, { geometry: [number, number][]; distanceKm: number; durationHours: number; source: 'OSRM_LIVE' | 'CACHED_HIGHWAY_NETWORK' }>();

export async function calculateMultiStopRoadRoute(
  stops: CityHub[]
): Promise<{
  geometry: [number, number][];
  distanceKm: number;
  durationHours: number;
  source: 'OSRM_LIVE' | 'CACHED_HIGHWAY_NETWORK';
}> {
  if (stops.length < 2) {
    return { geometry: [], distanceKm: 0, durationHours: 0, source: 'CACHED_HIGHWAY_NETWORK' };
  }

  const cacheKey = stops.map((s) => `${s.lat.toFixed(3)},${s.lng.toFixed(3)}`).join(';');
  if (osrmRouteCache.has(cacheKey)) {
    return osrmRouteCache.get(cacheKey)!;
  }

  try {
    const coordsString = stops.map((s) => `${s.lng},${s.lat}`).join(';');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const route = data?.routes?.[0];
      if (route && route.geometry?.coordinates?.length > 2) {
        const latLngs: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        const distKm = Math.round(route.distance / 1000);
        // Heavy commercial truck speed calibration vs passenger car OSRM baseline
        const truckHours = +(distKm / 49.5 + (stops.length - 2) * 0.6).toFixed(1);
        const result = {
          geometry: latLngs,
          distanceKm: distKm,
          durationHours: truckHours,
          source: 'OSRM_LIVE' as const,
        };
        osrmRouteCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (_err) {
    // Fall through to cached multi-waypoint Indian highway road geometry
  }

  // Build dense road-network geometry from cached highway waypoints between consecutive hubs
  const denseGeometry: [number, number][] = [];
  let totalDistKm = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    // Check if an existing corridor matches or contains both cities
    const matchingCorridor = INITIAL_CORRIDORS.find(
      (c) =>
        (c.origin.toLowerCase() === a.name.toLowerCase() && c.destination.toLowerCase() === b.name.toLowerCase()) ||
        (c.origin.toLowerCase() === b.name.toLowerCase() && c.destination.toLowerCase() === a.name.toLowerCase())
    );

    if (matchingCorridor) {
      const pts =
        matchingCorridor.origin.toLowerCase() === a.name.toLowerCase()
          ? matchingCorridor.roadGeometry
          : [...matchingCorridor.roadGeometry].reverse();
      denseGeometry.push(...pts);
      totalDistKm += matchingCorridor.distanceKm;
    } else {
      // Interpolate along intermediate highway hubs between a and b so it follows real Indian highway curves
      const dLat = b.lat - a.lat;
      const dLng = b.lng - a.lng;
      const straightKm = Math.sqrt(Math.pow(dLat * 111, 2) + Math.pow(dLng * 102, 2));
      const roadFactor = 1.24;
      totalDistKm += Math.round(straightKm * roadFactor);

      // Generate realistic curved highway intermediate waypoints using nearby Indian hubs
      const steps = 8;
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        // Subtle deterministic highway curvature offset
        const curveOffset = Math.sin(t * Math.PI) * 0.18 * (i % 2 === 0 ? 1 : -1);
        denseGeometry.push([+(a.lat + dLat * t + curveOffset).toFixed(4), +(a.lng + dLng * t - curveOffset * 0.7).toFixed(4)]);
      }
    }
  }

  const durationHours = +(totalDistKm / 48.5 + Math.max(0, stops.length - 2) * 0.75).toFixed(1);
  const fallbackResult = {
    geometry: denseGeometry,
    distanceKm: totalDistKm,
    durationHours,
    source: 'CACHED_HIGHWAY_NETWORK' as const,
  };
  osrmRouteCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}
