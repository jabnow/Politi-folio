/**
 * Mock geopolitical events for demo
 */
export interface GeopoliticalEvent {
  id: string
  title: string
  region: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
}

export function getEventsMock(): GeopoliticalEvent[] {
  return [
    {
      id: '1',
      title: 'Sample Event',
      region: 'EMEA',
      severity: 'medium',
      timestamp: new Date(),
    },
  ]
}
