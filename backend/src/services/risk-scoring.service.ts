import type { RiskAssessment } from '../types/risk.types.js';

export class RiskScoringService {
  async calculate(tx: any): Promise<RiskAssessment> {  // pass tx object
    let score = 20;
    let factors: string[] = [];

    if (tx.currency !== 'XRP' && tx.currency !== 'RLUSD') {
      score += 40;
      factors.push('Custom/issued token → higher volatility');
    }
    if (parseFloat(tx.amount) > 500) {
      score += 30;
      factors.push('Large transfer size');
    }

    let level: 'low' | 'medium' | 'high' =
      score < 40 ? 'low' : score < 70 ? 'medium' : 'high';

    return { score, level, factors };
  }
}