import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getPolRiskSentiment,
  getPolIssuer,
  getBalance,
  getTransactions,
  getPolBalance,
  getRlusdBalance,
  createEscrow,
  listEscrows,
  type PolRiskSentiment as PolRiskSentimentType,
  type XrplTransaction,
  type XrplEscrow,
} from '@/services/xrplApi.service';
import { checkBackendHealth } from '@/services/api.service';

const MOCK_RISK_SENTIMENT: PolRiskSentimentType = {
  riskScore: 42,
  sentiment: 0.15,
  sentimentLabel: 'positive',
  headlines: [
    { title: 'EU Sanctions Impact Crypto Cross-Border Flows', sentiment: -0.3 },
    { title: 'XRP Ledger Adopted for Compliance-Cleared Settlements', sentiment: 0.4 },
    { title: 'Geopolitical Risk Drives Demand for Policy-Linked Tokens', sentiment: 0.2 },
  ],
  polTxCount: 12,
  polTxRiskAvg: 38,
  flaggedCount: 2,
};

export function XRPDashboard() {
  const [riskSentiment, setRiskSentiment] = useState<PolRiskSentimentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [expandedLookup, setExpandedLookup] = useState(false);
  const [address, setAddress] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [xrpBalance, setXrpBalance] = useState<string | null>(null);
  const [polBalance, setPolBalance] = useState<string | null>(null);
  const [rlusdBalance, setRlusdBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<XrplTransaction[]>([]);
  const [escrows, setEscrows] = useState<XrplEscrow[]>([]);
  const [escrowForm, setEscrowForm] = useState({ recipient: '', amount: '', currency: 'XRP' });
  const [escrowSubmitting, setEscrowSubmitting] = useState(false);
  const [escrowError, setEscrowError] = useState<string | null>(null);
  const [polIssuerAddress, setPolIssuerAddress] = useState<string | null>(null);

  const fetchRiskSentiment = useCallback(async () => {
    setLoading(true);
    try {
      const ok = await checkBackendHealth();
      if (!ok.ok) {
        setRiskSentiment(MOCK_RISK_SENTIMENT);
        setUseMock(true);
        return;
      }
      const data = await getPolRiskSentiment();
      setRiskSentiment(data);
      setUseMock(false);
    } catch {
      setRiskSentiment(MOCK_RISK_SENTIMENT);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAddressData = useCallback(async (addr: string) => {
    if (!addr.trim()) return;
    try {
      const [xrpRes, polRes, rlusdRes, txRes, escrowRes] = await Promise.all([
        getBalance(addr).catch(() => ({ balance: '0' })),
        getPolBalance(addr).catch(() => ({ balance: '0' })),
        getRlusdBalance(addr).catch(() => ({ balance: '0' })),
        getTransactions(addr, 20).catch(() => ({ transactions: [] })),
        listEscrows(addr).catch(() => ({ escrows: [] })),
      ]);
      setXrpBalance((xrpRes as { balance: string }).balance);
      setPolBalance((polRes as { balance: string }).balance);
      setRlusdBalance((rlusdRes as { balance: string }).balance);
      setTransactions((txRes as { transactions: XrplTransaction[] }).transactions);
      setEscrows((escrowRes as { escrows: XrplEscrow[] }).escrows);
    } catch {
      setXrpBalance('0');
      setPolBalance('0');
      setRlusdBalance('0');
      setTransactions([]);
      setEscrows([]);
    }
  }, []);

  useEffect(() => {
    fetchRiskSentiment();
    checkBackendHealth().then((r) => {
      if (r.ok) getPolIssuer().then((d) => d.issuer && setPolIssuerAddress(d.issuer));
    });
  }, [fetchRiskSentiment]);

  useEffect(() => {
    const t = setInterval(fetchRiskSentiment, 60000);
    return () => clearInterval(t);
  }, [fetchRiskSentiment]);

  const handleLookup = (addr?: string) => {
    const target = addr ?? address.trim();
    if (!target) return;
    setAddress(target);
    setResolvedAddress(target);
    setExpandedLookup(true);
    fetchAddressData(target);
  };

  const handleCreateEscrow = async () => {
    if (!escrowForm.recipient || !escrowForm.amount) return;
    setEscrowSubmitting(true);
    setEscrowError(null);
    try {
      const now = Math.floor(Date.now() / 1000);
      await createEscrow({
        useDemoWallet: true,
        recipient: escrowForm.recipient,
        amount: escrowForm.amount,
        currency: escrowForm.currency,
        cancelAfter: now + 86400 * 7,
        finishAfter: now + 86400 * 5,
      });
      setEscrowForm({ recipient: '', amount: '', currency: 'XRP' });
      if (resolvedAddress) fetchAddressData(resolvedAddress);
    } catch (e) {
      setEscrowError(e instanceof Error ? e.message : 'Escrow create failed');
    } finally {
      setEscrowSubmitting(false);
    }
  };

  const sentimentColor =
    riskSentiment?.sentimentLabel === 'negative'
      ? 'text-red-400'
      : riskSentiment?.sentimentLabel === 'positive'
        ? 'text-emerald-400'
        : 'text-zinc-400';

  return (
    <div className="min-h-full flex flex-col gap-6 p-4 overflow-auto relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="shrink-0">
        <h2 className="font-display font-semibold text-xl text-white mb-1">
          POL Risk & Social Sentiment
        </h2>
        <p className="text-sm text-zinc-400">
          Geopolitical Policy token: risk tracking and sentiment from news affecting XRPL and crypto compliance.
        </p>
        {useMock && (
          <p className="text-amber-500/90 text-xs mt-2">Using mock data — backend unavailable</p>
        )}
      </div>

      {/* Risk + Sentiment cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/50 to-zinc-900 p-4"
        >
          <div className="text-xs text-amber-400/90 mb-1 font-medium">POL Risk Score</div>
          <div className="font-display text-3xl font-bold text-white font-mono">
            {loading ? '—' : riskSentiment?.riskScore ?? '—'}
          </div>
          <div className="text-xs text-amber-300/70 mt-1">0–100 composite</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/50 to-zinc-900 p-4"
        >
          <div className="text-xs text-cyan-400/90 mb-1 font-medium">Social Sentiment</div>
          <div className={`font-display text-2xl font-bold capitalize ${sentimentColor}`}>
            {loading ? '—' : riskSentiment?.sentimentLabel ?? '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1 font-mono">
            {riskSentiment != null ? `${(riskSentiment.sentiment * 100).toFixed(0)}%` : '—'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-xl border border-zinc-600/30 bg-zinc-900/80 p-4"
        >
          <div className="text-xs text-zinc-400 mb-1 font-medium">POL Transactions</div>
          <div className="font-display text-2xl font-bold text-white font-mono">
            {loading ? '—' : riskSentiment?.polTxCount ?? '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">avg risk {riskSentiment?.polTxRiskAvg ?? '—'}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/30 to-zinc-900 p-4"
        >
          <div className="text-xs text-red-400/90 mb-1 font-medium">Flagged</div>
          <div className="font-display text-2xl font-bold text-red-400 font-mono">
            {loading ? '—' : riskSentiment?.flaggedCount ?? '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">high-risk txns</div>
        </motion.div>
      </div>

      {/* Headlines affecting POL */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="shrink-0"
      >
        <Card className="bg-zinc-900/80 border-zinc-800 p-4">
          <h3 className="font-display font-semibold text-white mb-2">News Affecting POL Sentiment</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Geopolitical and crypto news driving risk and sentiment.
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <AnimatePresence>
              {(riskSentiment?.headlines ?? []).map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="py-2 px-3 rounded bg-zinc-800/50 text-sm border-l-2 border-amber-500/30"
                >
                  <div className="text-zinc-200">{h.title}</div>
                  {h.summary && (
                    <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{h.summary}</div>
                  )}
                  {h.sentiment != null && (
                    <span
                      className={`text-xs ${
                        h.sentiment < 0 ? 'text-red-400' : h.sentiment > 0 ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {h.sentiment < 0 ? 'Negative' : h.sentiment > 0 ? 'Positive' : 'Neutral'}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {(!riskSentiment?.headlines?.length || riskSentiment.headlines.length === 0) && !loading && (
              <div className="py-4 text-center text-zinc-500 text-sm">No headlines available</div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Collapsible: Address lookup + Compliance Escrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="shrink-0"
      >
        <Card className="bg-zinc-900/80 border-zinc-800 p-4">
          <button
            type="button"
            onClick={() => setExpandedLookup(!expandedLookup)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-display font-semibold text-white">Address Lookup & Compliance Escrow</h3>
            <span className="text-zinc-500 text-sm">{expandedLookup ? 'Collapse' : 'Expand'}</span>
          </button>
          <AnimatePresence>
            {expandedLookup && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                      className="font-mono flex-1 min-w-[200px] px-4 py-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                    />
                    <Button
                      onClick={() => handleLookup()}
                      className="bg-cyan-600 hover:bg-cyan-500"
                    >
                      Lookup
                    </Button>
                    {polIssuerAddress && (
                      <Button
                        variant="outline"
                        onClick={() => handleLookup(polIssuerAddress)}
                        className="border-amber-500/40 text-amber-400"
                      >
                        POL Issuer
                      </Button>
                    )}
                  </div>

                  {resolvedAddress && (xrpBalance !== null || polBalance !== null) && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded bg-zinc-800/50 text-center">
                        <div className="text-xs text-zinc-500">XRP</div>
                        <div className="font-mono text-white">{xrpBalance ?? '—'}</div>
                      </div>
                      <div className="p-2 rounded bg-zinc-800/50 text-center">
                        <div className="text-xs text-zinc-500">POL</div>
                        <div className="font-mono text-amber-400">{polBalance ?? '—'}</div>
                      </div>
                      <div className="p-2 rounded bg-zinc-800/50 text-center">
                        <div className="text-xs text-zinc-500">RLUSD</div>
                        <div className="font-mono text-emerald-400">{rlusdBalance ?? '—'}</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-zinc-500 mb-2">Compliance Escrow</div>
                    <div className="flex gap-2 flex-wrap items-end">
                      <input
                        type="text"
                        placeholder="Recipient"
                        value={escrowForm.recipient}
                        onChange={(e) => setEscrowForm((f) => ({ ...f, recipient: e.target.value }))}
                        className="font-mono w-40 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Amount"
                        value={escrowForm.amount}
                        onChange={(e) => setEscrowForm((f) => ({ ...f, amount: e.target.value }))}
                        className="font-mono w-20 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                      />
                      <select
                        value={escrowForm.currency}
                        onChange={(e) => setEscrowForm((f) => ({ ...f, currency: e.target.value }))}
                        className="font-mono px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                      >
                        <option value="XRP">XRP</option>
                        <option value="POL">POL</option>
                      </select>
                      <Button
                        onClick={handleCreateEscrow}
                        disabled={escrowSubmitting || !escrowForm.recipient || !escrowForm.amount}
                        className="bg-cyan-600 hover:bg-cyan-500"
                      >
                        {escrowSubmitting ? 'Creating…' : 'Create'}
                      </Button>
                    </div>
                    {escrowError && <p className="text-red-400 text-sm mt-1">{escrowError}</p>}
                    {escrows.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {escrows.map((e, i) => (
                          <div
                            key={i}
                            className="text-xs font-mono py-1 px-2 rounded bg-zinc-800/50"
                          >
                            Seq {e.sequence} → {typeof e.amount === 'object' ? e.amount?.value : e.amount}{' '}
                            {typeof e.amount === 'object' ? e.amount?.currency : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Transaction Monitor (when address resolved) */}
      {resolvedAddress && transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 min-h-0 flex flex-col"
        >
          <Card className="bg-zinc-900/80 border-zinc-800 p-4 flex-1 min-h-[200px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white">Transaction Monitor</h3>
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                {transactions.filter((t) => t.riskScore >= 70).length} Flagged
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs text-zinc-400 pb-2">Hash</th>
                    <th className="text-left text-xs text-zinc-400 pb-2">From</th>
                    <th className="text-left text-xs text-zinc-400 pb-2">To</th>
                    <th className="text-right text-xs text-zinc-400 pb-2">Amount</th>
                    <th className="text-left text-xs text-zinc-400 pb-2">Currency</th>
                    <th className="text-center text-xs text-zinc-400 pb-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 text-sm font-mono text-zinc-300">{tx.hash?.slice(0, 12)}...</td>
                      <td className="py-2 text-sm font-mono text-zinc-400">{tx.from?.slice(0, 12)}...</td>
                      <td className="py-2 text-sm font-mono text-zinc-400">{tx.to?.slice(0, 12)}...</td>
                      <td className="py-2 text-sm font-mono text-white text-right">{tx.amount}</td>
                      <td className="py-2">
                        <Badge
                          variant="outline"
                          className={
                            tx.currency === 'POL'
                              ? 'bg-amber-500/10 text-amber-400'
                              : tx.currency === 'XRP'
                                ? 'bg-cyan-500/10 text-cyan-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                          }
                        >
                          {tx.currency}
                        </Badge>
                      </td>
                      <td className="py-2 text-center">
                        <span
                          className={`inline-flex w-10 h-5 rounded text-xs font-semibold ${
                            tx.riskScore >= 70 ? 'bg-red-500/10 text-red-500' :
                            tx.riskScore >= 40 ? 'bg-orange-500/10 text-orange-500' :
                            'bg-green-500/10 text-green-500'
                          }`}
                        >
                          {tx.riskScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
