# Politi-folio Architecture

## Dedalus Sandbox

**Recommendation:** Use a Dedalus sandbox for local development and testing. Use the main project (`geopulse-staging`) for production. Set `DEDALUS_PROJECT=geopulse-sandbox` in `.env` when developing locally to avoid polluting production data.

## Dedalus Setup (geopulse-staging)

One project per environment. Enable only required services:

- **AI Gateway**
- **Queue**
- **Storage**

## MCP Servers (Dedalus - up to 3)

| MCP Server      | Purpose                         | Tools Exposed                               |
|-----------------|---------------------------------|---------------------------------------------|
| **geo-events**  | Geopolitical ingestion + normalization | `fetch_world_news`, `normalize_geo_event` |
| **market-data**| Alpha Vantage access            | `get_sector_performance`, `get_asset_timeseries` |
| **portfolio-rules** | Deterministic rebalancing | `check_drift_band`, `calendar_rebalance_due`, `generate_rebalance_orders` |

## Agentuity Orchestrator

```
Agentuity Orchestrator
├── GeoRisk Agent
├── Market Impact Agent
├── Portfolio Agent
└── Compliance Agent
```

## Agent → Dedalus Interaction Map

### GeoRisk Agent
- **Calls:** Dedalus MCP `geo-events.normalize_geo_event`
- **Produces:**
  ```json
  { "severity": "HIGH", "affected_sectors": ["Semiconductors"] }
  ```

### Market Impact Agent
- **Calls:** Dedalus MCP `market-data.get_sector_performance`
- Dedalus MCP calls Alpha Vantage
- Agent interprets results

### Portfolio Agent
- **Collects:** exposure analysis, risk budget, scenario constraints
- **Calls:** Dedalus MCP `portfolio-rules.check_drift_band`
- **Returns:**
  ```json
  { "rebalance_required": true, "reason": "drift_band_breached" }
  ```

### Compliance Agent
- Final gate
- No external calls
- Approves / blocks rebalance

## Dedalus Queue (Hobby tier)

Use Queue to avoid burning tool calls:

1. News event arrives
2. Push job → `geo-risk-queue`
3. Agentuity processes asynchronously
4. Only call Alpha Vantage if needed
5. Keeps under 50 tool calls/month

## Storage (what to store)

**Store:**
- Geo events
- Agent decisions
- Rebalance rationale

**Do not store:**
- Raw market time series
- Embeddings (yet)

**Example stored object:**
```json
{
  "event_id": "2026-02-07-us-export-controls",
  "decision": "rebalance",
  "method": "drift_band",
  "agents": ["GeoRisk", "MarketImpact", "Portfolio", "Compliance"]
}
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DEDALUS_API_KEY` | Dedalus API access |
| `DEDALUS_PROJECT` | `geopulse-staging` |
| `ALPHA_VANTAGE_API_KEY` | Market data (replaces financial_datasets) |
| `WORLD_NEWS_API_KEY` | Geopolitical news ingestion |
| `GEMINI_API_KEY` | Optional; steps 1-4 use Dedalus AI Gateway |

Agentuity does not require a separate API key (orchestrates via Dedalus).

---

## Agent Flow (Gemini)

### Agent 1 — GeoRisk
- **Input:** `{ headline, country, affected_entities }`
- **Output:** `{ risk_type, severity, affected_sectors, market_relevance }`
- Shared context for downstream agents

### Agent 2 — Market Sync
- **Input:** GeoRisk output + Alpha Vantage `{ sector_change_1w, sector_change_1m }`
- **Output:** `{ alignment, interpretation, confidence }`
- "Is the market reacting in line with the geopolitical signal?"

### Agent 3 — Recommendation
- **Input:** `{ geo_risk_severity, market_alignment, portfolio_state }`
- **Output:** `{ recommended_posture, rationale, suggested_actions }`
- Does NOT rebalance — recommends posture only

## Rebalance Rules

### Drift Band
When portfolio breaches +/- X% threshold, rebalance to target. Example: 50:50 AAPL:TLT, band 10% → if 62:38, trigger.

### Calendar
At fixed period (e.g. April 1st), rebalance to target allocation.
