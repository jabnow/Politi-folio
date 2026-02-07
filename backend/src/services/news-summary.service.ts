/**
 * News Summary - Workflow: Web Search API → Extract Article → AI Summarize
 * Used by reconciliation View Details to show news context for reconciliation tasks.
 */
import { searchNews, extractNews } from './world-news.service.js'
import { dedalusChat } from './dedalus-llm.service.js'

export interface NewsSummaryResult {
  title: string
  summary: string
  source?: string
  url?: string
  publish_date?: string
  eventType: string
}

/** Fetch news for event type, scrape full article, and summarize with AI */
export async function getNewsSummaryForEvent(eventType: string): Promise<NewsSummaryResult | null> {
  try {
    // 1) Search World News API for relevant articles
    const news = await searchNews({
      text: eventType,
      number: 5,
      language: 'en',
      'earliest-publish-date': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    })

    const articleWithUrl = news.find((n) => n.url && n.url.startsWith('http'))
    if (!articleWithUrl?.url) {
      // Fallback: use title + summary from search if no URL
      const first = news[0]
      if (first) {
        const text = [first.title, first.summary, first.text].filter(Boolean).join('\n\n')
        const summary = await summarizeWithAI(text, eventType)
        return {
          title: first.title ?? eventType,
          summary: summary ?? first.summary ?? 'No summary available.',
          source: first.authors?.[0],
          url: first.url,
          publish_date: first.publish_date,
          eventType,
        }
      }
      return null
    }

    // 2) Extract full article content from URL (scrape)
    const extracted = await extractNews({ url: articleWithUrl.url })
    if (!extracted) {
      // Fallback to search result
      const text = [articleWithUrl.title, articleWithUrl.summary, articleWithUrl.text].filter(Boolean).join('\n\n')
      const summary = await summarizeWithAI(text, eventType)
      return {
        title: articleWithUrl.title ?? eventType,
        summary: summary ?? articleWithUrl.summary ?? 'No summary available.',
        source: articleWithUrl.authors?.[0],
        url: articleWithUrl.url,
        publish_date: articleWithUrl.publish_date,
        eventType,
      }
    }

    // 3) AI summarize the scraped article
    const textToSummarize = [extracted.title, extracted.text].filter(Boolean).join('\n\n')
    const summary = await summarizeWithAI(textToSummarize, eventType)

    return {
      title: extracted.title ?? articleWithUrl.title ?? eventType,
      summary: summary ?? extracted.text?.slice(0, 500) ?? 'No summary available.',
      source: extracted.authors?.[0] ?? articleWithUrl.authors?.[0],
      url: extracted.url ?? articleWithUrl.url,
      publish_date: extracted.publish_date ?? articleWithUrl.publish_date,
      eventType,
    }
  } catch (err) {
    console.error('[News Summary]', err)
    return null
  }
}

async function summarizeWithAI(articleText: string, eventType: string): Promise<string | null> {
  const truncated = articleText.slice(0, 8000) // Limit token usage
  const prompt = `Summarize this news article in 3–5 concise bullet points. Focus on:
- Main facts and developments
- Geopolitical, regulatory, or compliance implications
- Any entities, countries, or sectors mentioned

Context: This relates to reconciliation event "${eventType}".

Article:
${truncated}

Provide only the summary bullets, no preamble.`

  return dedalusChat(prompt, {
    systemPrompt: 'You are a compliance analyst. Summarize news in clear, factual bullet points.',
    maxTokens: 512,
    temperature: 0.2,
  })
}
