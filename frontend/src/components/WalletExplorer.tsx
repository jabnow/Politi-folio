/**
 * Wallet Explorer
 * Shows the issuer and destination wallets with their balances and recent transactions
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';

interface WalletInfo {
  address: string;
  label: string;
  role: string;
  xrpBalance?: string;
  polBalance?: string;
  description: string;
}

export function WalletExplorer() {
  const [copied, setCopied] = useState<string | null>(null);

  const wallets: WalletInfo[] = [
    {
      address: 'rpRnHQ2j8xkr4RKbZ6LfzPCFDMLySNEtwm',
      label: 'Issuer Wallet',
      role: 'POL Token Creator',
      xrpBalance: '9.999785',
      polBalance: 'Unlimited (Issuer)',
      description:
        'Controls the supply of POL tokens. Can mint, transfer, and execute clawback for compliance.',
    },
    {
      address: 'rMAsbhhnkswS8woL46wViDd8BdkK9MMzdK',
      label: 'Destination Wallet',
      role: 'Demo Account',
      xrpBalance: '9.999786',
      polBalance: '1,000,000',
      description:
        'Receives POL tokens from issuer. Demonstrates how users hold and manage POL in their wallets.',
    },
  ];

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">XRPL Testnet Wallets</h2>
        <p className="text-slate-300">
          Live demonstration wallets showing POL token issuance and transfer on XRPL Testnet
        </p>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {wallets.map((wallet, idx) => (
          <Card key={idx} className="border-slate-700 p-6 hover:border-purple-500/30 transition-colors">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{wallet.label}</h3>
                  <Badge variant="outline" className="mt-2">
                    {wallet.role}
                  </Badge>
                </div>
                <div className="text-right">
                  {idx === 0 ? (
                    <div className="text-yellow-400 text-2xl">⚙️</div>
                  ) : (
                    <div className="text-blue-400 text-2xl">👤</div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300">{wallet.description}</p>

              {/* Address */}
              <div className="bg-slate-800/50 rounded p-3">
                <div className="text-xs text-slate-400 mb-2">Wallet Address</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-slate-300 break-all flex-1">{wallet.address}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(wallet.address)}
                    className="flex-shrink-0"
                  >
                    {copied === wallet.address ? (
                      <span className="text-green-400 text-xs">✓</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-900/20 border border-blue-800 rounded p-3">
                  <div className="text-xs text-slate-400">XRP Balance</div>
                  <div className="text-lg font-bold text-blue-400 mt-1">{wallet.xrpBalance}</div>
                  <div className="text-xs text-slate-500">Native</div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-800 rounded p-3">
                  <div className="text-xs text-slate-400">POL Balance</div>
                  <div className="text-lg font-bold text-yellow-400 mt-1">
                    {wallet.polBalance === 'Unlimited (Issuer)'
                      ? '∞'
                      : Number(wallet.polBalance?.replace(/,/g, '')).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">Custom Token</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(`https://testnet.xrpl.org/accounts/${wallet.address}`, '_blank')
                  }
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on XRPL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://testnet.xrpl.org/accounts/${wallet.address}?tab=transactions`,
                      '_blank'
                    )
                  }
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Transactions
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How POL Token Transfer Works</h3>
        <div className="space-y-3">
          <div className="flex gap-4">
            <div className="text-2xl">1️⃣</div>
            <div>
              <h4 className="font-semibold text-white text-sm">Issuer Mints POL</h4>
              <p className="text-xs text-slate-300 mt-1">
                Issuer wallet creates POL tokens (similar to printing currency)
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">2️⃣</div>
            <div>
              <h4 className="font-semibold text-white text-sm">Destination Trusts Issuer</h4>
              <p className="text-xs text-slate-300 mt-1">
                Destination wallet creates a trust line (permission to receive POL)
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">3️⃣</div>
            <div>
              <h4 className="font-semibold text-white text-sm">POL Transfer Executed</h4>
              <p className="text-xs text-slate-300 mt-1">
                Issuer sends POL to destination → Recorded permanently on ledger
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">4️⃣</div>
            <div>
              <h4 className="font-semibold text-white text-sm">QR Code Generated</h4>
              <p className="text-xs text-slate-300 mt-1">
                Transaction hash becomes QR code → Judge can scan to verify on XRPL.org
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Features */}
      <Card className="border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Why This Matters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex gap-3">
            <span className="text-green-400 flex-shrink-0">✓</span>
            <div>
              <h4 className="font-semibold text-white">Transparent</h4>
              <p className="text-slate-400 mt-1">All transactions public on blockchain</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 flex-shrink-0">✓</span>
            <div>
              <h4 className="font-semibold text-white">Immutable</h4>
              <p className="text-slate-400 mt-1">Cannot be changed or deleted</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 flex-shrink-0">✓</span>
            <div>
              <h4 className="font-semibold text-white">Verifiable</h4>
              <p className="text-slate-400 mt-1">Anyone can audit on XRPL.org</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default WalletExplorer;
