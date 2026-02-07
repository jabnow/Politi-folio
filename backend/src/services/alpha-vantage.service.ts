/**
 * Alpha Vantage - Market data (sector performance, asset timeseries)
 * Replaces financial_datasets for get_sector_performance, get_asset_timeseries.
 * Used by Market Impact Agent via Dedalus MCP: market-data.
 */
const BASE = 'https://www.alphavantage.co/query'

function getApiKey(): string | null {
  return process.env.ALPHA_VANTAGE_API_KEY ?? null
}

export interface SectorPerformanceEntry {
  'Real-Time Performance': string
  '1 Day': string
  '5 Day': string
  '1 Month': string
  '3 Month': string
  'YTD': string
  '1 Year': string
}

export interface SectorPerformance {
  'Meta Data'?: { 'Last Updated'?: string }
  'Rank A: Real-Time Performance'?: Record<string, SectorPerformanceEntry>
  'Rank B: 1 Day Performance'?: Record<string, SectorPerformanceEntry>
  'Rank C: 5 Day Performance'?: Record<string, SectorPerformanceEntry>
}

export interface TimeSeriesDaily {
  'Meta Data'?: { '1. Information'?: string; '2. Symbol'?: string; '3. Last Refreshed'?: string }
  'Time Series (Daily)'?: Record<string, { '1. open': string; '2. high': string; '3. low': string; '4. close': string; '5. volume': string }>
}

/** Get sector performance (S&P 500 sectors) */
export async function getSectorPerformance(): Promise<SectorPerformance | null> {
  const key = getApiKey()
  if (!key) return null

  const params = new URLSearchParams({ function: 'SECTOR', apikey: key })
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) return null

  const data = (await res.json()) as SectorPerformance
  if (data['Meta Data'] || data['Rank A: Real-Time Performance']) return data
  return null
}

/** Get daily time series for an asset (company price data) */
export async function getAssetTimeseries(
  symbol: string,
  outputsize: 'compact' | 'full' = 'compact'
): Promise<TimeSeriesDaily | null> {
  const key = getApiKey()
  if (!key) return null

  const params = new URLSearchParams({
    function: 'TIME_SERIES_DAILY',
    symbol,
    outputsize,
    apikey: key,
  })
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) return null

  const data = (await res.json()) as TimeSeriesDaily
  if (data['Time Series (Daily)']) return data
  return null
}

/** Get market data for multiple tickers (used by workflow step 4) */
export async function getTimeseriesForTickers(
  tickers: string[]
): Promise<Record<string, TimeSeriesDaily | null>> {
  const result: Record<string, TimeSeriesDaily | null> = {}
  for (const ticker of tickers) {
    result[ticker] = await getAssetTimeseries(ticker)
  }
  return result
}

/** Parse sector change from string like "-3.45%" to number */
function parseSectorChange(s: string | undefined): number {
  if (!s || typeof s !== 'string') return 0
  const m = s.replace(/%/g, '').trim()
  const n = parseFloat(m)
  return isNaN(n) ? 0 : n
}

/** Get sector summary for Market Sync Agent: sector_change_1w (5 Day), sector_change_1m (1 Month) */
export async function getSectorSummaryForMarketSync(
  preferredSector?: string
): Promise<{ sector_change_1w: number; sector_change_1m: number; sector_name?: string }> {
  const raw = await getSectorPerformance()
  if (!raw) return { sector_change_1w: 0, sector_change_1m: 0 }

  const rankData = raw['Rank C: 5 Day Performance'] ?? raw['Rank B: 1 Day Performance'] ?? raw['Rank A: Real-Time Performance']
  if (!rankData) return { sector_change_1w: 0, sector_change_1m: 0 }

  const sectors = [
    preferredSector?.toLowerCase(),
    'information technology',
    'technology',
    'semiconductors',
  ].filter(Boolean) as string[]

  let entry: SectorPerformanceEntry | null = null
  let sectorName: string | undefined
  for (const s of sectors) {
    const found = Object.keys(rankData).find((k) => k.toLowerCase().includes(s))
    if (found) {
      entry = rankData[found]
      sectorName = found
      break
    }
  }
  if (!entry) {
    const keys = Object.keys(rankData)
    sectorName = keys[0]
    entry = rankData[keys[0]]
  }

  return {
    sector_change_1w: parseSectorChange(entry?.['5 Day'] ?? entry?.['1 Day']),
    sector_change_1m: parseSectorChange(entry?.['1 Month'] ?? entry?.['5 Day']),
    sector_name: sectorName,
  }
}
