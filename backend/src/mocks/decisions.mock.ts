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

const ts = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 19)

export function getDecisionsMock(): AIDecision[] {
  const now = new Date()
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
  ]
}
