// backend/src/services/rlusd.service.ts
import { Wallet } from 'xrpl';
import { XrplService } from './xrpl.service.js';

const RLUSD_TESTNET_ISSUER = 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV';
const RLUSD_CURRENCY = 'RLUSD'; // or '524C555344...' if needed

export class RlusdService {
  private xrpl: XrplService;

  constructor() {
    this.xrpl = new XrplService();
  }

  async getRlusdBalance(address: string): Promise<string> {
    return this.xrpl.getBalance(address, RLUSD_CURRENCY, RLUSD_TESTNET_ISSUER);
  }

  async sendRlusd(fromSeed: string, toAddress: string, amount: string) {
    const wallet = Wallet.fromSeed(fromSeed);
    return this.xrpl.sendPayment(wallet, toAddress, amount, RLUSD_CURRENCY, RLUSD_TESTNET_ISSUER);
  }
}