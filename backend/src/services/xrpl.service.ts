import { Client, Wallet, dropsToXrp, xrpToDrops } from 'xrpl';
import dotenv from 'dotenv';

dotenv.config();

/** Ripple epoch: seconds since Jan 1, 2000 00:00 UTC. Unix - 946684800 */
const RIPPLE_EPOCH_OFFSET = 946684800;

export class XrplService {
  private client: Client;
  private issuerWallet?: Wallet;
  private destinationWallet?: Wallet;

  constructor() {
    const url = process.env.XRPL_NODE_URL || 'wss://s.altnet.rippletest.net:51233'; // testnet default
    this.client = new Client(url);
    
    // Load wallets from .env if available
    if (process.env.GEO_PULSE_ISSUER_SEED) {
      this.issuerWallet = Wallet.fromSeed(process.env.GEO_PULSE_ISSUER_SEED);
    }
    if (process.env.DESTINATION_SEED) {
      this.destinationWallet = Wallet.fromSeed(process.env.DESTINATION_SEED);
    }
  }

  // Get issuer wallet address from env
  getIssuerAddress(): string {
    return process.env.GEO_PULSE_ISSUER_ADDRESS || this.issuerWallet?.address || '';
  }

  // Get issuer wallet instance
  getIssuerWallet(): Wallet {
    if (!this.issuerWallet) {
      throw new Error('Issuer wallet not configured. Set GEO_PULSE_ISSUER_SEED in .env');
    }
    return this.issuerWallet;
  }

  // Get destination wallet instance
  getDestinationWallet(): Wallet {
    if (!this.destinationWallet) {
      throw new Error('Destination wallet not configured. Set DESTINATION_SEED in .env');
    }
    return this.destinationWallet;
  }

  // Get XRPL client
  getClient(): Client {
    return this.client;
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
        return line ? String(line.balance) : '0';
      }

      // Fallback to XRP
      const info = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated',
      });
      const bal = info.result.account_data.Balance;
      return String(dropsToXrp(typeof bal === 'number' ? String(bal) : bal));
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
          amountStr = String(dropsToXrp(tx.Amount));
          currency = 'XRP';
        } else if (typeof tx.Amount === 'number') {
          amountStr = String(dropsToXrp(String(tx.Amount)));
          currency = 'XRP';
        } else if (tx.Amount && typeof tx.Amount === 'object') {
          // Issued currency
          amountStr = String((tx.Amount as { value?: unknown }).value || '0');
          currency = (tx.Amount as { currency?: string }).currency || 'Unknown';
        }

        // Sometimes DeliveredAmount appears in meta instead
        if (entry.meta && entry.meta.delivered_amount) {
          delivered = entry.meta.delivered_amount;
          if (typeof delivered === 'string') {
            amountStr = String(dropsToXrp(delivered));
          } else if (typeof delivered === 'number') {
            amountStr = String(dropsToXrp(String(delivered)));
          } else if (delivered && typeof delivered === 'object' && 'value' in delivered) {
            amountStr = String((delivered as { value?: unknown }).value ?? '0');
            currency = (delivered as { currency?: string }).currency || currency;
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

    const payMeta = result.result.meta as { TransactionResult?: string } | undefined;
    if (payMeta?.TransactionResult !== 'tesSUCCESS') {
      throw new Error(`Payment failed: ${payMeta?.TransactionResult}`);
    }

    return {
      hash: result.result.hash,
      result: payMeta?.TransactionResult,
    };
  }

  // ── Escrow: Create, Finish, Cancel, List ─────────────────────────────
  async createEscrow(
    owner: Wallet,
    recipient: string,
    amount: string,
    currency: string,
    cancelAfter: number,
    issuer?: string,
    finishAfter?: number
  ) {
    await this.connect();
    const isXRP = currency === 'XRP';
    const amountField = isXRP ? xrpToDrops(amount) : { value: amount, currency, issuer: issuer! };
    const txJson: any = {
      TransactionType: 'EscrowCreate',
      Account: owner.address,
      Destination: recipient,
      Amount: amountField,
      CancelAfter: cancelAfter,
    };
    if (finishAfter != null) txJson.FinishAfter = finishAfter;

    const prepared = await this.client.autofill(txJson);
    const signed = owner.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);

    const createMeta = result.result.meta as { TransactionResult?: string } | undefined;
    if (createMeta?.TransactionResult !== 'tesSUCCESS') {
      throw new Error(`EscrowCreate failed: ${createMeta?.TransactionResult}`);
    }

    const seq = (prepared as any).Sequence;
    return { hash: result.result.hash, sequence: seq };
  }

  async finishEscrow(owner: Wallet, sequence: number, fulfillment?: string) {
    await this.connect();
    const txJson: any = {
      TransactionType: 'EscrowFinish',
      Account: owner.address,
      Owner: owner.address,
      OfferSequence: sequence,
    };
    if (fulfillment) txJson.Fulfillment = fulfillment;

    const prepared = await this.client.autofill(txJson);
    const signed = owner.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);

    const finishMeta = result.result.meta as { TransactionResult?: string } | undefined;
    if (finishMeta?.TransactionResult !== 'tesSUCCESS') {
      throw new Error(`EscrowFinish failed: ${finishMeta?.TransactionResult}`);
    }

    return { hash: result.result.hash };
  }

  async cancelEscrow(owner: Wallet, sequence: number) {
    await this.connect();
    const txJson: Record<string, unknown> = {
      TransactionType: 'EscrowCancel',
      Account: owner.address,
      Owner: owner.address,
      OfferSequence: sequence,
    };

    const prepared = await this.client.autofill(txJson as any);
    const signed = owner.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);

    const cancelMeta = result.result.meta as { TransactionResult?: string } | undefined;
    if (cancelMeta?.TransactionResult !== 'tesSUCCESS') {
      throw new Error(`EscrowCancel failed: ${cancelMeta?.TransactionResult}`);
    }

    return { hash: result.result.hash };
  }

  async listEscrows(owner: string) {
    await this.connect();
    const resp = await this.client.request({
      command: 'account_objects',
      account: owner,
      type: 'escrow',
      ledger_index: 'validated',
    });

    const escrows = (resp.result.account_objects || []).map((obj: any) => ({
      sequence: obj.Sequence,
      amount: obj.Amount,
      destination: obj.Destination,
      finishAfter: obj.FinishAfter,
      cancelAfter: obj.CancelAfter,
    }));

    return escrows;
  }

  /** Convert Unix timestamp to Ripple epoch */
  static unixToRippleEpoch(unixSec: number): number {
    return unixSec - RIPPLE_EPOCH_OFFSET;
  }

  // ── Trust Line Management ────────────────────────────────────────────
  /**
   * Check if an account has a trustline to the issuer for a given currency
   */
  async hasTrustLine(account: string, currency: string = 'POL', issuer?: string): Promise<boolean> {
    await this.connect();
    const issuerAddr = issuer || this.getIssuerAddress();
    
    try {
      const resp = await this.client.request({
        command: 'account_lines',
        account,
        ledger_index: 'validated',
      });
      
      return resp.result.lines.some(
        (line: any) => line.currency === currency && line.account === issuerAddr
      );
    } catch (err: any) {
      if (err.data?.error === 'actNotFound') return false;
      throw err;
    }
  }

  /**
   * Create a TrustSet transaction to establish trustline
   */
  async createTrustLine(
    wallet: Wallet,
    currency: string = 'POL',
    issuer?: string,
    limit: string = '1000000000'
  ) {
    await this.connect();
    const issuerAddr = issuer || this.getIssuerAddress();
    
    const txJson = {
      TransactionType: 'TrustSet' as const,
      Account: wallet.address,
      LimitAmount: {
        currency,
        issuer: issuerAddr,
        value: limit,
      },
      Flags: 0,
    };

    const prepared = await this.client.autofill(txJson);
    const signed = wallet.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);

    const meta = result.result.meta as { TransactionResult?: string } | undefined;
    if (meta?.TransactionResult !== 'tesSUCCESS') {
      throw new Error(`TrustSet failed: ${meta?.TransactionResult}`);
    }

    return { hash: result.result.hash, result: meta?.TransactionResult };
  }

  /**
   * Get account info (balance, sequence, etc.)
   */
  async getAccountInfo(address: string) {
    await this.connect();
    try {
      const resp = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated',
      });
      
      return {
        address,
        balance: dropsToXrp(
          typeof resp.result.account_data.Balance === 'number'
            ? String(resp.result.account_data.Balance)
            : resp.result.account_data.Balance
        ),
        sequence: resp.result.account_data.Sequence,
        flags: resp.result.account_data.Flags,
        ownerCount: resp.result.account_data.OwnerCount,
        previousTxnID: resp.result.account_data.PreviousTxnID,
        previousTxnLgrSeq: resp.result.account_data.PreviousTxnLgrSeq,
      };
    } catch (err: any) {
      if (err.data?.error === 'actNotFound') {
        throw new Error(`Account ${address} not found on ledger`);
      }
      throw err;
    }
  }

  /**
   * Get all trustlines for an account
   */
  async getTrustLines(account: string, currency?: string) {
    await this.connect();
    const resp = await this.client.request({
      command: 'account_lines',
      account,
      ledger_index: 'validated',
    });

    let lines = resp.result.lines || [];
    if (currency) {
      lines = lines.filter((line: any) => line.currency === currency);
    }
    
    return lines;
  }
}
