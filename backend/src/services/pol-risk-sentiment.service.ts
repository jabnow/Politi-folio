/**
 * POL Risk & Sentiment - aggregates geopolitical news sentiment + XRPL POL transaction risk
 */
import { searchNews } from './world-news.service.js';
import { PolService } from './pol.service.js';
import { XrplService } from './xrpl.service.js';

function inferSentiment(title: string, summary?: string): number {
  const t = `${title} ${summary ?? ''}`.toLowerCase();
  if (/\b(sanction|war|crisis|fraud|ban|restrict)\b/.test(t)) return -0.4;
  if (/\b(adopt|growth|approve|compliance|clear)\b/.test(t)) return 0.3;
  return 0;
}

const POL_NEWS_QUERIES = [
  'XRP crypto geopolitics',
  'cryptocurrency sanctions regulation',
  'blockchain policy compliance',
];

export interface PolRiskSentimentResult {
  riskScore: number;
  sentiment: number; // -1 to 1
  sentimentLabel: 'negative' | 'neutral' | 'positive';
  headlines: { title: string; summary?: string; sentiment?: number; source?: string }[];
  polTxCount: number;
  polTxRiskAvg: number;
  flaggedCount: number;
}

export async function getPolRiskSentiment(): Promise<PolRiskSentimentResult> {
  const pol = new PolService();
  const issuer = pol.getIssuer();

  let headlines: PolRiskSentimentResult['headlines'] = [];
  let sentimentSum = 0;
  let sentimentCount = 0;

  try {
    for (const query of POL_NEWS_QUERIES) {
      const news = await searchNews({
        text: query,
        language: 'en',
        categories: 'politics,technology,business',
        number: 3,
      });
      news.forEach((n) => {
        let sent = typeof n.sentiment === 'number' ? n.sentiment : inferSentiment(n.title, n.summary);
        sentimentSum += sent;
        sentimentCount += 1;
        headlines.push({
          title: n.title,
          summary: n.summary,
          sentiment: sent,
          source: n.authors?.[0],
        });
      });
    }
  } catch {
    // Fallback mock headlines when API unavailable
    headlines = [
      { title: 'EU Sanctions Impact Crypto Cross-Border Flows', sentiment: -0.3 },
      { title: 'XRP Ledger Adopted for Compliance-Cleared Settlements', sentiment: 0.4 },
      { title: 'Geopolitical Risk Drives Demand for Policy-Linked Tokens', sentiment: 0.2 },
    ];
    sentimentSum = 0.3;
    sentimentCount = 3;
  }

  const sentiment =
    sentimentCount > 0 ? Math.max(-1, Math.min(1, sentimentSum / sentimentCount)) : 0;
  const sentimentLabel =
    sentiment < -0.15 ? 'negative' : sentiment > 0.15 ? 'positive' : 'neutral';

  let polTxCount = 0;
  let polTxRiskAvg = 0;
  let flaggedCount = 0;

  if (issuer) {
    try {
      const xrpl = new XrplService();
      const txs = await xrpl.monitorTransactions(issuer, 50);
      const polTxs = txs.filter((t) => t.currency === pol.getCurrencyCode());
      polTxCount = polTxs.length;
      if (polTxs.length > 0) {
        polTxRiskAvg =
          polTxs.reduce((sum, t) => sum + t.riskScore, 0) / polTxs.length;
        flaggedCount = polTxs.filter((t) => t.riskScore >= 70).length;
      }
    } catch {
      /* XRPL unavailable */
    }
  }

  // Composite risk: sentiment (negative = higher risk) + transaction risk
  const sentimentRisk = sentiment < 0 ? Math.abs(sentiment) * 40 : 0;
  const txRisk = Math.min(100, polTxRiskAvg * 0.6 + sentimentRisk);
  const riskScore = Math.round(Math.min(100, txRisk + (sentiment < -0.2 ? 15 : 0)));

  return {
    riskScore,
    sentiment,
    sentimentLabel,
    headlines: headlines.slice(0, 6),
    polTxCount,
    polTxRiskAvg: Math.round(polTxRiskAvg * 10) / 10,
    flaggedCount,
  };
}
