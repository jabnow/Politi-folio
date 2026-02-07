/**
 * Backend API client - connects to Express backend via Vite proxy.
 * Falls back to mock data when API is unavailable.
 */
const API_BASE = '/api';

/** Test backend connection - returns { ok: true, port } if reachable, { ok: false } otherwise */
export async function checkBackendHealth(): Promise<{ ok: boolean; port?: number; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: data.ok === true, port: data.port };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Connection refused' };
  }
}

export interface GeopoliticalEvent {
  id: number;
  timestamp: string;
  type: 'sanctions' | 'trade' | 'policy' | 'regulation' | 'political' | 'compliance';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  country: string;
  affectedTransactions: number;
  source: string;
}

export interface Transaction {
  id: string;
  hash: string;
  sender: string;
  receiver: string;
  amount: string;
  currency: string;
  timestamp: string;
  riskScore: number;
}

export interface AIDecision {
  id: string;
  transactionId: string;
  counterparty: string;
  country: string;
  amount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: 'APPROVE' | 'REVIEW' | 'REJECT' | 'FREEZE';
  reasoning: string[];
  complianceChecks: {
    sanctionsList: 'CLEAR' | 'FLAGGED';
    countryRisk: number;
    transactionPattern: 'NORMAL' | 'SUSPICIOUS';
    regulatoryStatus: 'COMPLIANT' | 'REVIEW_REQUIRED';
  };
  confidence: number;
  timestamp: string;
}

export interface ReconciliationTask {
  id: string;
  eventType: string;
  triggeredBy: string;
  status: 'processing' | 'completed' | 'requires_review' | 'failed';
  transactionsScanned: number;
  transactionsFlagged: number;
  transactionsReconciled: number;
  startTime: string;
  completionTime?: string;
  estimatedSavings: number;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

async function fetchWithFallback<T>(
  url: string,
  fallback: T | (() => T)
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
}

/** Format as YYYY-MM-DD HH:MM:SS */
const ts = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 19);

// Mock data fallback when API is unavailable – uses real timestamps
const getMockEvents = (): GeopoliticalEvent[] => {
  const now = new Date();
  return [
  {
    id: 1,
    timestamp: ts(now),
    type: 'sanctions',
    severity: 'CRITICAL',
    title: 'New EU Sanctions on Russian Energy Sector',
    description: 'European Union announces comprehensive sanctions targeting Russian energy companies. All transactions with listed entities must be frozen immediately.',
    country: 'Russia',
    affectedTransactions: 125,
    source: 'EU Official Journal',
  },
  {
    id: 2,
    timestamp: ts(new Date(now.getTime() - 5 * 60000)),
    type: 'trade',
    severity: 'HIGH',
    title: 'Belarus Trade Restrictions Extended',
    description: 'US Treasury extends trade restrictions on Belarus financial sector for additional 6 months. Enhanced due diligence required.',
    country: 'Belarus',
    affectedTransactions: 45,
    source: 'OFAC',
  },
  {
    id: 3,
    timestamp: ts(new Date(now.getTime() - 11 * 60000)),
    type: 'regulation',
    severity: 'MEDIUM',
    title: 'ECB Updates AML Requirements',
    description: 'European Central Bank releases updated anti-money laundering guidelines for cross-border transactions exceeding €10,000.',
    country: 'EU',
    affectedTransactions: 234,
    source: 'ECB',
  },
  {
    id: 4,
    timestamp: ts(new Date(now.getTime() - 18 * 60000)),
    type: 'policy',
    severity: 'MEDIUM',
    title: 'Fed Maintains Interest Rates',
    description: 'Federal Reserve maintains interest rates at 5.25-5.50%. Statement emphasizes continued focus on inflation management.',
    country: 'USA',
    affectedTransactions: 312,
    source: 'Federal Reserve',
  },
  {
    id: 5,
    timestamp: ts(new Date(now.getTime() - 25 * 60000)),
    type: 'political',
    severity: 'HIGH',
    title: 'Political Instability in Brazil',
    description: 'Protests escalate in São Paulo. Increased country risk assessment recommended for Brazilian counterparties.',
    country: 'Brazil',
    affectedTransactions: 156,
    source: 'Reuters',
  },
  {
    id: 6,
    timestamp: ts(new Date(now.getTime() - 38 * 60000)),
    type: 'compliance',
    severity: 'LOW',
    title: 'Singapore Updates Crypto Regulations',
    description: 'MAS clarifies compliance requirements for digital asset transactions. New reporting thresholds effective March 1.',
    country: 'Singapore',
    affectedTransactions: 23,
    source: 'MAS',
  },
  {
    id: 7,
    timestamp: ts(new Date(now.getTime() - 51 * 60000)),
    type: 'sanctions',
    severity: 'MEDIUM',
    title: 'UK Adds Entities to Sanctions List',
    description: 'UK government adds 12 entities to consolidated sanctions list. Immediate screening of existing relationships required.',
    country: 'UK',
    affectedTransactions: 67,
    source: 'UK Treasury',
  },
  {
    id: 8,
    timestamp: ts(new Date(now.getTime() - 61 * 60000)),
    type: 'trade',
    severity: 'CRITICAL',
    title: 'US Threatens 100% Tariffs on Taiwan-Made Semiconductors',
    description: 'Tariff threat raises supply chain fears for TSMC customers. Apple, NVIDIA, AMD, Qualcomm face potential 15%+ chip price increases. 7nm–3nm wafers affected.',
    country: 'Taiwan',
    affectedTransactions: 412,
    source: 'Reuters',
  },
  {
    id: 9,
    timestamp: ts(new Date(now.getTime() - 68 * 60000)),
    type: 'regulation',
    severity: 'HIGH',
    title: 'China Launches Antitrust Probes on NVIDIA, Google',
    description: 'Beijing revives antitrust investigations in response to US tariffs. Intel may face similar probe. Cross-border tech transactions require enhanced due diligence.',
    country: 'China',
    affectedTransactions: 189,
    source: 'Ars Technica',
  },
  {
    id: 10,
    timestamp: ts(new Date(now.getTime() - 75 * 60000)),
    type: 'policy',
    severity: 'HIGH',
    title: 'US CHIPS Act Review Delays Intel, TSMC, Samsung Subsidies',
    description: 'Administration renegotiating subsidy conditions. Labor and childcare requirements under review. Disbursements to major chipmakers delayed.',
    country: 'USA',
    affectedTransactions: 78,
    source: 'Reuters',
  },
  {
    id: 11,
    timestamp: ts(new Date(now.getTime() - 81 * 60000)),
    type: 'trade',
    severity: 'MEDIUM',
    title: 'TSMC Signals 15% Semiconductor Price Increase to Pass Tariff Costs',
    description: 'Advanced wafer pricing could rise from $18K to $20K–23K per unit. New tariff round projected Feb 18. NVIDIA, Apple, AMD among affected customers.',
    country: 'Taiwan',
    affectedTransactions: 256,
    source: 'TechSpot',
  },
  {
    id: 12,
    timestamp: ts(new Date(now.getTime() - 88 * 60000)),
    type: 'political',
    severity: 'MEDIUM',
    title: 'Taiwan Legacy Chip Sector Faces China Competition',
    description: 'Chinese foundries Nexchip, SMIC, Hua Hong gaining share in mature-node chips. $56B market at stake. Taiwan firms under pricing pressure.',
    country: 'Taiwan',
    affectedTransactions: 134,
    source: 'Reuters',
  },
];
};

const getMockDecisions = (): AIDecision[] => {
  const now = new Date();
  return [
  {
    id: 'DEC001',
    transactionId: 'TX001',
    counterparty: 'Gazprom Energy Ltd.',
    country: 'Russia',
    amount: 125000,
    riskLevel: 'CRITICAL',
    recommendation: 'FREEZE',
    reasoning: [
      'Counterparty appears on OFAC sanctions list',
      'Russia classified as high-risk jurisdiction (Score: 95)',
      `Recent EU sanctions announced ${ts(new Date(now.getTime() - 86400000)).slice(0, 10)}`,
      'Transaction amount exceeds threshold for sanctioned entities',
    ],
    complianceChecks: {
      sanctionsList: 'FLAGGED',
      countryRisk: 95,
      transactionPattern: 'SUSPICIOUS',
      regulatoryStatus: 'REVIEW_REQUIRED',
    },
    confidence: 98,
    timestamp: ts(now),
  },
  {
    id: 'DEC002',
    transactionId: 'TX003',
    counterparty: 'Minsk Trading Co.',
    country: 'Belarus',
    amount: 245000,
    riskLevel: 'HIGH',
    recommendation: 'REJECT',
    reasoning: [
      'Belarus under active trade restrictions',
      'Counterparty in restricted sector (energy)',
      'No established business relationship',
      'Unable to verify beneficial ownership',
    ],
    complianceChecks: {
      sanctionsList: 'FLAGGED',
      countryRisk: 78,
      transactionPattern: 'SUSPICIOUS',
      regulatoryStatus: 'REVIEW_REQUIRED',
    },
    confidence: 92,
    timestamp: ts(new Date(now.getTime() - 2 * 60000)),
  },
  {
    id: 'DEC003',
    transactionId: 'TX002',
    counterparty: 'Singapore Tech Corp.',
    country: 'Singapore',
    amount: 89500,
    riskLevel: 'LOW',
    recommendation: 'APPROVE',
    reasoning: [
      'Counterparty verified, established relationship',
      'Singapore low-risk jurisdiction (Score: 8)',
      'Transaction pattern matches historical data',
      'All compliance checks passed',
    ],
    complianceChecks: {
      sanctionsList: 'CLEAR',
      countryRisk: 8,
      transactionPattern: 'NORMAL',
      regulatoryStatus: 'COMPLIANT',
    },
    confidence: 96,
    timestamp: ts(new Date(now.getTime() - 1 * 60000)),
  },
  {
    id: 'DEC004',
    transactionId: 'TX004',
    counterparty: 'Nord Stream Partners AG',
    country: 'Germany',
    amount: 320000,
    riskLevel: 'MEDIUM',
    recommendation: 'REVIEW',
    reasoning: [
      'Partial ownership links to sanctioned entities',
      'Requires enhanced due diligence',
      'Transaction pattern within normal range',
    ],
    complianceChecks: {
      sanctionsList: 'CLEAR',
      countryRisk: 45,
      transactionPattern: 'NORMAL',
      regulatoryStatus: 'REVIEW_REQUIRED',
    },
    confidence: 85,
    timestamp: ts(new Date(now.getTime() - 3 * 60000)),
  },
  {
    id: 'DEC005',
    transactionId: 'TX005',
    counterparty: 'Emirates Trading Corp.',
    country: 'UAE',
    amount: 178000,
    riskLevel: 'LOW',
    recommendation: 'APPROVE',
    reasoning: [
      'Verified counterparty in low-risk jurisdiction',
      'Established trading relationship',
      'All compliance checks passed',
    ],
    complianceChecks: {
      sanctionsList: 'CLEAR',
      countryRisk: 22,
      transactionPattern: 'NORMAL',
      regulatoryStatus: 'COMPLIANT',
    },
    confidence: 94,
    timestamp: ts(new Date(now.getTime() - 4 * 60000)),
  },
];
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    hash: 'A1B2C3D4E5F6',
    sender: 'rWalletAddress1',
    receiver: 'rWalletAddress2',
    amount: '1000',
    currency: 'USD',
    timestamp: new Date().toISOString(),
    riskScore: 15,
  },
  {
    id: '2',
    hash: 'F6E5D4C3B2A1',
    sender: 'rWalletAddress3',
    receiver: 'rWalletAddress4',
    amount: '50000',
    currency: 'EUR',
    timestamp: new Date().toISOString(),
    riskScore: 85,
  },
  {
    id: '3',
    hash: '1234567890AB',
    sender: 'rWalletAddress5',
    receiver: 'rWalletAddress6',
    amount: '250',
    currency: 'XRP',
    timestamp: new Date().toISOString(),
    riskScore: 5,
  },
];

const getMockReconciliationTasks = (): ReconciliationTask[] => {
  const now = new Date();
  return [
  {
    id: 'REC-001',
    eventType: 'EU Sanctions Update',
    triggeredBy: 'Automated Policy Monitor',
    status: 'completed',
    transactionsScanned: 1247,
    transactionsFlagged: 125,
    transactionsReconciled: 125,
    startTime: ts(now),
    completionTime: ts(new Date(now.getTime() + 45 * 1000)),
    estimatedSavings: 3200,
    assignedTo: 'AI Engine',
    priority: 'critical',
  },
  {
    id: 'REC-002',
    eventType: 'Belarus Trade Restrictions',
    triggeredBy: 'OFAC Alert',
    status: 'completed',
    transactionsScanned: 892,
    transactionsFlagged: 45,
    transactionsReconciled: 45,
    startTime: ts(new Date(now.getTime() - 5 * 60000)),
    completionTime: ts(new Date(now.getTime() - 5 * 60000 + 32 * 1000)),
    estimatedSavings: 1800,
    assignedTo: 'AI Engine',
    priority: 'high',
  },
  {
    id: 'REC-003',
    eventType: 'ECB AML Guidelines Update',
    triggeredBy: 'Regulatory Feed',
    status: 'processing',
    transactionsScanned: 3421,
    transactionsFlagged: 234,
    transactionsReconciled: 156,
    startTime: ts(new Date(now.getTime() - 11 * 60000)),
    estimatedSavings: 2400,
    priority: 'medium',
  },
  {
    id: 'REC-004',
    eventType: 'Country Risk Update - Brazil',
    triggeredBy: 'Geopolitical Monitor',
    status: 'requires_review',
    transactionsScanned: 567,
    transactionsFlagged: 156,
    transactionsReconciled: 142,
    startTime: ts(new Date(now.getTime() - 25 * 60000)),
    estimatedSavings: 1200,
    assignedTo: 'Compliance Team',
    priority: 'high',
  },
  {
    id: 'REC-005',
    eventType: 'Routine Daily Reconciliation',
    triggeredBy: 'Scheduled Task',
    status: 'completed',
    transactionsScanned: 8945,
    transactionsFlagged: 23,
    transactionsReconciled: 23,
    startTime: ts(new Date(now.getTime() - 5 * 3600000)),
    completionTime: ts(new Date(now.getTime() - 5 * 3600000 + 135 * 1000)),
    estimatedSavings: 4500,
    assignedTo: 'AI Engine',
    priority: 'low',
  },
];
};

export async function fetchEvents(): Promise<GeopoliticalEvent[]> {
  return fetchWithFallback('/events', getMockEvents);
}

export async function fetchTransactions(): Promise<Transaction[]> {
  return fetchWithFallback('/reconciliation', MOCK_TRANSACTIONS);
}

export async function fetchDecisions(): Promise<AIDecision[]> {
  return fetchWithFallback('/decisions', getMockDecisions);
}

export async function fetchReconciliationTasks(): Promise<ReconciliationTask[]> {
  return fetchWithFallback('/reconciliation-tasks', getMockReconciliationTasks);
}

/** Run workflow with real news (NVDA, TSMC, etc.) and rebalance. Triggers refresh. */
export async function runWorkflow(params?: { q?: string; portfolio?: string[] }): Promise<{ key_event_id?: string; error?: string }> {
  try {
    const url = new URL('/api/workflow', window.location.origin);
    if (params?.q) url.searchParams.set('q', params.q);
    if (params?.portfolio?.length) url.searchParams.set('portfolio', params.portfolio.join(','));
    const res = await fetch(url.toString(), { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const text = await res.text();
    const data = text ? (JSON.parse(text) as { error?: string; key_event_id?: string }) : {};
    if (!res.ok) return { error: data.error ?? `HTTP ${res.status}` };
    window.dispatchEvent(new CustomEvent('politifolio-refresh'));
    return { key_event_id: data.key_event_id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Request failed';
    return { error: msg.includes('JSON') || msg.includes('fetch') ? 'Backend not running. Start it with: cd backend && npm run dev' : msg };
  }
}
