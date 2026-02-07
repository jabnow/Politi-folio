/**
 * SQLite service for Express - shares politifolio.db with Python backend.
 * Falls back to mocks when DB fails.
 */
import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { GeopoliticalEvent } from '../mocks/events.mock.js'
import type { ReconciliationTask } from '../mocks/reconciliation-tasks.mock.js'
import type { KeyEvent } from '../types/workflow.types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, '..', '..', 'politifolio.db')

let db: Database.Database | null = null

function getDb(): Database.Database | null {
  if (db) return db
  try {
    db = new Database(DB_PATH, { readonly: false })
    db.pragma('journal_mode = WAL')
    return db
  } catch {
    return null
  }
}

/** Ensure geo_events, reconciliation_tasks, key_events tables exist */
export function initTables(): void {
  const d = getDb()
  if (!d) return
  try {
    d.exec(`
      CREATE TABLE IF NOT EXISTS geo_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        country TEXT NOT NULL,
        affected_transactions INTEGER DEFAULT 0,
        source TEXT
      );
      CREATE TABLE IF NOT EXISTS reconciliation_tasks (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        triggered_by TEXT NOT NULL,
        status TEXT NOT NULL,
        transactions_scanned INTEGER DEFAULT 0,
        transactions_flagged INTEGER DEFAULT 0,
        transactions_reconciled INTEGER DEFAULT 0,
        start_time TEXT NOT NULL,
        completion_time TEXT,
        estimated_savings REAL DEFAULT 0,
        assigned_to TEXT,
        priority TEXT
      );
      CREATE TABLE IF NOT EXISTS key_events (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        news TEXT,
        dedalus TEXT,
        reasoning TEXT,
        estimates TEXT,
        rebalance TEXT
      );
    `)
  } catch {
    // ignore
  }
}

export function getGeoEvents(): GeopoliticalEvent[] | null {
  const d = getDb()
  if (!d) return null
  try {
    const rows = d.prepare(
      'SELECT id, timestamp, type, severity, title, description, country, affected_transactions AS affectedTransactions, source FROM geo_events ORDER BY timestamp DESC LIMIT 50'
    ).all() as Array<Record<string, unknown>>
    return rows.map((r) => ({
      id: r.id as number,
      timestamp: r.timestamp as string,
      type: r.type as GeopoliticalEvent['type'],
      severity: r.severity as GeopoliticalEvent['severity'],
      title: r.title as string,
      description: r.description as string,
      country: r.country as string,
      affectedTransactions: (r.affectedTransactions as number) ?? 0,
      source: (r.source as string) ?? '',
    }))
  } catch {
    return null
  }
}

export function getReconciliationTasks(): ReconciliationTask[] | null {
  const d = getDb()
  if (!d) return null
  try {
    const rows = d.prepare(
      'SELECT id, event_type AS eventType, triggered_by AS triggeredBy, status, transactions_scanned AS transactionsScanned, transactions_flagged AS transactionsFlagged, transactions_reconciled AS transactionsReconciled, start_time AS startTime, completion_time AS completionTime, estimated_savings AS estimatedSavings, assigned_to AS assignedTo, priority FROM reconciliation_tasks ORDER BY start_time DESC'
    ).all() as Array<Record<string, unknown>>
    return rows.map((r) => ({
      id: r.id as string,
      eventType: r.eventType as string,
      triggeredBy: r.triggeredBy as string,
      status: r.status as ReconciliationTask['status'],
      transactionsScanned: (r.transactionsScanned as number) ?? 0,
      transactionsFlagged: (r.transactionsFlagged as number) ?? 0,
      transactionsReconciled: (r.transactionsReconciled as number) ?? 0,
      startTime: r.startTime as string,
      completionTime: r.completionTime as string | undefined,
      estimatedSavings: (r.estimatedSavings as number) ?? 0,
      assignedTo: r.assignedTo as string | undefined,
      priority: r.priority as ReconciliationTask['priority'],
    }))
  } catch {
    return null
  }
}

export function getKeyEvents(limit: number): KeyEvent[] | null {
  const d = getDb()
  if (!d) return null
  try {
    const rows = d.prepare(
      'SELECT id, timestamp, news, dedalus, reasoning, estimates, rebalance FROM key_events ORDER BY timestamp DESC LIMIT ?'
    ).all(limit) as Array<Record<string, unknown>>
    return rows.map((r) => ({
      id: r.id as string,
      timestamp: r.timestamp as string,
      news: (r.news ? JSON.parse(r.news as string) : []) as KeyEvent['news'],
      dedalus: (r.dedalus ? JSON.parse(r.dedalus as string) : null) as KeyEvent['dedalus'],
      reasoning: (r.reasoning ? JSON.parse(r.reasoning as string) : null) as KeyEvent['reasoning'],
      estimates: (r.estimates ? JSON.parse(r.estimates as string) : {}) as KeyEvent['estimates'],
      rebalance: (r.rebalance ? JSON.parse(r.rebalance as string) : { adjustments: [] }) as KeyEvent['rebalance'],
    }))
  } catch {
    return null
  }
}

export function getKeyEventById(id: string): KeyEvent | null {
  const d = getDb()
  if (!d) return null
  try {
    const r = d.prepare(
      'SELECT id, timestamp, news, dedalus, reasoning, estimates, rebalance FROM key_events WHERE id = ?'
    ).get(id) as Record<string, unknown> | undefined
    if (!r) return null
    return {
      id: r.id as string,
      timestamp: r.timestamp as string,
      news: (r.news ? JSON.parse(r.news as string) : []) as KeyEvent['news'],
      dedalus: (r.dedalus ? JSON.parse(r.dedalus as string) : null) as KeyEvent['dedalus'],
      reasoning: (r.reasoning ? JSON.parse(r.reasoning as string) : null) as KeyEvent['reasoning'],
      estimates: (r.estimates ? JSON.parse(r.estimates as string) : {}) as KeyEvent['estimates'],
      rebalance: (r.rebalance ? JSON.parse(r.rebalance as string) : { adjustments: [] }) as KeyEvent['rebalance'],
    }
  } catch {
    return null
  }
}

export function insertGeoEvent(event: Omit<GeopoliticalEvent, 'id'>): GeopoliticalEvent | null {
  const d = getDb()
  if (!d) return null
  try {
    const stmt = d.prepare(
      'INSERT INTO geo_events (timestamp, type, severity, title, description, country, affected_transactions, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    const info = stmt.run(
      event.timestamp,
      event.type,
      event.severity,
      event.title,
      event.description,
      event.country,
      event.affectedTransactions,
      event.source
    )
    const id = info.lastInsertRowid as number
    return { ...event, id }
  } catch {
    return null
  }
}

export function insertReconciliationTask(task: ReconciliationTask): boolean {
  const d = getDb()
  if (!d) return false
  try {
    d.prepare(
      `INSERT OR REPLACE INTO reconciliation_tasks (id, event_type, triggered_by, status, transactions_scanned, transactions_flagged, transactions_reconciled, start_time, completion_time, estimated_savings, assigned_to, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      task.id,
      task.eventType,
      task.triggeredBy,
      task.status,
      task.transactionsScanned,
      task.transactionsFlagged,
      task.transactionsReconciled,
      task.startTime,
      task.completionTime ?? null,
      task.estimatedSavings,
      task.assignedTo ?? null,
      task.priority
    )
    return true
  } catch {
    return false
  }
}

export function storeKeyEvent(event: Omit<KeyEvent, 'id'>, id: string): KeyEvent | null {
  const d = getDb()
  if (!d) return null
  try {
    d.prepare(
      'INSERT INTO key_events (id, timestamp, news, dedalus, reasoning, estimates, rebalance) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      event.timestamp,
      JSON.stringify(event.news),
      event.dedalus ? JSON.stringify(event.dedalus) : null,
      event.reasoning ? JSON.stringify(event.reasoning) : null,
      JSON.stringify(event.estimates ?? {}),
      JSON.stringify(event.rebalance ?? { adjustments: [] })
    )
    return { ...event, id }
  } catch {
    return null
  }
}

export function countGeoEvents(): number {
  const d = getDb()
  if (!d) return 0
  try {
    const row = d.prepare('SELECT COUNT(*) as c FROM geo_events').get() as { c: number }
    return row?.c ?? 0
  } catch {
    return 0
  }
}

export function countReconciliationTasks(): number {
  const d = getDb()
  if (!d) return 0
  try {
    const row = d.prepare('SELECT COUNT(*) as c FROM reconciliation_tasks').get() as { c: number }
    return row?.c ?? 0
  } catch {
    return 0
  }
}

export function seedFromMocks(
  geoEvents: GeopoliticalEvent[],
  reconciliationTasks: ReconciliationTask[]
): void {
  const d = getDb()
  if (!d) return
  try {
    if (countGeoEvents() === 0) {
      const ins = d.prepare(
        'INSERT INTO geo_events (timestamp, type, severity, title, description, country, affected_transactions, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      for (const e of geoEvents) {
        ins.run(e.timestamp, e.type, e.severity, e.title, e.description, e.country, e.affectedTransactions, e.source)
      }
    }
    if (countReconciliationTasks() === 0) {
      const ins = d.prepare(
        `INSERT OR IGNORE INTO reconciliation_tasks (id, event_type, triggered_by, status, transactions_scanned, transactions_flagged, transactions_reconciled, start_time, completion_time, estimated_savings, assigned_to, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      for (const t of reconciliationTasks) {
        ins.run(t.id, t.eventType, t.triggeredBy, t.status, t.transactionsScanned, t.transactionsFlagged, t.transactionsReconciled, t.startTime, t.completionTime ?? null, t.estimatedSavings, t.assignedTo ?? null, t.priority)
      }
    }
  } catch {
    // ignore
  }
}
