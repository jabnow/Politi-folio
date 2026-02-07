/**
 * XRPL API controller - balance, transactions, POL, RLUSD, escrow
 */
import type { Request, Response } from 'express';
import { XrplService } from '../services/xrpl.service.js';
import { RlusdService } from '../services/rlusd.service.js';
import { PolService } from '../services/pol.service.js';
import { EscrowService } from '../services/escrow.service.js';
import { getPolRiskSentiment } from '../services/pol-risk-sentiment.service.js';

const xrpl = new XrplService();
const rlusd = new RlusdService();
const pol = new PolService();
const escrow = new EscrowService();

function json(res: Response, data: object, status = 200) {
  res.status(status).json(data);
}

function error(res: Response, message: string, status = 400) {
  res.status(status).json({ error: message });
}

/** GET /api/xrpl/balance?address=&currency=&issuer= */
export async function getBalance(req: Request, res: Response) {
  const address = req.query.address as string;
  if (!address) return error(res, 'address required');

  try {
    const currency = req.query.currency as string | undefined;
    const issuer = req.query.issuer as string | undefined;
    const balance = await xrpl.getBalance(address, currency, issuer);
    json(res, { address, balance, currency: currency || 'XRP' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(res, msg, 500);
  }
}

/** GET /api/xrpl/transactions?address=&limit= */
export async function getTransactions(req: Request, res: Response) {
  const address = req.query.address as string;
  if (!address) return error(res, 'address required');

  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const transactions = await xrpl.monitorTransactions(address, limit);
    json(res, { address, transactions });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(res, msg, 500);
  }
}

/** GET /api/xrpl/pol/risk-sentiment - POL risk score + social sentiment from news */
export async function getPolRiskSentimentHandler(req: Request, res: Response) {
  try {
    const result = await getPolRiskSentiment();
    json(res, result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(res, msg, 500);
  }
}

/** GET /api/xrpl/pol/issuer - returns POL issuer address if configured */
export async function getPolIssuer(req: Request, res: Response) {
  const issuer = pol.getIssuer();
  json(res, { issuer: issuer ?? null, currency: pol.getCurrencyCode() });
}

/** GET /api/xrpl/pol/balance?address= */
export async function getPolBalance(req: Request, res: Response) {
  const address = req.query.address as string;
  if (!address) return error(res, 'address required');

  try {
    const balance = await pol.getPolBalance(address);
    json(res, { address, balance, currency: pol.getCurrencyCode(), issuer: pol.getIssuer() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(res, msg, 500);
  }
}

/** GET /api/xrpl/rlusd/balance?address= */
export async function getRlusdBalance(req: Request, res: Response) {
  const address = req.query.address as string;
  if (!address) return error(res, 'address required');

  try {
    const balance = await rlusd.getRlusdBalance(address);
    json(res, { address, balance, currency: 'RLUSD' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(res, msg, 500);
  }
}

/** POST /api/xrpl/escrow/create - use ownerSeed or useDemoWallet (uses GEO_PULSE_ISSUER_SEED) */
export async function createEscrow(req: Request, res: Response) {
  const { ownerSeed, useDemoWallet, recipient, amount, currency, cancelAfter, issuer, finishAfter } = req.body || {};
  let seed = ownerSeed;
  if (!seed && useDemoWallet) {
    seed = process.env.GEO_PULSE_ISSUER_SEED;
  }
  if (!seed || !recipient || !amount || !currency || !cancelAfter) {
    return error(res, 'ownerSeed or useDemoWallet with GEO_PULSE_ISSUER_SEED; recipient, amount, currency, cancelAfter required');
  }

  try {
    const result = await escrow.createEscrow({
      ownerSeed: seed,
      recipient,
      amount: String(amount),
      currency,
      cancelAfter: Number(cancelAfter),
      issuer,
      finishAfter: finishAfter != null ? Number(finishAfter) : undefined,
    });
    json(res, result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(res, msg, 500);
  }
}

/** POST /api/xrpl/escrow/finish */
export async function finishEscrow(req: Request, res: Response) {
  const { ownerSeed, escrowSequence } = req.body || {};
  if (!ownerSeed || escrowSequence == null) return error(res, 'ownerSeed, escrowSequence required');

  try {
    const result = await escrow.finishEscrow(ownerSeed, Number(escrowSequence));
    json(res, result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(res, msg, 500);
  }
}

/** POST /api/xrpl/escrow/cancel */
export async function cancelEscrow(req: Request, res: Response) {
  const { ownerSeed, escrowSequence } = req.body || {};
  if (!ownerSeed || escrowSequence == null) return error(res, 'ownerSeed, escrowSequence required');

  try {
    const result = await escrow.cancelEscrow(ownerSeed, Number(escrowSequence));
    json(res, result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(res, msg, 500);
  }
}

/** GET /api/xrpl/escrow/list?owner= */
export async function listEscrows(req: Request, res: Response) {
  const owner = req.query.owner as string;
  if (!owner) return error(res, 'owner required');

  try {
    const escrows = await escrow.listEscrows(owner);
    json(res, { owner, escrows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(res, msg, 500);
  }
}
