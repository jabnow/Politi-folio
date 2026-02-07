# Database & Workflow Integration

## Current Architecture (Disconnected)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React)                                                               │
│  - EventFeed, ReconciliationDashboard, AIDecisionPanel, XRPDashboard             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Vite proxy: /api → localhost:3001
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  EXPRESS BACKEND (Node/TS, port 3001)                                            │
│  - /api/events              → getEventsMock()          [MOCK]                    │
│  - /api/reconciliation-tasks → getReconciliationTasksMock() [MOCK]               │
│  - /api/decisions           → getDecisionsMock()        [MOCK]                    │
│  - /api/workflow            → runWorkflow()             [REAL: World News,       │
│                                                           Dedalus, Agentuity]    │
│  - /api/key-events          → events.store (in-memory) [IN-MEMORY]               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ NO CONNECTION
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SQLITE DATABASE (politifolio.db)                                                │
│  Tables: users, risk_scores, sanctions, transactions                             │
│  Used by: Python FastAPI (port 8000) - NOT called by frontend                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Gaps

### 1. SQLite is never used by the Express backend

- The frontend only talks to Express (port 3001).
- Express returns mocks for events, reconciliation-tasks, decisions.
- Workflow results are stored in `events.store.ts` (in-memory array).
- SQLite is used only by the Python FastAPI app (port 8000), which the frontend does not call.

### 2. API data format vs. database schema mismatch

| Express API / Store    | Data Shape                  | SQLite Table    | Match?         |
|------------------------|-----------------------------|------------------|---------------|
| /api/events            | GeopoliticalEvent           | (none)           | No            |
| /api/reconciliation-tasks | ReconciliationTask       | (none)           | No            |
| /api/decisions         | AIDecision                  | (none)           | No            |
| events.store (workflow) | KeyEvent (news, dedalus, reasoning, rebalance) | (none) | No  |
| Python /api/v1/transactions | tx_hash, sender, receiver, amount... | transactions | Yes |

The SQLite schema (users, risk_scores, sanctions, transactions) fits the **Python** XRP/transaction flow, not the **Express** geopolitical/workflow flow.

### 3. MCPs and the database

From `.cursor/mcp.json`:
- **Alpha Vantage MCP** – market data (sector performance, timeseries).

From `docs/ARCHITECTURE.md` (Dedalus MCPs, not in mcp.json):
- **geo-events** – news ingestion, geo normalization
- **market-data** – Alpha Vantage
- **portfolio-rules** – rebalancing

MCPs are used by the Cursor agent (or by services that call external APIs). They do not write to SQLite. The workflow controller calls World News API, Dedalus, Agentuity, and Financial Datasets directly – not via MCP.

## How to integrate SQLite with the workflow

### Option A: Express → SQLite (recommended)

Add a SQLite layer to the Express backend and persist workflow outputs:

1. **Schema for workflow data**:
   - `geo_events` – GeopoliticalEvent columns
   - `reconciliation_tasks` – ReconciliationTask columns
   - `key_events` – JSON for news, dedalus, reasoning, rebalance
   - `ai_decisions` – AIDecision columns

2. **Use `better-sqlite3`** (or Node `sqlite3`) in Express:
   - Replace mocks with `SELECT FROM geo_events ORDER BY timestamp DESC`
   - Replace `events.store` with `INSERT INTO key_events`
   - When workflow runs → `INSERT` into `geo_events` and `key_events`

3. **Single DB** for both Python and Express:
   - Share the same `politifolio.db` file
   - Or keep Python DB separate and only have Express use SQLite for its own data

### Option B: Python FastAPI as data service

- Keep Express as the main API for the frontend.
- Add Python endpoints that read/write SQLite.
- Express calls Python (e.g. `http://localhost:8000/api/v1/...`) for persistence.
- More moving parts and network calls.

### Option C: Use Dedalus Storage (per ARCHITECTURE.md)

- Store geo events, agent decisions, and rebalance rationale in Dedalus Storage.
- SQLite remains for users, sanctions, and XRP transactions.
- Requires Dedalus setup and API integration.

## Recommended next steps

1. Add `geo_events` and `key_events` tables to SQLite.
2. Add an Express SQLite service (e.g. `backend/src/services/sqlite.service.ts`).
3. Switch `events.controller` and `reconciliation-tasks.controller` from mocks to SQLite reads.
4. Switch `storeEvent()` in the workflow to write to SQLite.
5. Seed `geo_events` and `reconciliation_tasks` from mocks for initial data.
