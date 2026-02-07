export interface Transaction {
  id: string
  hash: string
  sender: string
  receiver: string
  amount: string
  currency: string
  timestamp: string
  riskScore?: number
}

export interface GeopoliticalEvent {
  id: string
  title: string
  region: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskAssessment {
  score: number
  level: RiskLevel
  factors: string[]
}
