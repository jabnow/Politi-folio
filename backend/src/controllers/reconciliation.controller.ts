import type { Request, Response } from 'express';
import { XrplService } from '../services/xrpl.service';

// Initialize the XRPL service
const xrplService = new XrplService();

export async function getReconciliation(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { walletAddress } = req.params;
    const transactions = await xrplService.monitorTransactions(walletAddress);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}
