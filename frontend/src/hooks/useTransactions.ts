/**
 * Transaction data hook
 */
import { useEffect, useState } from 'react'
import { fetchTransactions } from '../services/api.service.js'
import type { Transaction } from '../types/index.js'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { transactions, loading, error }
}
