/**
 * Mock reconciliation tasks for demo
 */
export interface ReconciliationTask {
  id: string
  eventType: string
  triggeredBy: string
  status: 'processing' | 'completed' | 'requires_review' | 'failed'
  transactionsScanned: number
  transactionsFlagged: number
  transactionsReconciled: number
  startTime: string
  completionTime?: string
  estimatedSavings: number
  assignedTo?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export function getReconciliationTasksMock(): ReconciliationTask[] {
  return [
    {
      id: 'REC-001',
      eventType: 'EU Sanctions Update',
      triggeredBy: 'Automated Policy Monitor',
      status: 'completed',
      transactionsScanned: 1247,
      transactionsFlagged: 125,
      transactionsReconciled: 125,
      startTime: '2026-02-06 14:23:00',
      completionTime: '2026-02-06 14:23:45',
      estimatedSavings: 3200,
      assignedTo: 'AI Engine',
      priority: 'critical',
    },
    {
      id: 'REC-002',
      eventType: 'Belarus Trade Restrictions',
      triggeredBy: 'OFAC Alert',
      status: 'completed',
      transactionsScanned: 892,
      transactionsFlagged: 45,
      transactionsReconciled: 45,
      startTime: '2026-02-06 14:18:00',
      completionTime: '2026-02-06 14:18:32',
      estimatedSavings: 1800,
      assignedTo: 'AI Engine',
      priority: 'high',
    },
    {
      id: 'REC-003',
      eventType: 'ECB AML Guidelines Update',
      triggeredBy: 'Regulatory Feed',
      status: 'processing',
      transactionsScanned: 3421,
      transactionsFlagged: 234,
      transactionsReconciled: 156,
      startTime: '2026-02-06 14:12:00',
      estimatedSavings: 2400,
      priority: 'medium',
    },
    {
      id: 'REC-004',
      eventType: 'Country Risk Update - Brazil',
      triggeredBy: 'Geopolitical Monitor',
      status: 'requires_review',
      transactionsScanned: 567,
      transactionsFlagged: 156,
      transactionsReconciled: 142,
      startTime: '2026-02-06 13:58:00',
      estimatedSavings: 1200,
      assignedTo: 'Compliance Team',
      priority: 'high',
    },
    {
      id: 'REC-005',
      eventType: 'Routine Daily Reconciliation',
      triggeredBy: 'Scheduled Task',
      status: 'completed',
      transactionsScanned: 8945,
      transactionsFlagged: 23,
      transactionsReconciled: 23,
      startTime: '2026-02-06 09:00:00',
      completionTime: '2026-02-06 09:02:15',
      estimatedSavings: 4500,
      assignedTo: 'AI Engine',
      priority: 'low',
    },
  ]
}
