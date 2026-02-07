/**
 * Backend API calls (Mocked for frontend-only development)
 */
// const API_BASE = '/api'

// Define types locally since we can't import from backend easily
export interface GeopoliticalEvent {
  id: string
  title: string
  region: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string // Changed to string for JSON serialization
}

export interface Transaction {
  id: string
  hash: string
  sender: string
  receiver: string
  amount: string
  currency: string
  timestamp: string
  riskScore: number
}

// Mock Data
const MOCK_EVENTS: GeopoliticalEvent[] = [
  {
    id: '1',
    title: 'New Sanctions on Region X',
    region: 'Eastern Europe',
    severity: 'high',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Trade Agreement Signed',
    region: 'Asia Pacific',
    severity: 'low',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Political Unrest Reports',
    region: 'South America',
    severity: 'medium',
    timestamp: new Date().toISOString(),
  }
];

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
  }
];

const MOCK_DECISIONS = [
  {
    id: '1',
    type: 'Block',
    reason: 'High Risk Score',
    target: 'Transaction #2',
    timestamp: new Date().toISOString(),
    status: 'Pending Review'
  },
  {
    id: '2',
    type: 'Flag',
    reason: 'Unusual Volume',
    target: 'Account rWalletAddress1',
    timestamp: new Date().toISOString(),
    status: 'Resolved'
  }
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchEvents() {
  await delay(500);
  return MOCK_EVENTS;
}

export async function fetchTransactions() {
  await delay(700);
  return MOCK_TRANSACTIONS;
}

export async function fetchDecisions() {
  await delay(600);
  return MOCK_DECISIONS;
}
