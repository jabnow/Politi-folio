import { Client, Wallet, dropsToXrp } from 'xrpl';
import dotenv from 'dotenv';

dotenv.config();

export class XrplService {
  private client: Client;

  constructor() {
    const url = process.env.XRPL_NODE_URL || 'wss://s.altnet.rippletest.net:51233'; // testnet default
    this.client = new Client(url);
  }

  async connect() {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.client.isConnected()) await this.client.disconnect();
  }

  // ── Get XRP or issued currency balance ───────────────────────────────
  async getBalance(address: string, currency?: string, issuer?: string): Promise<string> {
    await this.connect();
    try {
      const resp = await this.client.request({
        command: 'account_lines',
        account: address,
        ledger_index: 'validated',
      });

      if (currency && issuer) {
        const line = resp.result.lines.find(
          (l) => l.currency === currency && l.account === issuer
        );
        return line ? line.balance : '0';
      }

      // Fallback to XRP
      const info = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated',
      });
      return dropsToXrp(info.result.account_data.Balance);
    } catch (err: any) {
      if (err.data?.error === 'actNotFound') return '0';
      throw err;
    }
  }

  // ── Monitor recent transactions + attach basic risk ──────────────────
  async monitorTransactions(address: string, limit = 50) {
    await this.connect();
    const resp = await this.client.request({
      command: 'account_tx',
      account: address,
      limit,
      forward: false,
      ledger_index_min: -1,
      ledger_index_max: -1,
    });

    return resp.result.transactions.map((entry: any) => {
      const tx = entry.tx || {};  // Safety check: ensures tx is defined
      let amountStr = '0';
      let currency = 'XRP';
      let delivered = null;

      if (tx.TransactionType === 'Payment') {
        if (typeof tx.Amount === 'string') {
          // XRP (drops)
          amountStr = dropsToXrp(tx.Amount);
          currency = 'XRP';
        } else if (tx.Amount && typeof tx.Amount === 'object') {
          // Issued currency
          amountStr = tx.Amount.value || '0';
          currency = tx.Amount.currency || 'Unknown';
        }

        // Sometimes DeliveredAmount appears in meta instead
        if (entry.meta && entry.meta.delivered_amount) {
          delivered = entry.meta.delivered_amount;
          if (typeof delivered === 'string') {
            amountStr = dropsToXrp(delivered);
          } else if (delivered?.value) {
            amountStr = delivered.value;
            currency = delivered.currency || currency;
          }
        }
      } else {
        // Non-Payment tx → show "—" or special label
        amountStr = '—';
        currency = tx.TransactionType || 'Other';
      }

      return {
        hash: tx.hash,
        ledger: entry.ledger_index,
        timestamp: tx.date ? new Date((tx.date + 946684800) * 1000).toISOString() : 'Unknown',
        from: tx.Account,
        to: tx.Destination,
        amount: amountStr,
        currency,
        riskScore: this.calculateRiskScore(amountStr, currency), // Dynamic risk score
      };
    });
  }

  // ── Calculate risk score based on transaction characteristics ──────────────────
  calculateRiskScore(amount: string, currency: string): number {
    const amountFloat = parseFloat(amount);
    let score = 20; // Default low risk

    if (currency !== 'XRP') {
      score = 60; // Custom token transactions are riskier
    }

    if (amountFloat > 1000) {
      score = 80; // High amount increases risk
    }

    return score;
  }

  // ── Send Payment (XRP, RLUSD, or your token) ─────────────────────────
  async sendPayment(
    fromWallet: Wallet,
    toAddress: string,
    amount: string,
    currency: string = 'XRP',
    issuer?: string
  ) {
    await this.connect();
    const txJson: any = {
      TransactionType: 'Payment',
      Account: fromWallet.address,
      Destination: toAddress,
      Amount: currency === 'XRP' ? amount : { value: amount, currency, issuer: issuer! },
    };

    const prepared = await this.client.autofill(txJson);
    const signed = fromWallet.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
      throw new Error(`Payment failed: ${result.result.meta.TransactionResult}`);
    }

    return {
      hash: result.result.hash,
      result: result.result.meta.TransactionResult,
    };
  }

  // Add more later: TrustSet, EscrowCreate, OfferCreate...
}
