import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })
import express from 'express'
import cors from 'cors'
import { getEvents } from './controllers/events.controller.js'
import { getReconciliation, postRebalance } from './controllers/reconciliation.controller.js'
import { getReconciliationTasks } from './controllers/reconciliation-tasks.controller.js'
import { getNewsSummary } from './controllers/news-summary.controller.js'
import { getDecisions } from './controllers/decisions.controller.js'
import { runWorkflow } from './controllers/workflow.controller.js'
import { listKeyEvents, getKeyEvent } from './controllers/key-events.controller.js'
import {
  getBalance,
  getTransactions,
  getPolBalance,
  getRlusdBalance,
  getPolIssuer,
  getPolRiskSentimentHandler,
  createEscrow,
  finishEscrow,
  cancelEscrow,
  listEscrows,
  issueToken,
} from './controllers/xrpl.controller.js'
import {
  submitReport,
  listReports,
  getReport,
  voteOnReport,
  claimRewards,
} from './controllers/intelligence.controller.js'
import { initTables, seedFromMocks } from './services/sqlite.service.js'
import { getEventsMock } from './mocks/events.mock.js'
import { getReconciliationTasksMock } from './mocks/reconciliation-tasks.mock.js'

const app = express()

// Initialize SQLite tables and seed from mocks if empty
try {
  initTables()
  seedFromMocks(getEventsMock(), getReconciliationTasksMock())
} catch {
  /* DB optional - mocks used as fallback */
}
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.get('/api/events', getEvents)
app.get('/api/reconciliation', getReconciliation)
app.get('/api/reconciliation-tasks', getReconciliationTasks)
app.get('/api/news-summary', getNewsSummary)
app.get('/api/decisions', getDecisions)
app.get('/api/workflow', runWorkflow)
app.post('/api/workflow', runWorkflow)
app.get('/api/key-events', listKeyEvents)
app.get('/api/key-events/:id', getKeyEvent)

// XRPL Ledger API
app.get('/api/xrpl/balance', getBalance)
app.get('/api/xrpl/transactions', getTransactions)
app.get('/api/xrpl/pol/issuer', getPolIssuer)
app.get('/api/xrpl/pol/balance', getPolBalance)
app.get('/api/xrpl/pol/risk-sentiment', getPolRiskSentimentHandler)
app.get('/api/xrpl/rlusd/balance', getRlusdBalance)
app.post('/api/xrpl/escrow/create', createEscrow)
app.post('/api/xrpl/escrow/finish', finishEscrow)
app.post('/api/xrpl/escrow/cancel', cancelEscrow)
app.get('/api/xrpl/escrow/list', listEscrows)
app.post('/api/xrpl/issue-token', issueToken)

// Intelligence Report API - Phase 2
app.post('/api/reports/submit', submitReport)
app.get('/api/reports', listReports)
app.get('/api/reports/:id', getReport)
app.post('/api/reports/:id/vote', voteOnReport)
app.post('/api/reports/:id/rewards/claim', claimRewards)

/** Health check for connection testing */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, port: PORT, timestamp: new Date().toISOString() })
})

// #region agent log (optional logging)
const logPath = process.env.DEBUG_LOG_PATH || '.cursor/debug.log';
const log = (msg: string, data: object) => {
  try {
    if (process.env.DEBUG_LOG_ENABLED === 'true') {
      fs.appendFileSync(logPath, JSON.stringify({ location: 'server.ts:listen', message: msg, data, timestamp: Date.now() }) + '\n');
    }
  } catch (_) {}
};
// #endregion
const server = app.listen(PORT, () => {
  log('backend listen success', { port: PORT });
  console.log(`Politifolio backend running at http://localhost:${PORT}`)
})
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env`)
  } else {
    console.error('Server error:', err)
  }
  process.exit(1)
})
