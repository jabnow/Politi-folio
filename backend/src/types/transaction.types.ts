export interface Transaction {
  id: string
  hash: string
  sender: string
  receiver: string
  amount: string
  currency: string
  timestamp: Date
  riskScore?: number
}
