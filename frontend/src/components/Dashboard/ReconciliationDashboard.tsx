import { useTransactions } from '../../hooks/useTransactions.js'
import { TransactionList } from '../Transactions/TransactionList.js'

export function ReconciliationDashboard() {
  const { transactions, loading, error } = useTransactions()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <section>
      <h2>Reconciliation Dashboard</h2>
      <TransactionList transactions={transactions} />
    </section>
  )
}
