import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Mock XRP and stablecoin price data
const generatePriceData = () => {
  const data = [];
  const baseXRP = 0.52;
  const baseUSDC = 1.0;
  const baseUSDT = 0.9999;
  
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i}:00`,
      XRP: baseXRP + (Math.random() - 0.5) * 0.02,
      USDC: baseUSDC + (Math.random() - 0.5) * 0.001,
      USDT: baseUSDT + (Math.random() - 0.5) * 0.0008,
      volume: Math.floor(Math.random() * 5000000) + 2000000,
    });
  }
  return data;
};

const MOCK_TRANSACTIONS = [
  { 
    id: 'TX001', 
    from: 'rN7n...8K4c', 
    to: 'rPEP...Tz4F', 
    amount: 125000, 
    currency: 'USDC', 
    status: 'flagged', 
    reason: 'Sanctioned counterparty',
    timestamp: '2026-02-06 14:23:15',
    riskScore: 95
  },
  { 
    id: 'TX002', 
    from: 'rKiC...9mR2', 
    to: 'rDsb...3xYz', 
    amount: 89500, 
    currency: 'XRP', 
    status: 'approved', 
    reason: 'Compliance verified',
    timestamp: '2026-02-06 14:22:48',
    riskScore: 12
  },
  { 
    id: 'TX003', 
    from: 'rHb9...4nK8', 
    to: 'rLHzB...mM9p', 
    amount: 245000, 
    currency: 'USDT', 
    status: 'reviewing', 
    reason: 'High-risk jurisdiction',
    timestamp: '2026-02-06 14:21:33',
    riskScore: 68
  },
  { 
    id: 'TX004', 
    from: 'rN7n...8K4c', 
    to: 'rPEP...Tz4F', 
    amount: 56700, 
    currency: 'USDC', 
    status: 'flagged', 
    reason: 'Belarus sanctions',
    timestamp: '2026-02-06 14:20:12',
    riskScore: 89
  },
  { 
    id: 'TX005', 
    from: 'rQaZ...7vC4', 
    to: 'rMnO...1dL3', 
    amount: 178300, 
    currency: 'XRP', 
    status: 'approved', 
    reason: 'Standard processing',
    timestamp: '2026-02-06 14:19:44',
    riskScore: 8
  },
];

export function XRPDashboard() {
  const [priceData, setPriceData] = useState(generatePriceData());
  const [selectedCurrency, setSelectedCurrency] = useState<'XRP' | 'USDC' | 'USDT'>('XRP');

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData(generatePriceData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentXRP = priceData[priceData.length - 1].XRP;
  const previousXRP = priceData[priceData.length - 2].XRP;
  const xrpChange = ((currentXRP - previousXRP) / previousXRP) * 100;

  const currentUSDC = priceData[priceData.length - 1].USDC;
  const currentUSDT = priceData[priceData.length - 1].USDT;

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-zinc-950">
      {/* Currency Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-zinc-400 mb-1">XRP/USD</div>
              <div className="text-2xl font-bold text-white">${currentXRP.toFixed(4)}</div>
              <div className={`flex items-center gap-1 text-sm mt-1 ${xrpChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {xrpChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(xrpChange).toFixed(2)}%
              </div>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-zinc-400 mb-1">USDC/USD</div>
              <div className="text-2xl font-bold text-white">${currentUSDC.toFixed(4)}</div>
              <div className="text-sm text-zinc-400 mt-1">Stable</div>
            </div>
            <div className="bg-green-500/10 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-zinc-400 mb-1">USDT/USD</div>
              <div className="text-2xl font-bold text-white">${currentUSDT.toFixed(4)}</div>
              <div className="text-sm text-zinc-400 mt-1">Stable</div>
            </div>
            <div className="bg-yellow-500/10 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Price Chart */}
      <Card className="bg-zinc-900 border-zinc-800 p-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">XRP Ledger Price Feed</h3>
            <p className="text-xs text-zinc-400">24-hour benchmark data</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedCurrency('XRP')}
              className={`px-3 py-1 rounded text-xs ${selectedCurrency === 'XRP' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            >
              XRP
            </button>
            <button 
              onClick={() => setSelectedCurrency('USDC')}
              className={`px-3 py-1 rounded text-xs ${selectedCurrency === 'USDC' ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            >
              USDC
            </button>
            <button 
              onClick={() => setSelectedCurrency('USDT')}
              className={`px-3 py-1 rounded text-xs ${selectedCurrency === 'USDT' ? 'bg-yellow-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            >
              USDT
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={priceData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={selectedCurrency === 'XRP' ? '#3b82f6' : selectedCurrency === 'USDC' ? '#22c55e' : '#eab308'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={selectedCurrency === 'XRP' ? '#3b82f6' : selectedCurrency === 'USDC' ? '#22c55e' : '#eab308'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="time" stroke="#71717a" style={{ fontSize: '12px' }} />
            <YAxis stroke="#71717a" style={{ fontSize: '12px' }} domain={['dataMin - 0.001', 'dataMax + 0.001']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Area 
              type="monotone" 
              dataKey={selectedCurrency} 
              stroke={selectedCurrency === 'XRP' ? '#3b82f6' : selectedCurrency === 'USDC' ? '#22c55e' : '#eab308'} 
              fill="url(#colorPrice)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Transaction Monitor */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Real-Time XRP Ledger Transactions</h3>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            {MOCK_TRANSACTIONS.filter(t => t.status === 'flagged').length} Flagged
          </Badge>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs text-zinc-400 pb-2">TX ID</th>
                <th className="text-left text-xs text-zinc-400 pb-2">From</th>
                <th className="text-left text-xs text-zinc-400 pb-2">To</th>
                <th className="text-right text-xs text-zinc-400 pb-2">Amount</th>
                <th className="text-left text-xs text-zinc-400 pb-2">Currency</th>
                <th className="text-center text-xs text-zinc-400 pb-2">Risk</th>
                <th className="text-left text-xs text-zinc-400 pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-3 text-sm text-zinc-300 font-mono">{tx.id}</td>
                  <td className="py-3 text-sm text-zinc-400 font-mono">{tx.from}</td>
                  <td className="py-3 text-sm text-zinc-400 font-mono">{tx.to}</td>
                  <td className="py-3 text-sm text-white text-right">${tx.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-xs">
                      {tx.currency}
                    </Badge>
                  </td>
                  <td className="py-3 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-6 rounded text-xs font-semibold ${
                      tx.riskScore >= 70 ? 'bg-red-500/10 text-red-500' :
                      tx.riskScore >= 40 ? 'bg-orange-500/10 text-orange-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {tx.riskScore}
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        tx.status === 'flagged' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        tx.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}
                    >
                      {tx.status === 'flagged' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {tx.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

