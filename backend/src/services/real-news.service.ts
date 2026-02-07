/**
 * Fetch real company/geopolitical news from World News API for fallback.
 * Used when geo_events is empty - returns real news about NVDA, TSMC, semiconductors, etc.
 */
import type { GeopoliticalEvent } from '../mocks/events.mock.js'
import { searchNews } from './world-news.service.js'

const REAL_NEWS_QUERIES = [
  'NVDA NVIDIA semiconductor',
  'TSMC Taiwan semiconductor',
  'semiconductor chip geopolitics',
]

const COUNTRY_MAP: Record<string, string> = {
  taiwan: 'Taiwan',
  usa: 'USA',
  china: 'China',
  japan: 'Japan',
  'south korea': 'South Korea',
  europe: 'EU',
  netherlands: 'Netherlands',
  germany: 'Germany',
}

function inferCountry(title: string, summary?: string): string {
  const text = `${title} ${summary ?? ''}`.toLowerCase()
  for (const [key, country] of Object.entries(COUNTRY_MAP)) {
    if (text.includes(key)) return country
  }
  return 'Global'
}

function inferType(title: string): GeopoliticalEvent['type'] {
  const t = title.toLowerCase()
  if (t.includes('sanction') || t.includes('sanctions')) return 'sanctions'
  if (t.includes('tariff') || t.includes('trade')) return 'trade'
  if (t.includes('regulation') || t.includes('regulatory')) return 'regulation'
  if (t.includes('policy') || t.includes('fed') || t.includes('rate')) return 'policy'
  if (t.includes('election') || t.includes('political')) return 'political'
  return 'compliance'
}

function inferSeverity(title: string): GeopoliticalEvent['severity'] {
  const t = title.toLowerCase()
  if (t.includes('crisis') || t.includes('crash') || t.includes('war')) return 'CRITICAL'
  if (t.includes('risk') || t.includes('threat') || t.includes('sanction')) return 'HIGH'
  if (t.includes('update') || t.includes('change')) return 'MEDIUM'
  return 'LOW'
}

/** Fetch real news and convert to GeopoliticalEvent format */
export async function fetchRealCompanyNews(): Promise<GeopoliticalEvent[]> {
  const all: GeopoliticalEvent[] = []
  const seen = new Set<string>()

  for (const query of REAL_NEWS_QUERIES) {
    try {
      const news = await searchNews({
        text: query,
        language: 'en',
        categories: 'technology,business,politics',
        number: 3,
      })
      news.forEach((n, i) => {
        const key = `${n.title}-${n.publish_date ?? ''}`
        if (seen.has(key)) return
        seen.add(key)
        const event: Omit<GeopoliticalEvent, 'id'> = {
          timestamp: n.publish_date ?? new Date().toISOString().replace('T', ' ').slice(0, 19),
          type: inferType(n.title),
          severity: inferSeverity(n.title),
          title: n.title,
          description: n.summary ?? n.text?.slice(0, 200) ?? '',
          country: inferCountry(n.title, n.summary),
          affectedTransactions: 0,
          source: n.authors?.[0] ?? 'World News API',
        }
        all.push({ ...event, id: all.length + 1 })
      })
    } catch {
      /* skip failed query */
    }
  }

  return all.slice(0, 10)
}
