/**
 * Mock AI decisions for demo
 */
export interface AIDecision {
  id: string
  transactionId: string
  counterparty: string
  country: string
  amount: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendation: 'APPROVE' | 'REVIEW' | 'REJECT' | 'FREEZE'
  reasoning: string[]
  complianceChecks: {
    sanctionsList: 'CLEAR' | 'FLAGGED'
    countryRisk: number
    transactionPattern: 'NORMAL' | 'SUSPICIOUS'
    regulatoryStatus: 'COMPLIANT' | 'REVIEW_REQUIRED'
  }
  confidence: number
  timestamp: string
}

export function getDecisionsMock(): AIDecision[] {
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
        'Recent EU sanctions announced 2026-02-05',
        'Transaction amount exceeds threshold for sanctioned entities',
      ],
      complianceChecks: {
        sanctionsList: 'FLAGGED',
        countryRisk: 95,
        transactionPattern: 'SUSPICIOUS',
        regulatoryStatus: 'REVIEW_REQUIRED',
      },
      confidence: 98,
      timestamp: '2026-02-06 14:23:15',
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
      timestamp: '2026-02-06 14:21:33',
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
      timestamp: '2026-02-06 14:22:48',
    },
  ]
}
