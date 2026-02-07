// backend/src/services/pol.service.ts
import { Wallet } from 'xrpl';
import { XrplService } from './xrpl.service.js';

const POL_CURRENCY = process.env.GEO_PULSE_CURRENCY_CODE?.trim() || 'POL';

function getPolIssuer(): string | undefined {
  const seed = process.env.GEO_PULSE_ISSUER_SEED;
  if (!seed || seed === 'MOCK_SEED') return undefined;
  try {
    const wallet = Wallet.fromSeed(seed);
    return wallet.address;
  } catch {
    return undefined;
  }
}

export class PolService {
  private xrpl: XrplService;

  constructor() {
    this.xrpl = new XrplService();
  }

  getCurrencyCode(): string {
    return POL_CURRENCY;
  }

  getIssuer(): string | undefined {
    return getPolIssuer();
  }

  async getPolBalance(address: string): Promise<string> {
    const issuer = getPolIssuer();
    if (!issuer) return '0';
    return this.xrpl.getBalance(address, POL_CURRENCY, issuer);
  }

  async sendPol(fromSeed: string, toAddress: string, amount: string) {
    const issuer = getPolIssuer();
    if (!issuer) throw new Error('POL issuer not configured (GEO_PULSE_ISSUER_SEED)');
    const wallet = Wallet.fromSeed(fromSeed);
    return this.xrpl.sendPayment(wallet, toAddress, amount, POL_CURRENCY, issuer);
  }
}
