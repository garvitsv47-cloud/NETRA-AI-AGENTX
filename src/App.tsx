import React, { useState, useEffect } from 'react';
import { NetraProvider, useNetra } from './context/NetraContext';
import { NavigationTab } from './types/netra';
import { HackathonDemoBar } from './components/HackathonDemoBar';
import { OverviewView } from './views/OverviewView';
import { CorridorsView } from './views/CorridorsView';
import { FleetEmergencyView } from './views/FleetEmergencyView';
import { ShipmentsView } from './views/ShipmentsView';
import { OptimizationView } from './views/OptimizationView';
import { RiskIntelligenceView } from './views/RiskIntelligenceView';
import { SimulatorView } from './views/SimulatorView';
import { AgentView } from './views/AgentView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import {
  AnalyticsView,
  CompanySettingsView,
  DriverInterfaceView,
} from './views/AnalyticsSettingsDriverView';
import { FreightCompaniesView } from './views/FreightCompaniesView';
import {
  LayoutDashboard,
  Map,
  Truck,
  Package,
  Route,
  ShieldAlert,
  SlidersHorizontal,
  Bot,
  BookOpen,
  BarChart3,
  Settings,
  Building2,
  Smartphone,
  Search,
  Bell,
  Play,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';

const SIDEBAR_MODULES: Array<{
  id: NavigationTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'corridors', label: 'Freight Corridors', icon: Map },
  { id: 'fleet', label: 'Fleet Management', icon: Truck },
  { id: 'shipments', label: 'Shipments', icon: Package },
  { id: 'optimization', label: 'Route Optimization', icon: Route },
  { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlert },
  { id: 'simulator', label: 'Digital Twin Simulator', icon: SlidersHorizontal },
  { id: 'agent', label: 'NETRA AI Agent', icon: Bot },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'settings', label: 'Company Settings', icon: Settings },
  { id: 'freight-companies', label: 'For Freight Companies', icon: Building2 },
];

const NetraShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    settings,
    alerts,
    globalSearchQuery,
    setGlobalSearchQuery,
    startHackathonDemo,
    selectedCorridorId,
    setSelectedCorridorId,
    setSelectedShipmentId,
    operatingMode,
    setOperatingMode,
    canEnableConnectedFleetMode,
    connectedCapabilities,
    liveWeatherByCorridor,
    isRefreshingLiveTelemetry,
    lastTelemetryRefreshIso,
    refreshLiveTelemetry,
  } = useNetra();

  const [modeNotice, setModeNotice] = useState<string | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }) + ' IST'
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  const activeAlerts = alerts.filter((a) => !a.isHistorical);

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) return;
    setActiveTab('shipments');
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#1F2937]">
      {/* Left Sidebar (Desktop) */}
      <aside
        className={`hidden lg:flex flex-col bg-[#111827] text-white border-r border-[#1E293B] shrink-0 transition-all duration-150 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#1E293B]">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left overflow-hidden cursor-pointer"
          >
            <div className="w-7 h-7 rounded bg-[#52677D] flex items-center justify-center font-mono font-bold text-sm text-white shrink-0">
              N
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <div className="text-sm font-bold tracking-tight text-white leading-none">
                  NETRA
                </div>
                <div className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                  Freight Corridor Intelligence
                </div>
              </div>
            )}
          </button>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1 text-[#94A3B8] hover:text-white rounded cursor-pointer"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {SIDEBAR_MODULES.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#52677D] text-white font-semibold'
                    : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-[#1E293B]">
            <button
              onClick={() => setActiveTab('driver')}
              title="Simplified Driver View"
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'driver'
                  ? 'bg-[#54846B] text-white font-semibold'
                  : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Driver Cab Interface</span>}
            </button>
          </div>
        </nav>

        {/* Footer Workspace Indicator */}
        {!sidebarCollapsed && (
          <div className="p-3.5 border-t border-[#1E293B] text-[11px] text-[#94A3B8] space-y-1">
            <div className="font-semibold text-white truncate">{settings.companyName}</div>
            <div className="font-mono text-[10px] text-[#64748B]">
              25 Trucks · 40 Shipments · 8 Corridors
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-[#111827] text-white flex flex-col h-full">
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#1E293B]">
              <span className="text-sm font-bold text-white">NETRA Control Tower</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {SIDEBAR_MODULES.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded ${
                      activeTab === item.id
                        ? 'bg-[#52677D] text-white'
                        : 'text-[#CBD5E1] hover:bg-[#1E293B]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setActiveTab('driver');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded text-[#CBD5E1] hover:bg-[#1E293B]"
              >
                <Smartphone className="w-4 h-4" />
                <span>Driver Cab Interface</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          {/* Left Zone: Mobile Menu + Company Workspace Context */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-[#1F2937] hover:bg-[#F8FAFC] rounded border border-[#E2E8F0]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1F2937] truncate">
                  {settings.companyName}
                </span>
                <span className="hidden md:inline text-[#64748B]">·</span>
                <span className="hidden md:inline text-[11px] font-mono text-[#52677D]">
                  {settings.demoEnvironmentLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Center Zone: Global Search */}
          <form
            onSubmit={handleGlobalSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md"
          >
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Global search (e.g. SHP-1024, Cipla, NH48, VEH-101)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#1F2937] focus:outline-none focus:border-[#52677D]"
              />
            </div>
          </form>

          {/* Right Zone: Clock, Notifications, Profile & RUN NETRA DEMO CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden xl:inline text-xs font-mono text-[#64748B]">
              {currentTimeStr}
            </span>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative p-1.5 text-[#64748B] hover:text-[#1F2937] rounded border border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer"
                title="Active Corridor Alerts"
              >
                <Bell className="w-4 h-4" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B85C5C] text-white text-[9px] font-mono font-bold px-1 rounded">
                    {activeAlerts.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-md shadow-lg p-3 z-50 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-xs font-semibold text-[#1F2937]">
                    <span>Active Corridor Alerts ({activeAlerts.length})</span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[#64748B] hover:text-[#1F2937]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeAlerts.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setSelectedCorridorId(a.corridorId);
                          if (a.affectedShipmentIds[0]) {
                            setSelectedShipmentId(a.affectedShipmentIds[0]);
                          }
                          setActiveTab('risk');
                          setNotificationsOpen(false);
                        }}
                        className="p-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-xs cursor-pointer"
                      >
                        <div className="font-semibold text-[#B85C5C] text-[11px]">
                          {a.severity}: {a.corridorName}
                        </div>
                        <div className="font-medium text-[#1F2937] mt-0.5">{a.title}</div>
                        <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                          Est. Delay: +{a.estimatedDelayHours}h · {a.affectedShipmentIds.length} shipments
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#52677D]" />
                <span className="hidden sm:inline">Control Tower Ops</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-md shadow-lg p-3 z-50 text-xs space-y-2">
                  <div className="border-b border-[#E2E8F0] pb-2">
                    <div className="font-semibold text-[#1F2937]">Vikramaditya Rao</div>
                    <div className="text-[11px] text-[#64748B]">
                      VP Network Operations · Bharat Freight
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileOpen(false);
                    }}
                    className="w-full text-left py-1 text-[#1F2937] hover:text-[#52677D] cursor-pointer"
                  >
                    Company Settings & Thresholds
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('driver');
                      setProfileOpen(false);
                    }}
                    className="w-full text-left py-1 text-[#1F2937] hover:text-[#52677D] cursor-pointer"
                  >
                    Switch to Driver Cab Interface
                  </button>
                </div>
              )}
            </div>

            {/* Prominent RUN NETRA DEMO Button (shown in topbar on secondary modules; Command Center renders it in Row 1) */}
            {activeTab !== 'overview' && (
              <button
                onClick={startHackathonDemo}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                RUN NETRA DEMO
              </button>
            )}
          </div>
        </header>

        {/* Explicit 3-Mode Operating Data Bar + Contextual Mode Status Line */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 lg:px-6 py-1.5 space-y-1 text-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-[#64748B]">
                OPERATING DATA MODE:
              </span>
              <div className="flex flex-wrap items-center gap-1 bg-[#F8FAFC] p-0.5 rounded border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    setOperatingMode('DEMO_MODE');
                    setModeNotice(null);
                  }}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded cursor-pointer transition-colors ${
                    operatingMode === 'DEMO_MODE'
                      ? 'bg-[#111827] text-white font-semibold'
                      : 'text-[#64748B] hover:text-[#1F2937]'
                  }`}
                >
                  1. DEMO MODE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOperatingMode('LIVE_CONDITIONS_DEMO_FLEET');
                    setModeNotice(null);
                  }}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded cursor-pointer transition-colors ${
                    operatingMode === 'LIVE_CONDITIONS_DEMO_FLEET'
                      ? 'bg-[#52677D] text-white font-semibold'
                      : 'text-[#64748B] hover:text-[#1F2937]'
                  }`}
                >
                  2. LIVE EXTERNAL CONDITIONS + DEMO FLEET
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const res = setOperatingMode('CONNECTED_FLEET_MODE');
                    if (!res.allowed) {
                      setModeNotice(res.reason || 'Connected Fleet Mode requires authorized data.');
                    } else {
                      setModeNotice(null);
                    }
                  }}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded cursor-pointer transition-colors ${
                    operatingMode === 'CONNECTED_FLEET_MODE'
                      ? 'bg-[#54846B] text-white font-semibold'
                      : canEnableConnectedFleetMode
                      ? 'text-[#54846B] hover:bg-[#F0FDF4]'
                      : 'text-[#94A3B8] hover:text-[#64748B]'
                  }`}
                  title={
                    canEnableConnectedFleetMode
                      ? 'Switch to Connected Fleet Mode'
                      : 'Requires connected Traccar GPS or validated CSV/TMS shipment import'
                  }
                >
                  3. CONNECTED FLEET MODE {!canEnableConnectedFleetMode && '(Locked)'}
                </button>
              </div>
              {operatingMode === 'DEMO_MODE' && (
                <span className="px-2 py-0.5 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#B85C5C] font-mono font-bold text-[10px]">
                  SIMULATED DATA
                </span>
              )}
              {operatingMode === 'LIVE_CONDITIONS_DEMO_FLEET' && (
                <span className="px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-mono font-bold text-[10px]">
                  LIVE WEATHER + SIMULATED FLEET
                </span>
              )}
              {operatingMode === 'CONNECTED_FLEET_MODE' && (
                <span className="px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-mono font-bold text-[10px]">
                  CONNECTED OPERATIONS ({connectedCapabilities.hasImportedShipments ? 'TMS SHIPMENTS' : 'DEMO SHIPMENTS'} ·{' '}
                  {connectedCapabilities.hasLiveGps ? 'LIVE GPS' : 'SIMULATED GPS'})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#64748B] font-mono">
              <span>
                Open-Meteo:{' '}
                <b className="text-[#54846B]">
                  {liveWeatherByCorridor[selectedCorridorId || 'COR-01']?.freshnessStatus ||
                    (lastTelemetryRefreshIso ? 'LIVE' : 'CONNECTING...')}
                </b>
                {liveWeatherByCorridor[selectedCorridorId || 'COR-01']?.observationTimestamp && (
                  <span className="text-[#64748B] ml-1">
                    (Obs: {liveWeatherByCorridor[selectedCorridorId || 'COR-01']?.observationTimestamp})
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => refreshLiveTelemetry(true)}
                disabled={isRefreshingLiveTelemetry}
                className="px-2 py-0.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#1F2937] cursor-pointer"
              >
                {isRefreshingLiveTelemetry ? 'Refreshing...' : 'Refresh Live Feeds'}
              </button>
            </div>
          </div>

          {/* PHASE 4: Single-line Mode-Specific Contextual Status Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B] pt-0.5 border-t border-[#F1F5F9]">
            <div className="flex flex-wrap items-center gap-2">
              {operatingMode === 'DEMO_MODE' && (
                <span>
                  <b className="text-[#1F2937]">Simulation Environment</b> — Demo weather, simulated shipments and simulated fleet.
                </span>
              )}
              {operatingMode === 'LIVE_CONDITIONS_DEMO_FLEET' && (
                <span>
                  <b className="text-[#52677D]">Hybrid Intelligence</b> — Live Open-Meteo weather + simulated shipments and fleet. Traffic/GPS availability shown separately.
                </span>
              )}
              {operatingMode === 'CONNECTED_FLEET_MODE' && (
                <span>
                  <b className="text-[#54846B]">Connected Operations</b> — Authorized operational records and GPS sources (
                  {connectedCapabilities.hasImportedShipments
                    ? 'Validated TMS/CSV shipments active'
                    : 'No TMS shipments imported — using simulated shipments'}{' '}
                  ·{' '}
                  {connectedCapabilities.hasLiveGps
                    ? 'Traccar GPS connected'
                    : 'Traccar GPS unconfigured — vehicle positions simulated'}
                  ).
                </span>
              )}
            </div>

            {/* PHASE 5: Connected Fleet Mode Lock Explanation & Existing Workflow Navigation Actions */}
            {(!canEnableConnectedFleetMode || modeNotice) && (
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                {modeNotice && (
                  <span className="text-[#B58A45] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded">
                    {modeNotice}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setModeNotice(null);
                    setActiveTab('shipments');
                  }}
                  className="text-[#52677D] font-medium hover:underline cursor-pointer"
                >
                  Import Operational Shipments (CSV/TMS) →
                </button>
                <span className="text-[#CBD5E1]">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setModeNotice(null);
                    setActiveTab('fleet');
                  }}
                  className="text-[#52677D] font-medium hover:underline cursor-pointer"
                >
                  Connect Data Source (Traccar GPS) →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Guided 6-Stage Hackathon Demo Banner (when active) */}
        <HackathonDemoBar />

        {/* Main Viewport */}
        <main className="flex-1 p-4 lg:p-5 max-w-[1600px] w-full mx-auto">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'corridors' && <CorridorsView />}
          {activeTab === 'fleet' && <FleetEmergencyView />}
          {activeTab === 'shipments' && <ShipmentsView />}
          {activeTab === 'optimization' && <OptimizationView />}
          {activeTab === 'risk' && <RiskIntelligenceView />}
          {activeTab === 'simulator' && <SimulatorView />}
          {activeTab === 'agent' && <AgentView />}
          {activeTab === 'knowledge' && <KnowledgeBaseView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <CompanySettingsView />}
          {activeTab === 'freight-companies' && <FreightCompaniesView />}
          {activeTab === 'driver' && <DriverInterfaceView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <NetraProvider>
      <NetraShell />
    </NetraProvider>
  );
}
