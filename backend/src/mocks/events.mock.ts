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
    {
      id: 6,
      timestamp: ts(new Date(now.getTime() - 33 * 60000)),
      type: 'trade',
      severity: 'CRITICAL',
      title: 'US Threatens 100% Tariffs on Taiwan-Made Semiconductors',
      description: 'Tariff threat raises supply chain fears for TSMC customers. Apple, NVIDIA, AMD, Qualcomm face potential 15%+ chip price increases.',
      country: 'Taiwan',
      affectedTransactions: 412,
      source: 'Reuters',
    },
    {
      id: 7,
      timestamp: ts(new Date(now.getTime() - 40 * 60000)),
      type: 'regulation',
      severity: 'HIGH',
      title: 'China Launches Antitrust Probes on NVIDIA, Google',
      description: 'Beijing revives antitrust investigations in response to US tariffs. Intel may face similar probe.',
      country: 'China',
      affectedTransactions: 189,
      source: 'Ars Technica',
    },
    {
      id: 8,
      timestamp: ts(new Date(now.getTime() - 47 * 60000)),
      type: 'policy',
      severity: 'HIGH',
      title: 'US CHIPS Act Review Delays Intel, TSMC, Samsung Subsidies',
      description: 'Administration renegotiating subsidy conditions. Disbursements to major chipmakers delayed.',
      country: 'USA',
      affectedTransactions: 78,
      source: 'Reuters',
    },
    {
      id: 9,
      timestamp: ts(new Date(now.getTime() - 53 * 60000)),
      type: 'trade',
      severity: 'MEDIUM',
      title: 'TSMC Signals 15% Semiconductor Price Increase to Pass Tariff Costs',
      description: 'Advanced wafer pricing could rise. NVIDIA, Apple, AMD among affected customers.',
      country: 'Taiwan',
      affectedTransactions: 256,
      source: 'TechSpot',
    },
    {
      id: 10,
      timestamp: ts(new Date(now.getTime() - 60 * 60000)),
      type: 'political',
      severity: 'MEDIUM',
      title: 'Taiwan Legacy Chip Sector Faces China Competition',
      description: 'Chinese foundries Nexchip, SMIC, Hua Hong gaining share in mature-node chips. Taiwan firms under pricing pressure.',
      country: 'Taiwan',
      affectedTransactions: 134,
      source: 'Reuters',
    },
  ]
}
