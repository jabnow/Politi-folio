/**
 * Mock geopolitical events for demo - matches frontend EventFeed format
 */
export interface GeopoliticalEvent {
  id: number
  timestamp: string
  type: 'sanctions' | 'trade' | 'policy' | 'regulation' | 'political' | 'compliance'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  country: string
  affectedTransactions: number
  source: string
}

export function getEventsMock(): GeopoliticalEvent[] {
  const now = new Date()
  const ts = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 19)
  return [
    {
      id: 1,
      timestamp: ts(now),
      type: 'sanctions',
      severity: 'CRITICAL',
      title: 'New EU Sanctions on Russian Energy Sector',
      description: 'European Union announces comprehensive sanctions targeting Russian energy companies. All transactions with listed entities must be frozen immediately.',
      country: 'Russia',
      affectedTransactions: 125,
      source: 'EU Official Journal',
    },
    {
      id: 2,
      timestamp: ts(new Date(now.getTime() - 5 * 60000)),
      type: 'trade',
      severity: 'HIGH',
      title: 'Belarus Trade Restrictions Extended',
      description: 'US Treasury extends trade restrictions on Belarus financial sector for additional 6 months. Enhanced due diligence required.',
      country: 'Belarus',
      affectedTransactions: 45,
      source: 'OFAC',
    },
    {
      id: 3,
      timestamp: ts(new Date(now.getTime() - 11 * 60000)),
      type: 'regulation',
      severity: 'MEDIUM',
      title: 'ECB Updates AML Requirements',
      description: 'European Central Bank releases updated anti-money laundering guidelines for cross-border transactions exceeding €10,000.',
      country: 'EU',
      affectedTransactions: 234,
      source: 'ECB',
    },
    {
      id: 4,
      timestamp: ts(new Date(now.getTime() - 18 * 60000)),
      type: 'policy',
      severity: 'MEDIUM',
      title: 'Fed Maintains Interest Rates',
      description: 'Federal Reserve maintains interest rates at 5.25-5.50%. Statement emphasizes continued focus on inflation management.',
      country: 'USA',
      affectedTransactions: 312,
      source: 'Federal Reserve',
    },
    {
      id: 5,
      timestamp: ts(new Date(now.getTime() - 25 * 60000)),
      type: 'political',
      severity: 'HIGH',
      title: 'Political Instability in Brazil',
      description: 'Protests escalate in São Paulo. Increased country risk assessment recommended for Brazilian counterparties.',
      country: 'Brazil',
      affectedTransactions: 156,
      source: 'Reuters',
    },
  ]
}
