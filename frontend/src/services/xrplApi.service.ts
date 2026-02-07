/**
 * XRPL API client - connects to backend /api/xrpl/* endpoints
 */

const API_BASE = '/api';

export interface XrplTransaction {
  hash: string;
  ledger: number;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  riskScore: number;
}

export interface XrplEscrow {
  sequence: number;
  amount: string | { value: string; currency: string; issuer: string };
  destination: string;
  finishAfter?: number;
  cancelAfter?: number;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  return data as T;
}

export async function getBalance(
  address: string,
  currency?: string,
  issuer?: string
): Promise<{ address: string; balance: string; currency: string }> {
  const params = new URLSearchParams({ address });
  if (currency) params.set('currency', currency);
  if (issuer) params.set('issuer', issuer);
  return fetchJson(`${API_BASE}/xrpl/balance?${params}`);
}

export async function getTransactions(
  address: string,
  limit = 50
): Promise<{ address: string; transactions: XrplTransaction[] }> {
  return fetchJson(`${API_BASE}/xrpl/transactions?address=${encodeURIComponent(address)}&limit=${limit}`);
}

export async function getPolIssuer(): Promise<{ issuer: string | null; currency: string }> {
  return fetchJson(`${API_BASE}/xrpl/pol/issuer`);
}

export interface PolRiskSentiment {
  riskScore: number;
  sentiment: number;
  sentimentLabel: 'negative' | 'neutral' | 'positive';
  headlines: { title: string; summary?: string; sentiment?: number; source?: string }[];
  polTxCount: number;
  polTxRiskAvg: number;
  flaggedCount: number;
}

export async function getPolRiskSentiment(): Promise<PolRiskSentiment> {
  return fetchJson(`${API_BASE}/xrpl/pol/risk-sentiment`);
}

export async function getPolBalance(address: string): Promise<{
  address: string;
  balance: string;
  currency: string;
  issuer?: string;
}> {
  return fetchJson(`${API_BASE}/xrpl/pol/balance?address=${encodeURIComponent(address)}`);
}

export async function getRlusdBalance(address: string): Promise<{
  address: string;
  balance: string;
  currency: string;
}> {
  return fetchJson(`${API_BASE}/xrpl/rlusd/balance?address=${encodeURIComponent(address)}`);
}

export async function createEscrow(payload: {
  ownerSeed?: string;
  useDemoWallet?: boolean;
  recipient: string;
  amount: string;
  currency: string;
  cancelAfter: number;
  issuer?: string;
  finishAfter?: number;
}): Promise<{ hash: string; sequence: number }> {
  return fetchJson(`${API_BASE}/xrpl/escrow/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function finishEscrow(
  ownerSeed: string,
  escrowSequence: number
): Promise<{ hash: string }> {
  return fetchJson(`${API_BASE}/xrpl/escrow/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerSeed, escrowSequence }),
  });
}

export async function cancelEscrow(
  ownerSeed: string,
  escrowSequence: number
): Promise<{ hash: string }> {
  return fetchJson(`${API_BASE}/xrpl/escrow/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerSeed, escrowSequence }),
  });
}

export async function listEscrows(owner: string): Promise<{
  owner: string;
  escrows: XrplEscrow[];
}> {
  return fetchJson(`${API_BASE}/xrpl/escrow/list?owner=${encodeURIComponent(owner)}`);
}

// ─────────────────────────────────────────────────────────────
// Intelligence Report API - Phase 2/3
// ─────────────────────────────────────────────────────────────
// Note: IntelligenceReport type is imported from @/types
// to maintain single source of truth across the app

import type { IntelligenceReport } from '@/types';

export async function submitIntelligenceReport(payload: {
  title: string;
  description: string;
  eventDate: string;
  countries: string[];
  impactType: string;
  stakeAmount: number;
  userWallet: string;
  walletSeed?: string;
}): Promise<{
  success: boolean;
  reportId: string;
  stakeHash: string;
  message: string;
}> {
  return fetchJson(`${API_BASE}/reports/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function listIntelligenceReports(
  status?: string,
  limit = 20,
  offset = 0
): Promise<{
  success: boolean;
  count: number;
  reports: IntelligenceReport[];
}> {
  const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  if (status) params.set('status', status);
  return fetchJson(`${API_BASE}/reports?${params}`);
}

export async function getIntelligenceReport(id: string): Promise<{
  success: boolean;
} & IntelligenceReport> {
  return fetchJson(`${API_BASE}/reports/${encodeURIComponent(id)}`);
}

export async function voteOnReport(payload: {
  reportId: string;
  vote: 'support' | 'challenge' | 'abstain';
  userWallet: string;
  walletSeed?: string;
}): Promise<{ success: boolean; voteId: string; message: string }> {
  return fetchJson(`${API_BASE}/reports/${encodeURIComponent(payload.reportId)}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function claimReportRewards(reportId: string, userWallet: string): Promise<{
  success: boolean;
  message: string;
  amount: number;
  currency: string;
}> {
  return fetchJson(`${API_BASE}/reports/${encodeURIComponent(reportId)}/rewards/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userWallet }),
  });
}

export async function getPolRiskSentimentWithReports(): Promise<PolRiskSentiment & {
  recentReports?: IntelligenceReport[];
  reportCount?: number;
}> {
  return fetchJson(`${API_BASE}/xrpl/pol/risk-sentiment`);
}
