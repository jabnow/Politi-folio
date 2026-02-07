import { useTransactions } from '../../hooks/useTransactions.js'
import { RiskBadge } from '../Transactions/RiskBadge.js'

export function RiskMonitor() {
  const { transactions } = useTransactions()

  const highRisk = transactions.filter((t) => (t.riskScore ?? 0) >= 70)

  return (
    <section>
      <h2>Risk Monitor</h2>
      <p>High-risk transactions: {highRisk.length}</p>
      {highRisk.length > 0 && (
        <ul>
          {highRisk.map((t) => (
            <li key={t.id}>
              {t.hash} <RiskBadge score={t.riskScore ?? 0} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
