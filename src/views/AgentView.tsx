import React, { useState, useEffect } from 'react';
import { useNetra } from '../context/NetraContext';
import {
  Send,
  Plus,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  FileText,
  ArrowRight,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Which of my shipments are at the highest risk today?',
  'Find a safer route for shipment SHP-1024.',
  'Analyze the Delhi–Mumbai corridor.',
  'What happens if NH48 is closed?',
  "Summarize today's logistics risks.",
  'Which shipment should be prioritized?',
];

export const AgentView: React.FC = () => {
  const {
    chatSessions,
    activeChatId,
    setActiveChatId,
    addChatMessage,
    createNewChatSession,
    markAgentActionExecuted,
    rejectAgentAction,
    shipments,
    corridors,
    vehicles,
    alerts,
    documents,
    settings,
    selectedShipmentId,
    setSelectedShipmentId,
    selectedCorridorId,
    setSelectedCorridorId,
  } = useNetra();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{
    configured: boolean;
    model: string;
    mode: string;
  }>({
    configured: true,
    model: 'gemini-3.8-flash',
    mode: 'LIVE_GEMINI_AGENT',
  });

  useEffect(() => {
    fetch('/api/gemini/status')
      .then((r) => r.json())
      .then((d) => setGeminiStatus(d))
      .catch(() => {});
  }, []);

  const currentSession =
    chatSessions.find((s) => s.id === activeChatId) || chatSessions[0];

  const contextShipment =
    shipments.find((s) => s.id === (selectedShipmentId || 'SHP-1024')) || shipments[0];
  const contextCorridor =
    corridors.find((c) => c.id === (contextShipment?.corridorId || selectedCorridorId)) ||
    corridors[0];

  const handleSendQuestion = async (questionText?: string) => {
    const q = (questionText ?? inputPrompt).trim();
    if (!q || isThinking) return;

    setInputPrompt('');

    // Auto-select relevant shipment or corridor in the right-hand context panel if mentioned
    const shpMatch = q.match(/SHP-\d+/i);
    if (shpMatch) {
      setSelectedShipmentId(shpMatch[0].toUpperCase());
    }
    if (q.toLowerCase().includes('delhi') || q.toLowerCase().includes('nh48')) {
      setSelectedCorridorId('COR-01');
    }

    const userMsg = {
      id: `USR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user' as const,
      content: q,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    addChatMessage(currentSession.id, userMsg);
    setIsThinking(true);

    try {
      const res = await fetch('/api/gemini/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          contextData: {
            shipments,
            corridors,
            vehicles,
            alerts: alerts.filter((a) => !a.isHistorical),
            documents,
            settings,
          },
        }),
      });
      const data = await res.json();

      addChatMessage(currentSession.id, {
        id: `AST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: 'assistant',
        content: data.answer || 'Operational analysis completed.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        toolCalls: data.toolCalls || [],
        recommendedActions: data.recommendedActions || [],
        providerStatus: data.providerStatus || 'GROUNDED',
        errorNotice: data.errorNotice || null,
      });
    } catch (_err) {
      addChatMessage(currentSession.id, {
        id: `AST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: 'assistant',
        content:
          'Unable to reach backend intelligence endpoint. Please verify server connectivity.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-5 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs text-[#64748B]">
            NETRA Autonomous AI Agent · Function-Calling Logistics Control Tower · Operator-Confirmed Execution Guardrails
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
            Autonomous Operations Intelligence & Tool-Grounded Decision Agent
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-[#1F2937] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#52677D]" />
            {geminiStatus.configured
              ? `Gemini (${geminiStatus.model}) + 9 Operational Tools`
              : 'Local Deterministic Tool Engine + 9 Operational Tools'}
          </span>
        </div>
      </div>

      {/* Three-Column Interface: LEFT (History & Prompts), CENTER (Chat & Tool Trace), RIGHT (Operational Context) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* LEFT COLUMN (3 cols): Conversation History & Suggested Prompts */}
        <div className="xl:col-span-3 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <h2 className="text-xs font-semibold text-[#1F2937]">Investigation Sessions</h2>
              <button
                onClick={() => createNewChatSession()}
                className="px-2 py-1 text-[11px] font-medium bg-[#52677D] text-white rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                New Session
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {chatSessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => setActiveChatId(sess.id)}
                  className={`w-full text-left p-2.5 rounded border text-xs transition-colors cursor-pointer ${
                    sess.id === currentSession.id
                      ? 'bg-[#F1F5F9] border-[#52677D] font-semibold text-[#1F2937]'
                      : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#1F2937]'
                  }`}
                >
                  <div className="truncate">{sess.title}</div>
                  <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                    {sess.updatedAt} · {sess.messages.length} msgs
                  </div>
                </button>
              ))}
            </div>

            {/* Suggested Prompts */}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
              <div className="text-xs font-semibold text-[#1F2937]">
                Suggested Control Tower Queries
              </div>
              <div className="space-y-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendQuestion(q)}
                    disabled={isThinking}
                    className="w-full text-left p-2 text-xs bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#1F2937] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <span className="leading-snug">{q}</span>
                    <ArrowRight className="w-3 h-3 text-[#52677D] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[11px] text-[#64748B]">
            <b className="text-[#1F2937]">Agent Safety Guardrail:</b> NETRA never invents shipments or modifies active routes without explicit operator confirmation.
          </div>
        </div>

        {/* CENTER COLUMN (6 cols): Autonomous Workflow & Chat Interface */}
        <div className="xl:col-span-6 bg-white border border-[#E2E8F0] rounded-md flex flex-col h-[640px]">
          {/* Workflow Pipeline Header */}
          <div className="px-4 py-2.5 border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] text-[#64748B] flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono font-medium text-[#1F2937]">
              PIPELINE: QUESTION → INTENT → TOOL CALLS → DATA RETRIEVAL → RECOMMENDATION
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {currentSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-md p-3.5 text-xs space-y-2.5 ${
                    msg.role === 'user'
                      ? 'bg-[#111827] text-white'
                      : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#1F2937]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-mono">
                    <span>
                      {msg.role === 'user'
                        ? 'OPERATOR QUERY'
                        : `NETRA AGENT ${msg.intent ? `· INTENT: ${msg.intent.toUpperCase()}` : ''}`}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Executed Agent Function Calls Trace */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="p-2.5 bg-white border border-[#E2E8F0] rounded space-y-1.5">
                      <div className="text-[10px] font-mono font-semibold text-[#52677D] flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        EXECUTED OPERATIONAL TOOLS ({msg.toolCalls.length}):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.toolCalls.map((tc, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded font-mono text-[10px] text-[#1F2937]"
                          >
                            {tc.toolName}({JSON.stringify(tc.args)})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.errorNotice && (
                    <div className="p-2 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[11px] text-[#B58A45] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{msg.errorNotice}</span>
                    </div>
                  )}

                  {/* Formatted Message Body */}
                  <div className="whitespace-pre-line leading-relaxed text-xs">
                    {msg.content}
                  </div>

                  {/* Operator Confirmation Action Cards (Recommendations vs Executed Actions) */}
                  {msg.recommendedActions && msg.recommendedActions.length > 0 && (
                    <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                      <div className="text-[10px] font-mono font-semibold text-[#64748B]">
                        PROPOSED OPERATIONAL RECOMMENDATIONS (REQUIRES OPERATOR CONFIRMATION):
                      </div>
                      {msg.recommendedActions.map((act) => (
                        <div
                          key={act.id}
                          className="p-2.5 bg-white border border-[#E2E8F0] rounded flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-semibold text-[#1F2937]">{act.title}</div>
                            <div className="text-[11px] text-[#64748B]">{act.impactSummary}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!act.executed && (
                              <button
                                onClick={() =>
                                  rejectAgentAction(currentSession.id, msg.id, act.id)
                                }
                                disabled={act.rejected}
                                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded border cursor-pointer ${
                                  act.rejected
                                    ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B85C5C]'
                                    : 'bg-white border-[#CBD5E1] text-[#64748B] hover:text-[#B85C5C] hover:border-[#B85C5C]'
                                }`}
                              >
                                {act.rejected ? 'Rejected (Unchanged)' : 'Reject'}
                              </button>
                            )}
                            <button
                              onClick={() =>
                                markAgentActionExecuted(currentSession.id, msg.id, act.id)
                              }
                              disabled={act.executed || act.rejected}
                              className={`px-3 py-1.5 text-[11px] font-semibold rounded shrink-0 cursor-pointer ${
                                act.executed
                                  ? 'bg-[#E2E8F0] text-[#54846B]'
                                  : act.rejected
                                  ? 'bg-[#F1F5F9] text-[#94A3B8]'
                                  : 'bg-[#54846B] hover:bg-[#46705A] text-white'
                              }`}
                            >
                              {act.executed ? 'Executed ✓' : 'Confirm & Execute'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-[#64748B] font-mono">
                Analyzing intent → invoking operational tools (getActiveShipments, getCorridorRisk, compareRoutes) → synthesizing grounded recommendation...
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask NETRA about high-risk shipments, SHP-1024 rerouting, NH48 closures, or SLA policies..."
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#E2E8F0] rounded text-[#1F2937]"
            />
            <button
              type="submit"
              disabled={isThinking}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN (3 cols): Operational Context & Relevant Shipment Details */}
        <div className="xl:col-span-3 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2.5">
              <h2 className="text-xs font-semibold text-[#1F2937]">
                Live Operational Context
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Real-time shipment & corridor state grounded in agent tool calls
              </p>
            </div>

            {/* Active Shipment Dossier */}
            {contextShipment && (
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#1F2937]">
                    {contextShipment.id}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      contextShipment.riskScore >= 70
                        ? 'text-[#B85C5C]'
                        : contextShipment.riskScore >= 35
                        ? 'text-[#B58A45]'
                        : 'text-[#54846B]'
                    }`}
                  >
                    Risk {contextShipment.riskScore}/100
                  </span>
                </div>
                <div className="font-medium text-[#1F2937]">{contextShipment.customerName}</div>
                <div className="text-[11px] text-[#64748B]">{contextShipment.cargoType}</div>
                <div className="pt-1.5 border-t border-[#E2E8F0] space-y-1 text-[11px]">
                  <div>
                    <span className="text-[#64748B]">Route:</span>{' '}
                    <b>
                      {contextShipment.origin} → {contextShipment.destination}
                    </b>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Stops:</span>{' '}
                    {contextShipment.intermediateStops.join(', ') || 'Direct'}
                  </div>
                  <div>
                    <span className="text-[#64748B]">Vehicle / Driver:</span>{' '}
                    <span className="font-mono">
                      {contextShipment.assignedVehicleId} / {contextShipment.assignedDriverId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Predicted Delay:</span>{' '}
                    <b className="text-[#B85C5C]">+{contextShipment.predictedDelayHours} hrs</b>
                  </div>
                  <div>
                    <span className="text-[#64748B]">SLA Exposure:</span>{' '}
                    <b className="font-mono">
                      ₹
                      {(
                        contextShipment.predictedDelayHours *
                        contextShipment.delayPenaltyPerHour
                      ).toLocaleString('en-IN')}
                    </b>
                  </div>
                </div>
              </div>
            )}

            {/* Corridor Telemetry Context */}
            {contextCorridor && (
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1.5 text-xs">
                <div className="font-semibold text-[#1F2937]">
                  Corridor: {contextCorridor.name} ({contextCorridor.id})
                </div>
                <div className="text-[11px] text-[#64748B]">{contextCorridor.highway}</div>
                <div className="grid grid-cols-2 gap-2 pt-1.5 text-[11px] font-mono">
                  <div>Rain: {contextCorridor.rainfallIntensity} mm/h</div>
                  <div>Congestion: {contextCorridor.trafficCongestion}%</div>
                  <div>Score: {contextCorridor.riskScore}/100</div>
                  <div>Delay: +{contextCorridor.estimatedDelayHours}h</div>
                </div>
              </div>
            )}

            {/* Available Agent Tools Directory */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#1F2937]">
                9 Registered Agent Tool Functions
              </div>
              <div className="grid grid-cols-1 gap-1 text-[11px] font-mono text-[#52677D]">
                <span>• getActiveShipments()</span>
                <span>• getShipmentDetails(shipmentId)</span>
                <span>• getCorridorRisk(corridorId)</span>
                <span>• getHighRiskShipments()</span>
                <span>• calculateRoute(origin, dest, stops)</span>
                <span>• compareRoutes(routeOptions)</span>
                <span>• simulateDisruption(corridorId, scen)</span>
                <span>• retrieveCompanyKnowledge(query)</span>
                <span>• generateOperationalSummary()</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
