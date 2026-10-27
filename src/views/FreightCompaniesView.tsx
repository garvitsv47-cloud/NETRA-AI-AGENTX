import React, { useState, useEffect, useRef } from 'react';
import { useNetra } from '../context/NetraContext';
import {
  Building2,
  Map,
  ShieldAlert,
  SlidersHorizontal,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Compass,
  ShieldCheck,
  Database,
  Layers,
  Truck,
  FileCheck2,
} from 'lucide-react';

interface PilotFormState {
  companyName: string;
  contactPerson: string;
  businessEmail: string;
  contactPhone: string;
  companyWebsite: string;
  companyType: string;
  fleetSize: string;
  operatingRegion: string;
  mainChallenge: string;
  additionalRequirements: string;
  consentAccepted: boolean;
}

interface PersistenceStatus {
  loading: boolean;
  persistenceConfigured: boolean;
  status: string;
  missingDependency: string | null;
  explanation: string;
}

const COMPANY_TYPES = [
  'Freight Carrier',
  'Logistics Provider',
  'Fleet Operator',
  '3PL',
  'Enterprise Supply Chain',
  'Other',
];

const FLEET_SIZES = [
  '1–10 vehicles',
  '11–50 vehicles',
  '51–200 vehicles',
  '201–1,000 vehicles',
  '1,000+ vehicles',
];

const MAIN_CHALLENGES = [
  'Shipment Delays',
  'Route Disruptions',
  'Fleet Visibility',
  'Delivery SLA Management',
  'Weather-Related Risks',
  'Other',
];

export const FreightCompaniesView: React.FC = () => {
  const { setActiveTab } = useNetra();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const companyNameInputRef = useRef<HTMLInputElement | null>(null);

  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>({
    loading: true,
    persistenceConfigured: false,
    status: 'UNCONFIGURED_PERSISTENCE',
    missingDependency:
      'Persistent Database (Cloud SQL PostgreSQL via DATABASE_URL or Firebase Firestore)',
    explanation:
      'No persistent database (PostgreSQL / Cloud SQL via DATABASE_URL or Firebase Firestore) is currently configured in this prototype environment. Ephemeral in-memory storage and browser localStorage are disabled for business contact data to prevent silent data loss or fabricated submissions.',
  });

  const [formData, setFormData] = useState<PilotFormState>({
    companyName: '',
    contactPerson: '',
    businessEmail: '',
    contactPhone: '',
    companyWebsite: '',
    companyType: '',
    fleetSize: '',
    operatingRegion: '',
    mainChallenge: '',
    additionalRequirements: '',
    consentAccepted: false, // Explicitly not preselected
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    'IDLE' | 'SUCCESS' | 'ERROR' | 'VALIDATED_PREVIEW'
  >('IDLE');
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/pilot-applications/status')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Status check failed'))))
      .then((data) => {
        if (cancelled) return;
        setPersistenceStatus({
          loading: false,
          persistenceConfigured: Boolean(data.persistenceConfigured),
          status: data.status || 'UNCONFIGURED_PERSISTENCE',
          missingDependency:
            data.missingDependency ||
            'Persistent Database (Cloud SQL PostgreSQL via DATABASE_URL or Firebase Firestore)',
          explanation:
            data.explanation ||
            'No persistent database is currently configured in this prototype environment.',
        });
      })
      .catch(() => {
        if (cancelled) return;
        setPersistenceStatus((prev) => ({
          ...prev,
          loading: false,
          persistenceConfigured: false,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToPilotForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      companyNameInputRef.current?.focus();
    }, 250);
  };

  const validateClientForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const name = formData.companyName.trim();
    const person = formData.contactPerson.trim();
    const email = formData.businessEmail.trim();
    const phone = formData.contactPhone.trim();
    const website = formData.companyWebsite.trim();
    const region = formData.operatingRegion.trim();

    if (!name || name.length < 2 || name.length > 120) {
      errors.companyName = 'Company name is required (2–120 characters).';
    }
    if (!person || person.length < 2 || person.length > 100) {
      errors.contactPerson = 'Contact person is required (2–100 characters).';
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    if (!email || email.length > 160 || !emailRegex.test(email)) {
      errors.businessEmail = 'Please enter a valid business email address.';
    }
    const phoneDigits = (phone.match(/\d/g) || []).length;
    if (!phone || !/^[+0-9()\-\s.]{7,30}$/.test(phone) || phoneDigits < 7 || phoneDigits > 15) {
      errors.contactPhone = 'Please enter a valid contact phone number (7–15 digits).';
    }
    if (website) {
      try {
        const parsed = new URL(
          website.startsWith('http://') || website.startsWith('https://')
            ? website
            : `https://${website}`
        );
        if (!parsed.hostname.includes('.')) {
          errors.companyWebsite = 'Please enter a valid company website URL.';
        }
      } catch {
        errors.companyWebsite = 'Please enter a valid company website URL.';
      }
    }
    if (!formData.companyType || !COMPANY_TYPES.includes(formData.companyType)) {
      errors.companyType = 'Please select your company type.';
    }
    if (!formData.fleetSize || !FLEET_SIZES.includes(formData.fleetSize)) {
      errors.fleetSize = 'Please select your approximate fleet size.';
    }
    if (!region || region.length < 2 || region.length > 120) {
      errors.operatingRegion = 'Primary operating region is required (2–120 characters).';
    }
    if (!formData.mainChallenge || !MAIN_CHALLENGES.includes(formData.mainChallenge)) {
      errors.mainChallenge = 'Please select your main operational challenge.';
    }
    if (formData.additionalRequirements.length > 1000) {
      errors.additionalRequirements = 'Additional requirements cannot exceed 1,000 characters.';
    }
    if (!formData.consentAccepted) {
      errors.consentAccepted =
        'You must agree to be contacted regarding your NETRA AI pilot application.';
    }

    return errors;
  };

  const handleFieldChange = <K extends keyof PilotFormState>(
    field: K,
    value: PilotFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submissionStatus === 'ERROR' || submissionStatus === 'VALIDATED_PREVIEW') {
      setSubmissionStatus('IDLE');
      setSubmissionErrorMessage(null);
    }
  };

  const handlePreviewValidationCheck = () => {
    const errors = validateClientForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) {
      setSubmissionStatus('VALIDATED_PREVIEW');
      setSubmissionErrorMessage(null);
    } else {
      setSubmissionStatus('IDLE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validateClientForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!persistenceStatus.persistenceConfigured) {
      setSubmissionStatus('ERROR');
      setSubmissionErrorMessage("We couldn't submit your application. Please try again later.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionErrorMessage(null);

    try {
      const response = await fetch('/api/pilot-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json().catch(() => ({}));

      if (response.ok && payload.persisted === true) {
        setSubmissionStatus('SUCCESS');
      } else {
        if (payload.validationErrors && typeof payload.validationErrors === 'object') {
          setFieldErrors(payload.validationErrors);
        }
        setSubmissionStatus('ERROR');
        setSubmissionErrorMessage("We couldn't submit your application. Please try again later.");
      }
    } catch {
      setSubmissionStatus('ERROR');
      setSubmissionErrorMessage("We couldn't submit your application. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* PHASE 2.1 — HERO SECTION */}
      <section className="bg-[#111827] text-white rounded-md border border-[#1E293B] p-6 lg:p-8">
        <div className="max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#94A3B8]">
            <span>FOR FREIGHT COMPANIES</span>
            <span aria-hidden="true">·</span>
            <span>ENTERPRISE CONTROL TOWER EVALUATION</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#CBD5E1]">PILOT ACCESS PROGRAM</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Bring Your Freight Operations Into NETRA AI
          </h1>

          <p className="text-sm lg:text-base text-[#CBD5E1] leading-relaxed max-w-3xl">
            Monitor corridor risks, simulate disruptions, and coordinate recovery decisions through
            one intelligent logistics control tower.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToPilotForm}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>Apply for Pilot Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="px-4 py-2.5 text-xs font-semibold text-[#E2E8F0] bg-[#1E293B] hover:bg-[#334155] border border-[#334155] rounded flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Explore Platform</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#1E293B] text-xs text-[#94A3B8] flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Designed for Freight Carriers, 3PLs, Fleet Operators & Enterprise Supply Chains</span>
            <span aria-hidden="true">·</span>
            <span>Software-First Decision Support</span>
          </div>
        </div>
      </section>

      {/* PHASE 2.2 — PLATFORM CAPABILITIES (4 CONCISE CARDS) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Platform Capabilities</h2>
            <p className="text-xs text-[#64748B]">
              Core freight decision-support modules available for evaluation in the NETRA AI control
              tower.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#64748B]">
            Transparent Live vs. Unconfigured Integration Status
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#52677D]">
                <Map className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F2937]">Freight Corridor Intelligence</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Track 8 national highway freight corridors across 24 checkpoints with live
                Open-Meteo meteorological telemetry and OSRM road-network geometry.
              </p>
            </div>
            <div className="pt-2 border-t border-[#F1F5F9] text-[11px] font-mono text-[#64748B]">
              Open-Meteo & OSRM: <span className="text-[#54846B] font-semibold">LIVE</span> ·
              TomTom Traffic: <span className="text-[#B58A45]">REQUIRES KEY</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#B58A45]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F2937]">Predictive Risk Monitoring</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Explainable 5-factor weighted risk scoring combining weather severity, corridor
                congestion, incident history, infrastructure condition, and route flexibility.
              </p>
            </div>
            <div className="pt-2 border-t border-[#F1F5F9] text-[11px] font-mono text-[#64748B]">
              Current + 3h Forecast Risk Horizon · SLA Exposure Tracking
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#52677D]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F2937]">
                Digital Twin Disruption Simulation
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Stress-test heavy rainfall, highway closures, and congestion scenarios before
                committing fleet dispatches, comparing baseline vs. post-mitigation delays.
              </p>
            </div>
            <div className="pt-2 border-t border-[#F1F5F9] text-[11px] font-mono text-[#64748B]">
              Deterministic Stress-Testing · Hypothetical Financial Projections
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#54846B]">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F2937]">AI-Assisted Recovery Planning</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Coordinate 6-agent disruption analysis and Gemini tool-grounded recommendations
                with mandatory human-in-the-loop operator approval before route changes.
              </p>
            </div>
            <div className="pt-2 border-t border-[#F1F5F9] text-[11px] font-mono text-[#64748B]">
              Human Operator Approval Required · SOP Policy RAG
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 2.3 — HOW IT WORKS (4-STEP WORKFLOW) */}
      <section className="bg-white border border-[#E2E8F0] rounded-md p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">
              How Pilot Onboarding Works
            </h2>
            <p className="text-xs text-[#64748B]">
              Structured 4-stage progression from pilot application to controlled operational
              evaluation.
            </p>
          </div>
          <div className="text-xs text-[#4B5563] bg-[#F8FAFC] border border-[#E2E8F0] rounded px-3 py-1.5">
            <span className="font-semibold text-[#1F2937]">Scope Distinction:</span> Current phase
            collects pilot evaluation requests; multi-tenant self-serve company accounts are planned
            for future release.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#52677D]">01. Pilot Application</div>
            <div className="text-sm font-bold text-[#1F2937]">Apply for pilot access.</div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Submit your organization’s fleet profile, primary freight corridors, and key SLA or
              visibility challenges.
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#52677D]">02. Technical Scoping</div>
            <div className="text-sm font-bold text-[#1F2937]">
              NETRA AI reviews operational requirements.
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Our logistics architecture team evaluates corridor coverage, TMS manifest formats, and
              telematics compatibility.
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#52677D]">
              03. Integration Setup
            </div>
            <div className="text-sm font-bold text-[#1F2937]">
              Authorized integrations are configured.
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Server-side credentials for TomTom traffic, Traccar GPS, or CSV/TMS shipment feeds are
              provisioned in an isolated environment.
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#54846B]">
              04. Controlled Evaluation
            </div>
            <div className="text-sm font-bold text-[#1F2937]">
              The company begins evaluating NETRA AI in a controlled pilot.
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Dispatchers and supply-chain teams evaluate predictive risk alerts, Digital Twin
              simulations, and recovery workflows.
            </p>
          </div>
        </div>
      </section>

      {/* PHASE 3, 4, 5, 6 — PILOT APPLICATION FORM & PRIVACY/PERSISTENCE ARCHITECTURE */}
      <div
        id="pilot-application-form"
        ref={formSectionRef}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        {/* Left 2 Columns: Application Form */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-md p-5 lg:p-6 space-y-5">
          <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#52677D]" />
                <span>NETRA AI Pilot Application Form</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Request pilot evaluation access for your freight transportation, fleet, or supply
                chain organization.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#64748B]">
              Fields marked with <span className="text-[#B85C5C]">*</span> are required
            </span>
          </div>

          {/* PHASE 4 REQUIREMENT: Missing Persistent Database Dependency Banner when unconfigured */}
          {!persistenceStatus.loading && !persistenceStatus.persistenceConfigured && (
            <div
              role="status"
              aria-live="polite"
              className="p-4 rounded bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] space-y-1.5"
            >
              <div className="flex items-center gap-2 font-bold text-[#78350F]">
                <Database className="w-4 h-4 shrink-0 text-[#B58A45]" />
                <span>
                  Preview Form Mode — Persistent Database Dependency Not Configured
                </span>
              </div>
              <p className="leading-relaxed">
                <strong>Missing Dependency:</strong>{' '}
                <code className="font-mono bg-white/80 px-1.5 py-0.5 rounded border border-[#FDE68A]">
                  {persistenceStatus.missingDependency}
                </code>
              </p>
              <p className="leading-relaxed text-[#92400E]">
                {persistenceStatus.explanation} Final submission is disabled below until persistent
                database storage is configured so that no pilot application is ever fabricated or
                silently lost.
              </p>
            </div>
          )}

          {/* PHASE 5 — SUCCESS FEEDBACK (Shown only after verified server-side persistence) */}
          {submissionStatus === 'SUCCESS' && (
            <div
              role="alert"
              className="p-5 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#54846B] shrink-0" />
                <span>Application Submitted Successfully</span>
              </div>
              <p className="text-xs leading-relaxed">
                Thank you for your interest in NETRA AI. Your pilot application has been received.
              </p>
            </div>
          )}

          {/* PHASE 5 — ERROR FEEDBACK (Preserves entered form data) */}
          {submissionStatus === 'ERROR' && (
            <div
              role="alert"
              className="p-4 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] space-y-1"
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-[#B85C5C] shrink-0" />
                <span>
                  {submissionErrorMessage ||
                    "We couldn't submit your application. Please try again later."}
                </span>
              </div>
              <p className="text-[11px] text-[#7F1D1D]">
                Your entered form details have been preserved below.
              </p>
            </div>
          )}

          {/* Client-side preview validation confirmation */}
          {submissionStatus === 'VALIDATED_PREVIEW' && (
            <div
              role="status"
              className="p-3.5 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#1F2937] space-y-1"
            >
              <div className="font-semibold text-[#54846B] flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                <span>All form fields passed validation checks.</span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Note: This application has <strong>not</strong> been submitted or persisted because
                the persistent database dependency (<code>DATABASE_URL</code>) is not configured in
                this prototype environment.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Section A: Company Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#52677D] border-b border-[#F1F5F9] pb-1.5">
                1. Company Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label
                    htmlFor="pilot-company-name"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Company name <span className="text-[#B85C5C]">*</span>
                  </label>
                  <input
                    ref={companyNameInputRef}
                    id="pilot-company-name"
                    name="companyName"
                    type="text"
                    required
                    maxLength={120}
                    value={formData.companyName}
                    onChange={(e) => handleFieldChange('companyName', e.target.value)}
                    placeholder="e.g., Western Express Freight Pvt. Ltd."
                    aria-invalid={Boolean(fieldErrors.companyName)}
                    className={`w-full px-3 py-2 text-xs bg-[#F8FAFC] border rounded text-[#1F2937] focus:outline-none focus:bg-white ${
                      fieldErrors.companyName
                        ? 'border-[#B85C5C] focus:border-[#B85C5C]'
                        : 'border-[#CBD5E1] focus:border-[#52677D]'
                    }`}
                  />
                  {fieldErrors.companyName && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">{fieldErrors.companyName}</p>
                  )}
                </div>

                {/* Contact Person */}
                <div>
                  <label
                    htmlFor="pilot-contact-person"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Contact person <span className="text-[#B85C5C]">*</span>
                  </label>
                  <input
                    id="pilot-contact-person"
                    name="contactPerson"
                    type="text"
                    required
                    maxLength={100}
                    value={formData.contactPerson}
                    onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                    placeholder="e.g., Rajesh Sharma, VP Fleet Operations"
                    aria-invalid={Boolean(fieldErrors.contactPerson)}
                    className={`w-full px-3 py-2 text-xs bg-[#F8FAFC] border rounded text-[#1F2937] focus:outline-none focus:bg-white ${
                      fieldErrors.contactPerson
                        ? 'border-[#B85C5C] focus:border-[#B85C5C]'
                        : 'border-[#CBD5E1] focus:border-[#52677D]'
                    }`}
                  />
                  {fieldErrors.contactPerson && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">{fieldErrors.contactPerson}</p>
                  )}
                </div>

                {/* Business Email */}
                <div>
                  <label
                    htmlFor="pilot-business-email"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Business email <span className="text-[#B85C5C]">*</span>
                  </label>
                  <input
                    id="pilot-business-email"
                    name="businessEmail"
                    type="email"
                    required
                    maxLength={160}
                    value={formData.businessEmail}
                    onChange={(e) => handleFieldChange('businessEmail', e.target.value)}
                    placeholder="e.g., ops@westernexpress.in"
                    aria-invalid={Boolean(fieldErrors.businessEmail)}
                    className={`w-full px-3 py-2 text-xs bg-[#F8FAFC] border rounded text-[#1F2937] focus:outline-none focus:bg-white ${
                      fieldErrors.businessEmail
                        ? 'border-[#B85C5C] focus:border-[#B85C5C]'
                        : 'border-[#CBD5E1] focus:border-[#52677D]'
                    }`}
                  />
                  {fieldErrors.businessEmail && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">{fieldErrors.businessEmail}</p>
                  )}
                </div>

                {/* Contact Phone Number */}
                <div>
                  <label
                    htmlFor="pilot-contact-phone"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Contact phone number <span className="text-[#B85C5C]">*</span>
                  </label>
                  <input
                    id="pilot-contact-phone"
                    name="contactPhone"
                    type="tel"
                    required
                    maxLength={30}
                    value={formData.contactPhone}
                    onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                    placeholder="e.g., +91 98201 55410"
                    aria-invalid={Boolean(fieldErrors.contactPhone)}
                    className={`w-full px-3 py-2 text-xs bg-[#F8FAFC] border rounded text-[#1F2937] focus:outline-none focus:bg-white ${
                      fieldErrors.contactPhone
                        ? 'border-[#B85C5C] focus:border-[#B85C5C]'
                        : 'border-[#CBD5E1] focus:border-[#52677D]'
                    }`}
                  />
                  {fieldErrors.contactPhone && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">{fieldErrors.contactPhone}</p>
                  )}
                </div>

                {/* Company Website (Optional) */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="pilot-company-website"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Company website <span className="text-[#64748B] font-normal">(optional)</span>
                  </label>
                  <input
                    id="pilot-company-website"
                    name="companyWebsite"
                    type="url"
                    maxLength={200}
                    value={formData.companyWebsite}
                    onChange={(e) => handleFieldChange('companyWebsite', e.target.value)}
                    placeholder="https://www.example-logistics.in"
                    aria-invalid={Boolean(fieldErrors.companyWebsite)}
                    className={`w-full px-3 py-2 text-xs bg-[#F8FAFC] border rounded text-[#1F2937] focus:outline-none focus:bg-white ${
                      fieldErrors.companyWebsite
                        ? 'border-[#B85C5C] focus:border-[#B85C5C]'
                        : 'border-[#CBD5E1] focus:border-[#52677D]'
                    }`}
                  />
                  {fieldErrors.companyWebsite && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">{fieldErrors.companyWebsite}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section B: Operational Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#52677D] border-b border-[#F1F5F9] pb-1.5">
                2. Operational Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Type */}
                <div>
                  <label
                    htmlFor="pilot-company-type"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Company type <span className="text-[#B85C5C]">*</span>
                  </label>
                  <select
                    id="pilot-company-type"
                    name="companyType"
                    required
                    value={formData.companyType}
                    onChange={(e) => handleFieldChange('companyType', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.companyType)}
                    className={`w-full px-3 py-2 text-xs bg-[#F8FAFC] border rounded text-[#1F2937] focus:outline-none focus:bg-white ${
                      fieldErrors.companyType
                        ? 'border-[#B85C5C] focus:border-[#B85C5C]'
                        : 'border-[#CBD5E1] focus:border-[#52677D]'
                    }`}
                  >
                    <option value="">Select company type...</option>
                    {COMPANY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.companyType && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">{fieldErrors.companyType}</p>
                  )}
                </div>

                {/* Approximate Fleet Size */}
                <div>
                  <label
                    htmlFor="pilot-fleet-size"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Approximate fleet size <span className="text-[#B85C5C]">*</span>
                  </label>
                  <select
                    id="pilot-fleet-size"
                    name="fleetSize"
                    required
                    value={formData.fleetSize}
                    onChange={(e) => handleFieldChange('fleetSize', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.fleetSize)}
                    className={`w-full px-3 py-2 text-xs bg-[#F8FAFC] border rounded text-[#1F2937] focus:outline-none focus:bg-white ${
                      fieldErrors.fleetSize
                        ? 'border-[#B85C5C] focus:border-[#B85C5C]'
                        : 'border-[#CBD5E1] focus:border-[#52677D]'
                    }`}
                  >
                    <option value="">Select approximate fleet size...</option>
                    {FLEET_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.fleetSize && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">{fieldErrors.fleetSize}</p>
                  )}
                </div>

                {/* Primary Operating Region */}
                <div>
                  <label
                    htmlFor="pilot-operating-region"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Primary operating region <span className="text-[#B85C5C]">*</span>
                  </label>
                  <input
                    id="pilot-operating-region"
                    name="operatingRegion"
                    type="text"
                    required
                    maxLength={120}
                    value={formData.operatingRegion}
                    onChange={(e) => handleFieldChange('operatingRegion', e.target.value)}
                    placeholder="e.g., Western & Northern India (NH48 Delhi–Mumbai)"
                    aria-invalid={Boolean(fieldErrors.operatingRegion)}
                    className={`w-full px-3 py-2 text-xs bg-[#F8FAFC] border rounded text-[#1F2937] focus:outline-none focus:bg-white ${
                      fieldErrors.operatingRegion
                        ? 'border-[#B85C5C] focus:border-[#B85C5C]'
                        : 'border-[#CBD5E1] focus:border-[#52677D]'
                    }`}
                  />
                  {fieldErrors.operatingRegion && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">{fieldErrors.operatingRegion}</p>
                  )}
                </div>

                {/* Main Operational Challenge */}
                <div>
                  <label
                    htmlFor="pilot-main-challenge"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Main operational challenge <span className="text-[#B85C5C]">*</span>
                  </label>
                  <select
                    id="pilot-main-challenge"
                    name="mainChallenge"
                    required
                    value={formData.mainChallenge}
                    onChange={(e) => handleFieldChange('mainChallenge', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.mainChallenge)}
                    className={`w-full px-3 py-2 text-xs bg-[#F8FAFC] border rounded text-[#1F2937] focus:outline-none focus:bg-white ${
                      fieldErrors.mainChallenge
                        ? 'border-[#B85C5C] focus:border-[#B85C5C]'
                        : 'border-[#CBD5E1] focus:border-[#52677D]'
                    }`}
                  >
                    <option value="">Select primary challenge...</option>
                    {MAIN_CHALLENGES.map((challenge) => (
                      <option key={challenge} value={challenge}>
                        {challenge}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.mainChallenge && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">{fieldErrors.mainChallenge}</p>
                  )}
                </div>

                {/* Additional Requirements (Optional) */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="pilot-additional-requirements"
                    className="block text-xs font-semibold text-[#1F2937] mb-1"
                  >
                    Additional requirements{' '}
                    <span className="text-[#64748B] font-normal">(optional, max 1,000 chars)</span>
                  </label>
                  <textarea
                    id="pilot-additional-requirements"
                    name="additionalRequirements"
                    rows={3}
                    maxLength={1000}
                    value={formData.additionalRequirements}
                    onChange={(e) => handleFieldChange('additionalRequirements', e.target.value)}
                    placeholder="Specify cold-chain SLA requirements, existing GPS/TMS software (e.g., Traccar, SAP TM), or target highway corridors..."
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#1F2937] focus:outline-none focus:bg-white focus:border-[#52677D]"
                  />
                  {fieldErrors.additionalRequirements && (
                    <p className="mt-1 text-[11px] text-[#B85C5C]">
                      {fieldErrors.additionalRequirements}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section C: Consent Checkbox */}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
              <label
                htmlFor="pilot-consent-checkbox"
                className="flex items-start gap-2.5 text-xs text-[#1F2937] cursor-pointer select-none"
              >
                <input
                  id="pilot-consent-checkbox"
                  name="consentAccepted"
                  type="checkbox"
                  checked={formData.consentAccepted}
                  onChange={(e) => handleFieldChange('consentAccepted', e.target.checked)}
                  aria-invalid={Boolean(fieldErrors.consentAccepted)}
                  className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#52677D] focus:ring-[#52677D] cursor-pointer"
                />
                <span>
                  I agree to be contacted regarding my NETRA AI pilot application.{' '}
                  <span className="text-[#B85C5C]">*</span>
                </span>
              </label>
              {fieldErrors.consentAccepted && (
                <p className="text-[11px] text-[#B85C5C] pl-6">{fieldErrors.consentAccepted}</p>
              )}
            </div>

            {/* Section D: Submit Button & Persistence Status Disclosure */}
            <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={!persistenceStatus.persistenceConfigured || isSubmitting}
                  title={
                    persistenceStatus.persistenceConfigured
                      ? 'Submit Pilot Application'
                      : 'Submission disabled until a persistent database (DATABASE_URL) is configured'
                  }
                  className={`px-5 py-2.5 text-xs font-semibold rounded flex items-center gap-2 transition-colors ${
                    persistenceStatus.persistenceConfigured && !isSubmitting
                      ? 'bg-[#52677D] hover:bg-[#415366] text-white cursor-pointer'
                      : 'bg-[#E2E8F0] text-[#64748B] cursor-not-allowed'
                  }`}
                >
                  {!persistenceStatus.persistenceConfigured && <Lock className="w-3.5 h-3.5" />}
                  <span>
                    {isSubmitting ? 'Submitting Application...' : 'Submit Pilot Application'}
                  </span>
                </button>

                {!persistenceStatus.persistenceConfigured && (
                  <button
                    type="button"
                    onClick={handlePreviewValidationCheck}
                    className="px-3.5 py-2 text-xs font-medium text-[#52677D] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded cursor-pointer transition-colors"
                  >
                    Validate Form Fields (Preview Check)
                  </button>
                )}
              </div>

              {!persistenceStatus.persistenceConfigured && (
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  <strong>Why is submission disabled?</strong> No persistent database (
                  <code>DATABASE_URL</code> / Cloud SQL PostgreSQL or Firebase Firestore) is
                  configured in this prototype workspace. In accordance with NETRA AI data integrity
                  and privacy rules, applications are never stored in volatile memory or{' '}
                  <code>localStorage</code>, and successful submission is never fabricated.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Data Privacy, Security & Architecture Guarantees (Phase 6) */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-md p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1F2937]">
              <ShieldCheck className="w-4 h-4 text-[#54846B]" />
              <span>Data Privacy & Security Controls</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Business contact details submitted through the pilot program are treated as protected
              personal and commercial data.
            </p>
            <ul className="space-y-2 text-xs text-[#4B5563]">
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#54846B] font-bold">·</span>
                <span>
                  <strong>Server-Side Validation & Sanitization:</strong> Both client and Express
                  backend validate required fields, email syntax, phone length, and strip HTML or
                  control characters.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#54846B] font-bold">·</span>
                <span>
                  <strong>Rate Limiting & Payload Caps:</strong> Protected by a dedicated sliding
                  window limit (5 requests per 15 minutes per IP) and strict request size limits.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#54846B] font-bold">·</span>
                <span>
                  <strong>Zero Public Listing:</strong> Public <code>GET /api/pilot-applications</code>{' '}
                  access is explicitly blocked (HTTP 403) to prevent applicant enumeration.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#54846B] font-bold">·</span>
                <span>
                  <strong>Strict Data Isolation:</strong> Pilot applications are never mixed into
                  demonstration shipment or fleet tables and are never sent to Gemini or external AI
                  models.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#54846B] font-bold">·</span>
                <span>
                  <strong>No Unauthenticated Admin Panel:</strong> Administrative review is deferred
                  to authenticated backend operations rather than exposed in the prototype UI.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-5 space-y-2.5">
            <div className="text-xs font-mono font-bold text-[#52677D]">
              ALREADY HAVE OPERATIONAL DATA?
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              You can test NETRA AI’s existing dry-run CSV/TMS shipment adapter and live Open-Meteo
              corridor risk engine right now in the control tower.
            </p>
            <div className="pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('shipments')}
                className="text-left text-xs font-semibold text-[#52677D] hover:underline cursor-pointer"
              >
                Test CSV / TMS Shipment Adapter →
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className="text-left text-xs font-semibold text-[#52677D] hover:underline cursor-pointer"
              >
                Open Digital Twin Disruption Simulator →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 7 — COMPANY ACCOUNT ROADMAP */}
      <section className="bg-white border border-[#E2E8F0] rounded-md p-5 lg:p-6 space-y-4">
        <div className="border-b border-[#E2E8F0] pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono font-semibold text-[#52677D]">
              PRODUCT ARCHITECTURE ROADMAP
            </div>
            <h2 className="text-base font-bold text-[#1F2937]">
              Coming Next: Connected Company Workspaces
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">
            Planned Post-Pilot Enterprise Capabilities
          </span>
        </div>

        <p className="text-xs text-[#4B5563] leading-relaxed max-w-4xl">
          Following initial pilot evaluations, NETRA AI will transition approved freight operators
          from the single-workspace prototype into dedicated, multi-tenant company workspaces with
          authenticated data pipelines:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F2937]">
              <Layers className="w-4 h-4 text-[#52677D]" />
              <span>Multi-Tenant Workspace Isolation & RBAC</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Dedicated PostgreSQL tenant schemas with OAuth2 / OIDC single sign-on and granular
              permissions for Control Tower Operators, Fleet Managers, and Executive Viewers.
            </p>
          </div>

          <div className="p-4 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F2937]">
              <Truck className="w-4 h-4 text-[#54846B]" />
              <span>Persistent TMS & Telematics Connectors</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Automated webhook ingestion for enterprise TMS platforms alongside persistent Traccar
              GPS and commercial ELD vehicle telemetry streams to unlock Connected Fleet Mode.
            </p>
          </div>

          <div className="p-4 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F2937]">
              <Building2 className="w-4 h-4 text-[#B58A45]" />
              <span>Custom SLA & Approval Governance</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Company-specific customer penalty structures, custom SOP policy libraries for RAG, and
              auditable multi-stage human approval logs for dispatch modifications.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
