/**
 * World News API - Layer 1: Geopolitical signal ingestion
 * https://worldnewsapi.com/docs/
 */
import type { NewsArticle } from '../types/workflow.types.js'

const BASE = 'https://api.worldnewsapi.com'

function getApiKey(): string {
  const key = process.env.WORLD_NEWS_API_KEY
  if (!key) throw new Error('WORLD_NEWS_API_KEY is required')
  return key
}

/** Format date for World News API: YYYY-MM-DD HH:MM:SS */
function toApiDate(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

export async function searchNews(params: {
  text?: string
  language?: string
  categories?: string
  'source-country'?: string
  number?: number
  'earliest-publish-date'?: string
  'latest-publish-date'?: string
}): Promise<NewsArticle[]> {
  const key = getApiKey()
  const searchParams = new URLSearchParams({
    'api-key': key,
    ...(params.text && { text: params.text }),
    ...(params.language && { language: params.language }),
    ...(params.categories && { categories: params.categories }),
    ...(params['source-country'] && { 'source-country': params['source-country'] }),
    ...(params['earliest-publish-date'] && { 'earliest-publish-date': params['earliest-publish-date'] }),
    ...(params['latest-publish-date'] && { 'latest-publish-date': params['latest-publish-date'] }),
    number: String(params.number ?? 10),
  })
  const res = await fetch(`${BASE}/search-news?${searchParams}`)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`World News API error: ${res.status} ${err}`)
  }
  const data = (await res.json()) as { news?: NewsArticle[] }
  return data.news ?? []
}

export async function getTopNews(params: {
  'source-country': string
  language?: string
  date?: string
}): Promise<NewsArticle[]> {
  const key = getApiKey()
  const searchParams = new URLSearchParams({
    'api-key': key,
    'source-country': params['source-country'],
    language: params.language ?? 'en',
    ...(params.date && { date: params.date }),
  })
  const res = await fetch(`${BASE}/top-news?${searchParams}`)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`World News API error: ${res.status} ${err}`)
  }
  const data = (await res.json()) as { top_news?: { news: NewsArticle[] }[] }
  const topNews = data.top_news ?? []
  return topNews.flatMap((cluster: { news: NewsArticle[] }) => cluster.news ?? [])
}

/** Extract full article content from a URL - scrapes and returns structured JSON */
export async function extractNews(params: { url: string; analyze?: boolean }): Promise<{
  title?: string
  text?: string
  url?: string
  publish_date?: string
  authors?: string[]
  language?: string
} | null> {
  const key = getApiKey()
  const searchParams = new URLSearchParams({
    'api-key': key,
    url: params.url,
    ...(params.analyze && { analyze: 'true' }),
  })
  const res = await fetch(`${BASE}/extract-news?${searchParams}`)
  if (!res.ok) {
    const err = await res.text()
    console.warn(`[World News API] extract-news error: ${res.status}`, err.slice(0, 200))
    return null
  }
  const data = (await res.json()) as { title?: string; text?: string; url?: string; publish_date?: string; authors?: string[]; language?: string }
  return data
}
