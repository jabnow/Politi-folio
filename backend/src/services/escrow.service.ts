// backend/src/services/escrow.service.ts
import { Wallet } from 'xrpl';
import { XrplService } from './xrpl.service.js';

const RIPPLE_EPOCH_OFFSET = 946684800;

/** Convert Unix timestamp (seconds) to Ripple epoch */
function unixToRippleEpoch(unixSec: number): number {
  return unixSec - RIPPLE_EPOCH_OFFSET;
}

export interface CreateEscrowPayload {
  ownerSeed: string;
  recipient: string;
  amount: string;
  currency: string;
  cancelAfter: number; // Unix timestamp (seconds)
  issuer?: string;
  finishAfter?: number; // Unix timestamp (seconds)
}

export class EscrowService {
  private xrpl: XrplService;

  constructor() {
    this.xrpl = new XrplService();
  }

  async createEscrow(payload: CreateEscrowPayload) {
    const wallet = Wallet.fromSeed(payload.ownerSeed);
    const cancelAfter = unixToRippleEpoch(payload.cancelAfter);
    const finishAfter = payload.finishAfter != null ? unixToRippleEpoch(payload.finishAfter) : undefined;
    return this.xrpl.createEscrow(
      wallet,
      payload.recipient,
      payload.amount,
      payload.currency,
      cancelAfter,
      payload.issuer,
      finishAfter
    );
  }

  async finishEscrow(ownerSeed: string, escrowSequence: number, fulfillment?: string) {
    const wallet = Wallet.fromSeed(ownerSeed);
    return this.xrpl.finishEscrow(wallet, escrowSequence, fulfillment);
  }

  async cancelEscrow(ownerSeed: string, escrowSequence: number) {
    const wallet = Wallet.fromSeed(ownerSeed);
    return this.xrpl.cancelEscrow(wallet, escrowSequence);
  }

  async listEscrows(owner: string) {
    return this.xrpl.listEscrows(owner);
  }
}
