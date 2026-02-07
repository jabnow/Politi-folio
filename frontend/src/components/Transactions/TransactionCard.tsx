import type { Transaction } from '../../types/index.js'
import { formatCurrency, formatDate } from '../../utils/formatters.js'
import { RiskBadge } from './RiskBadge.js'

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  return (
    <article>
      <header>
        <RiskBadge score={transaction.riskScore ?? 0} />
        <span>{transaction.hash.slice(0, 12)}...</span>
      </header>
      <p>
        {transaction.sender} → {transaction.receiver}
      </p>
      <p>{formatCurrency(transaction.amount, transaction.currency)}</p>
      <footer>{formatDate(transaction.timestamp)}</footer>
    </article>
  )
}
