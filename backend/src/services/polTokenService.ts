/**
 * POL Token Service
 * Handles minting, transferring, and managing the POL geopolitical intelligence token
 * Replaces and refactors issueToken.js into a proper service class
 */

import { Wallet, Client } from 'xrpl';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

export class PolTokenService {
  private issuer: Wallet;
  private client: Client;
  private currencyCode: string;
  private issuerAddress: string;

  constructor() {
    // Load issuer wallet from environment
    const issuerSeed = process.env.GEO_PULSE_ISSUER_SEED;
    if (!issuerSeed) {
      throw new Error('GEO_PULSE_ISSUER_SEED not configured in .env');
    }

    this.issuer = Wallet.fromSeed(issuerSeed);
    this.issuerAddress = process.env.GEO_PULSE_ISSUER_ADDRESS || this.issuer.address;
    this.currencyCode = process.env.GEO_PULSE_CURRENCY_CODE || 'POL';
    
    const nodeUrl = process.env.XRPL_NODE_URL || 'wss://testnet.xrpl-labs.com/';
    this.client = new Client(nodeUrl);
  }

  /**
   * Get issuer address
   */
  getIssuer(): string {
    return this.issuerAddress;
  }

  /**
   * Get currency code
   */
  getCurrencyCode(): string {
    return this.currencyCode;
  }

  /**
   * Connect to XRPL network
   */
  async connect() {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
  }

  /**
   * Disconnect from XRPL network
   */
  async disconnect() {
    if (this.client.isConnected()) {
      await this.client.disconnect();
    }
  }

  /**
   * Create a trustline for an account to receive POL tokens
   */
  async createTrustLine(
    destWallet: Wallet,
    limit: string = '1000000000'
  ): Promise<{ txHash: string; success: boolean }> {
    await this.connect();

    try {
      // Check if trustline already exists
      const linesResp = await this.client.request({
        command: 'account_lines',
        account: destWallet.address,
        ledger_index: 'validated',
      });

      const hasTrustLine = linesResp.result.lines.some(
        (line: any) => line.currency === this.currencyCode && line.account === this.issuer.address
      );

      if (hasTrustLine) {
        console.log(`Trust line already exists for ${destWallet.address}`);
        return { txHash: 'EXISTING', success: true };
      }

      // Create trustline
      console.log(`Creating trust line for ${destWallet.address}...`);
      const trustSetTx = await this.client.submitAndWait(
        {
          TransactionType: 'TrustSet',
          Account: destWallet.address,
          LimitAmount: {
            currency: this.currencyCode,
            issuer: this.issuer.address,
            value: limit,
          },
          Flags: 0,
          Fee: '12',
        },
        { wallet: destWallet }
      );

      const meta = trustSetTx.result.meta as { TransactionResult?: string } | undefined;
      if (meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`TrustSet failed: ${meta?.TransactionResult}`);
      }

      console.log(`Trust line created: ${trustSetTx.result.hash}`);
      return { txHash: trustSetTx.result.hash, success: true };
    } catch (err: any) {
      console.error('Error creating trust line:', err.message);
      throw err;
    }
  }

  /**
   * Mint (issue) POL tokens to a destination
   */
  async mint(
    toAddress: string,
    amount: string,
    reason: string = 'initial_mint'
  ): Promise<{ txHash: string; success: boolean }> {
    await this.connect();

    try {
      // Ensure destination has trustline
      const destInfo = await this.client.request({
        command: 'account_info',
        account: toAddress,
        ledger_index: 'validated',
      });

      console.log(`Issuing ${amount} ${this.currencyCode} to ${toAddress}...`);

      const paymentTx = await this.client.submitAndWait(
        {
          TransactionType: 'Payment',
          Account: this.issuer.address,
          Destination: toAddress,
          Amount: {
            currency: this.currencyCode,
            value: amount,
            issuer: this.issuer.address,
          },
          Fee: '12',
        },
        { wallet: this.issuer }
      );

      const meta = paymentTx.result.meta as { TransactionResult?: string } | undefined;
      if (meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Payment failed: ${meta?.TransactionResult}`);
      }

      // Log to database
      await prisma.polTransaction.create({
        data: {
          type: 'mint',
          amount: parseFloat(amount),
          fromWallet: this.issuer.address,
          toWallet: toAddress,
          txHash: paymentTx.result.hash,
          reason,
        },
      });

      console.log(`Tokens minted successfully: ${paymentTx.result.hash}`);
      return { txHash: paymentTx.result.hash, success: true };
    } catch (err: any) {
      console.error('Error minting tokens:', err.message);
      throw err;
    }
  }

  /**
   * Transfer POL from one wallet to another
   */
  async transfer(
    fromWallet: Wallet,
    toAddress: string,
    amount: string,
    reason: string = 'transfer'
  ): Promise<{ txHash: string; success: boolean }> {
    await this.connect();

    try {
      console.log(`Transferring ${amount} ${this.currencyCode} from ${fromWallet.address} to ${toAddress}...`);

      const paymentTx = await this.client.submitAndWait(
        {
          TransactionType: 'Payment',
          Account: fromWallet.address,
          Destination: toAddress,
          Amount: {
            currency: this.currencyCode,
            value: amount,
            issuer: this.issuer.address,
          },
          Fee: '12',
        },
        { wallet: fromWallet }
      );

      const meta = paymentTx.result.meta as { TransactionResult?: string } | undefined;
      if (meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Transfer failed: ${meta?.TransactionResult}`);
      }

      // Log to database
      await prisma.polTransaction.create({
        data: {
          type: 'transfer',
          amount: parseFloat(amount),
          fromWallet: fromWallet.address,
          toWallet: toAddress,
          txHash: paymentTx.result.hash,
          reason,
        },
      });

      console.log(`Transfer successful: ${paymentTx.result.hash}`);
      return { txHash: paymentTx.result.hash, success: true };
    } catch (err: any) {
      console.error('Error transferring tokens:', err.message);
      throw err;
    }
  }

  /**
   * Clawback POL tokens (requires clawback flag set on issuer account)
   * Only works if the issuer account has SetFlag 8 set (lsfClawback)
   */
  async clawback(
    fromAddress: string,
    amount: string,
    reason: string = 'compliance'
  ): Promise<{ txHash: string; success: boolean }> {
    await this.connect();

    try {
      console.log(`Clawing back ${amount} ${this.currencyCode} from ${fromAddress}...`);

      const clawbackTx = await this.client.submitAndWait(
        {
          TransactionType: 'Payment',
          Account: this.issuer.address,
          Destination: fromAddress,
          Amount: {
            currency: this.currencyCode,
            value: `-${amount}`, // Negative amount for clawback
            issuer: this.issuer.address,
          },
          Fee: '12',
        },
        { wallet: this.issuer }
      );

      const meta = clawbackTx.result.meta as { TransactionResult?: string } | undefined;
      if (meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Clawback failed: ${meta?.TransactionResult}`);
      }

      // Log to database
      await prisma.polTransaction.create({
        data: {
          type: 'clawback',
          amount: parseFloat(amount),
          fromWallet: fromAddress,
          toWallet: this.issuer.address,
          txHash: clawbackTx.result.hash,
          reason,
        },
      });

      console.log(`Clawback successful: ${clawbackTx.result.hash}`);
      return { txHash: clawbackTx.result.hash, success: true };
    } catch (err: any) {
      console.error('Error clawing back tokens:', err.message);
      throw err;
    }
  }

  /**
   * Get POL balance for an account
   */
  async getBalance(address: string): Promise<string> {
    await this.connect();

    try {
      const resp = await this.client.request({
        command: 'account_lines',
        account: address,
        ledger_index: 'validated',
      });

      const line = resp.result.lines.find(
        (l: any) => l.currency === this.currencyCode && l.account === this.issuer.address
      );

      return line ? String(line.balance) : '0';
    } catch (err: any) {
      if (err.data?.error === 'actNotFound') return '0';
      throw err;
    }
  }

  /**
   * Setup clawback flag on issuer account
   * NOTE: This is a one-time operation and cannot be undone
   */
  async enableClawback(): Promise<{ txHash: string; success: boolean }> {
    await this.connect();

    try {
      console.log('Enabling clawback on issuer account...');

      const accountSetTx = await this.client.submitAndWait(
        {
          TransactionType: 'AccountSet',
          Account: this.issuer.address,
          SetFlag: 8, // lsfClawback
          Fee: '12',
        },
        { wallet: this.issuer }
      );

      const meta = accountSetTx.result.meta as { TransactionResult?: string } | undefined;
      if (meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`AccountSet failed: ${meta?.TransactionResult}`);
      }

      console.log(`Clawback enabled: ${accountSetTx.result.hash}`);
      return { txHash: accountSetTx.result.hash, success: true };
    } catch (err: any) {
      console.error('Error enabling clawback:', err.message);
      throw err;
    }
  }
}

export default PolTokenService;
