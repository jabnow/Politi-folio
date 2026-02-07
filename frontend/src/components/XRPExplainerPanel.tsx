/**
 * XRP Explainer Panel
 * Judge-friendly explanation of how XRP and POL tokens work in the system
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  Coins,
  Zap,
  Lock,
  Share2,
  CheckCircle,
  RefreshCw,
  Shield,
  Globe,
  AlertTriangle,
} from 'lucide-react';

interface XRPExplainSection {
  title: string;
  icon: React.ReactNode;
  content: string;
  details: string[];
}

export function XRPExplainerPanel() {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const sections: XRPExplainSection[] = [
    {
      title: 'What is XRP?',
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      content: 'XRP is a digital currency on the XRP Ledger (XRPL) blockchain. It operates like a decentralized bank - recording transactions permanently and instantly.',
      details: [
        '✓ Decentralized: No single authority controls it',
        '✓ Instant: Transactions settle in 3-5 seconds',
        '✓ Cheap: Minimal fees (fractions of a cent)',
        '✓ Testnet: Free testing environment (no real money)',
        '✓ Open Ledger: All transactions publicly verifiable',
        '✓ Consensus: 80+ independent validators confirm transactions',
      ],
    },
    {
      title: 'What is POL?',
      icon: <Coins className="w-5 h-5 text-yellow-400" />,
      content: 'POL (Politifolio) is a custom token ISSUED ON TOP OF the XRP Ledger. Think of it as a special "currency" for rewarding accurate geopolitical intelligence.',
      details: [
        '✓ Custom Token: We created it using XRPL infrastructure',
        '✓ Incentive Mechanism: Users earn POL for accurate reporting',
        '✓ Limited Supply: Will have maximum cap (prevents inflation)',
        '✓ Real Value: Can be staked, transferred, traded',
        '✓ Backed by XRPL: Security from blockchain immutability',
        '✓ Clawback Enabled: Can be reclaimed if sanctions detected',
      ],
    },
    {
      title: 'How Does XRP Enable POL?',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      content: 'XRP provides the infrastructure layer. POL lives ON TOP of XRP through "trust lines" - permission slips that allow accounts to hold POL tokens.',
      details: [
        '1. Wallet Setup: Your wallet gets funded with small XRP amount',
        '2. Trust Line: Destination wallet gives permission to issuer to send POL',
        '3. Issuer Creates: We mint POL and send to destination wallet',
        '4. Ownership: You now own POL tokens, stored on XRPL permanently',
        '5. Transfers: Send POL to others → recorded on blockchain',
        '6. Verification: Anyone can verify ownership on xrpl.org',
      ],
    },
    {
      title: 'Trust Lines Explained',
      icon: <Lock className="w-5 h-5 text-green-400" />,
      content: 'Trust lines are security gates. They prevent spam and give users control over which tokens they accept.',
      details: [
        '✓ Why Needed: Protects your wallet from unwanted tokens',
        '✓ How It Works: You approve maximum POL amount to hold',
        '✓ Two-Way: Issuer starts transfer → Destination accepts via trust line',
        '✓ Immutable: Once created, it lives on ledger forever',
        '✓ In Practice: First user to submit report auto-creates trust line',
        '✓ Safety: No one can force tokens on you without permission',
      ],
    },
    {
      title: 'Escrow (Time-Locked Stakes)',
      icon: <Lock className="w-5 h-5 text-orange-400" />,
      content: 'Escrow locks tokens for a specific time period. Your POL stake is locked while voting happens, then released with rewards.',
      details: [
        '✓ How It Works: You submit report + lock 10 POL in escrow',
        '✓ Duration: Locked for 2 weeks (voting period)',
        '✓ Cannot Access: You cannot spend locked POL during voting',
        '✓ Release Trigger: Report gets verified → Escrow releases + rewards',
        '✓ Enforcement: XRPL ensures automatic release when conditions met',
        '✓ Protection: Prevents "flash loan" cheating strategies',
      ],
    },
    {
      title: 'Clawback (Compliance)',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      content: 'Clawback lets us reclaim POL tokens if sanctions violations are detected. This enforces compliance automatically.',
      details: [
        '✓ Trigger: Sanctions database hits detected on country pair',
        '✓ Action: System automatically reclaims user\'s POL stake',
        '✓ Prevention: Prevents financing of sanctioned entities',
        '✓ Permanent: User loses stake incentivizing compliance',
        '✓ XRPL Feature: Built-in to XRPL specification',
        '✓ Regulatory: Proves compliance to regulators',
      ],
    },
    {
      title: 'Your Wallets in Action',
      icon: <Share2 className="w-5 h-5 text-indigo-400" />,
      content: 'The system uses two wallets on XRPL Testnet to demonstrate token creation and transfer.',
      details: [
        '📍 Issuer Wallet: rpRnHQ2j8xkr4RKbZ6LfzPCFDMLySNEtwm (creates POL)',
        '📍 Destination Wallet: rMAsbhhnkswS8woL46wViDd8BdkK9MMzdK (receives POL)',
        '🔗 Network: XRPL Testnet (free, for testing)',
        '💰 Initial XRP: Both funded from testnet faucet',
        '📜 TX IDs: Every transaction gets unique hash on ledger',
        '✅ Verification: Scan QR code to see on xrpl.org testnet explorer',
      ],
    },
    {
      title: 'How Geopolitical Intelligence Uses This',
      icon: <CheckCircle className="w-5 h-5 text-teal-400" />,
      content: 'The system combines intelligence gathering with token incentives to crowdsource accurate geopolitical data.',
      details: [
        '1. Submit: Analyst submits report + stakes POL',
        '2. Assess: AI + news + sanctions data analyzed',
        '3. Vote: Community votes with reputation weighting',
        '4. Verify: If 66%+ votes Support → Report VERIFIED',
        '5. Reward: POL distributed to successful supporters',
        '6. Immutable: Full history on XRPL ledger forever',
      ],
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">XRP & POL Token System</h2>
        <p className="text-slate-300">
          How blockchain technology powers crowdsourced geopolitical intelligence
        </p>
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-900/20 border-blue-800 p-4">
          <div className="flex items-start gap-3">
            <Globe className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">XRP Ledger</h4>
              <p className="text-xs text-slate-300 mt-1">Decentralized infrastructure supporting token transfers</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-900/20 border-yellow-800 p-4">
          <div className="flex items-start gap-3">
            <Coins className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">POL Token</h4>
              <p className="text-xs text-slate-300 mt-1">Custom currency for intelligence rewards</p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-900/20 border-purple-800 p-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Testnet Live</h4>
              <p className="text-xs text-slate-300 mt-1">Transactions verified on real blockchain</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={`cursor-pointer transition-all border ${
                expandedSection === idx
                  ? 'border-purple-500/50 bg-purple-900/20'
                  : 'border-slate-700 hover:border-purple-400/30'
              }`}
              onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {section.icon}
                    <div>
                      <h3 className="font-semibold text-white">{section.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{section.content}</p>
                    </div>
                  </div>
                  {expandedSection === idx ? (
                    <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0 ml-2" />
                  )}
                </div>

                {/* Expanded Details */}
                {expandedSection === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-700"
                  >
                    <div className="space-y-2">
                      {section.details.map((detail, detailIdx) => (
                        <div key={detailIdx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-purple-400 flex-shrink-0">→</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* External Link for Verification */}
                    {idx === 6 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            'https://testnet.xrpl.org/accounts/rpRnHQ2j8xkr4RKbZ6LfzPCFDMLySNEtwm',
                            '_blank'
                          );
                        }}
                      >
                        View Issuer Wallet on Testnet
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 p-6 text-center">
        <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">Everything is Verifiable</h3>
        <p className="text-sm text-slate-300 mb-4">
          All POL transactions are recorded on the XRPL Testnet blockchain. No central authority needed.
        </p>
        <Button
          variant="outline"
          onClick={() => window.open('https://xrpl.org/', '_blank')}
        >
          Learn More at xrpl.org
        </Button>
      </Card>
    </div>
  );
}

export default XRPExplainerPanel;
