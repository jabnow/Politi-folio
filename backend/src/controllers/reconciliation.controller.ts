import type { Request, Response } from 'express';
import { XrplService } from '../services/xrpl.service';
import { RlusdService } from '../services/rlusd.service'; // new

const xrpl = new XrplService();
const rlusd = new RlusdService();

export async function getReconciliation(req: Request, res: Response) {
  try {
    const { walletAddress } = req.params;
    const txs = await xrpl.monitorTransactions(walletAddress);
    const xrpBalance = await xrpl.getBalance(walletAddress);
    const rlusdBalance = await rlusd.getRlusdBalance(walletAddress);

    // Calculate risk dynamically based on risk scores
    const highestRiskScore = Math.max(...txs.map(t => t.riskScore));
    let suggestedRebalance = 'Portfolio stable';
    if (highestRiskScore > 70) {
      suggestedRebalance = 'High risk detected → consider moving to RLUSD';
    } else if (highestRiskScore > 50) {
      suggestedRebalance = 'Medium risk detected → consider diversifying';
    }

    res.json({
      transactions: txs,
      balances: { XRP: xrpBalance, RLUSD: rlusdBalance },
      suggestedRebalance,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

// New endpoint: trigger rebalance (send small RLUSD amount as demo)
export async function postRebalance(req: Request, res: Response) {
  try {
    const { walletAddress, destAddress, amount = '10' } = req.body;
    const fromSeed = process.env.DEMO_WALLET_SEED; // WARNING: demo only — never in prod!
    if (!fromSeed) throw new Error('No signer configured');

    const result = await rlusd.sendRlusd(fromSeed, destAddress || walletAddress, amount);

    res.json({
      success: true,
      txHash: result.hash,
      message: `Rebalanced ${amount} RLUSD to safe holding`,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
