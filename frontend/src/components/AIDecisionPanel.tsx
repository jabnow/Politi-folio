import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { Brain, CheckCircle, XCircle, AlertTriangle, FileText, Globe, Shield } from 'lucide-react';
const Brain = () => <span>🧠</span>;
const CheckCircle = () => <span>✅</span>;
const XCircle = () => <span>❌</span>;
const AlertTriangle = () => <span>⚠️</span>;
const FileText = () => <span>📄</span>;
const Globe = () => <span>🌐</span>;
const Shield = () => <span>🛡️</span>;
import { motion } from 'framer-motion';

interface AIDecision {
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

const MOCK_DECISIONS: AIDecision[] = [
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
      'Recent EU sanctions announced 2026-02-05',
      'Transaction amount exceeds threshold for sanctioned entities'
    ],
    complianceChecks: {
      sanctionsList: 'FLAGGED',
      countryRisk: 95,
      transactionPattern: 'SUSPICIOUS',
      regulatoryStatus: 'REVIEW_REQUIRED'
    },
    confidence: 98,
    timestamp: '2026-02-06 14:23:15'
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
      'Unable to verify beneficial ownership'
    ],
    complianceChecks: {
      sanctionsList: 'FLAGGED',
      countryRisk: 78,
      transactionPattern: 'SUSPICIOUS',
      regulatoryStatus: 'REVIEW_REQUIRED'
    },
    confidence: 92,
    timestamp: '2026-02-06 14:21:33'
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
      'All compliance checks passed'
    ],
    complianceChecks: {
      sanctionsList: 'CLEAR',
      countryRisk: 8,
      transactionPattern: 'NORMAL',
      regulatoryStatus: 'COMPLIANT'
    },
    confidence: 96,
    timestamp: '2026-02-06 14:22:48'
  }
];

export function AIDecisionPanel() {
  const [selectedDecision, setSelectedDecision] = useState<AIDecision>(MOCK_DECISIONS[0]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'APPROVE': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECT': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'FREEZE': return <Shield className="w-5 h-5 text-red-600" />;
      case 'REVIEW': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="min-h-full flex flex-col lg:flex-row gap-4 p-4 bg-zinc-950 overflow-auto">
      {/* Decision Queue */}
      <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 lg:shrink">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-white">AI Decision Queue</h3>
          </div>
          
          <div className="space-y-2">
            {MOCK_DECISIONS.map((decision) => (
              <motion.div
                key={decision.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedDecision(decision)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedDecision.id === decision.id
                    ? 'bg-zinc-800 border border-zinc-700'
                    : 'bg-zinc-800/50 border border-transparent hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-mono text-zinc-300">{decision.transactionId}</span>
                  <Badge variant="outline" className={`text-xs ${getRiskColor(decision.riskLevel)}`}>
                    {decision.riskLevel}
                  </Badge>
                </div>
                <div className="text-xs text-zinc-400 mb-1">{decision.counterparty}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">${decision.amount.toLocaleString()}</span>
                  <div className="flex items-center gap-1">
                    {getRecommendationIcon(decision.recommendation)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="text-xs text-zinc-400 mb-3">Today's Analysis</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Reviewed</span>
              <span className="text-lg font-bold text-white">247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Approved</span>
              <span className="text-lg font-bold text-green-500">189</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Flagged</span>
              <span className="text-lg font-bold text-red-500">58</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Avg Confidence</span>
              <span className="text-lg font-bold text-purple-500">94%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Decision Details */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{selectedDecision.counterparty}</h2>
                <Badge variant="outline" className={`${getRiskColor(selectedDecision.riskLevel)}`}>
                  {selectedDecision.riskLevel} RISK
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {selectedDecision.country}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {selectedDecision.transactionId}
                </span>
                <span>${selectedDecision.amount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-zinc-400 mb-1">AI Confidence</div>
              <div className="text-3xl font-bold text-purple-500">{selectedDecision.confidence}%</div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className={`p-4 rounded-lg mb-6 border ${
            selectedDecision.recommendation === 'APPROVE' ? 'bg-green-500/5 border-green-500/20' :
            selectedDecision.recommendation === 'REJECT' ? 'bg-red-500/5 border-red-500/20' :
            selectedDecision.recommendation === 'FREEZE' ? 'bg-red-600/5 border-red-600/20' :
            'bg-orange-500/5 border-orange-500/20'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {getRecommendationIcon(selectedDecision.recommendation)}
              <span className="font-semibold text-white text-lg">
                RECOMMENDED ACTION: {selectedDecision.recommendation}
              </span>
            </div>
            <p className="text-sm text-zinc-300">
              {selectedDecision.recommendation === 'FREEZE' 
                ? 'Immediate action required. Transaction must be frozen and reported to compliance.'
                : selectedDecision.recommendation === 'REJECT'
                ? 'High risk detected. Transaction should be rejected and counterparty flagged.'
                : selectedDecision.recommendation === 'APPROVE'
                ? 'All compliance checks passed. Transaction can proceed normally.'
                : 'Manual review recommended before proceeding.'}
            </p>
          </div>

          {/* Reasoning */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              AI Analysis & Reasoning
            </h3>
            <div className="space-y-2">
              {selectedDecision.reasoning.map((reason, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 p-3 bg-zinc-800/50 rounded-lg"
                >
                  <div className="mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  </div>
                  <span className="text-sm text-zinc-300">{reason}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Compliance Checks */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Compliance Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="text-xs text-zinc-400 mb-1">Sanctions List</div>
                <div className={`text-lg font-semibold ${
                  selectedDecision.complianceChecks.sanctionsList === 'CLEAR' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {selectedDecision.complianceChecks.sanctionsList}
                </div>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="text-xs text-zinc-400 mb-1">Country Risk Score</div>
                <div className={`text-lg font-semibold ${
                  selectedDecision.complianceChecks.countryRisk < 30 ? 'text-green-500' :
                  selectedDecision.complianceChecks.countryRisk < 60 ? 'text-orange-500' : 'text-red-500'
                }`}>
                  {selectedDecision.complianceChecks.countryRisk}/100
                </div>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="text-xs text-zinc-400 mb-1">Transaction Pattern</div>
                <div className={`text-lg font-semibold ${
                  selectedDecision.complianceChecks.transactionPattern === 'NORMAL' ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {selectedDecision.complianceChecks.transactionPattern}
                </div>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="text-xs text-zinc-400 mb-1">Regulatory Status</div>
                <div className={`text-sm font-semibold ${
                  selectedDecision.complianceChecks.regulatoryStatus === 'COMPLIANT' ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {selectedDecision.complianceChecks.regulatoryStatus}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={selectedDecision.recommendation !== 'APPROVE'}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Transaction
          </Button>
          <Button 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={selectedDecision.recommendation === 'APPROVE'}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Transaction
          </Button>
          <Button className="bg-zinc-800 hover:bg-zinc-700 text-white">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}

