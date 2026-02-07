/**
 * Backend API calls
 */

const API_BASE = '/api'

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export async function fetchTransactions() {
  const res = await fetch(`${API_BASE}/reconciliation`)
  if (!res.ok) throw new Error('Failed to fetch transactions')
  return res.json()
}

export async function fetchDecisions() {
  const res = await fetch(`${API_BASE}/decisions`)
  if (!res.ok) throw new Error('Failed to fetch decisions')
  return res.json()
}
