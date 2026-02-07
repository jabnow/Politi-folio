/**
 * Verify SQLite tables are populated and data format is correct.
 * Run: npx tsx scripts/verify_sqlite.ts
 */
import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { getEventsMock } from '../src/mocks/events.mock.js'
import { getReconciliationTasksMock } from '../src/mocks/reconciliation-tasks.mock.js'
import { initTables, seedFromMocks, getGeoEvents, getReconciliationTasks } from '../src/services/sqlite.service.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, '..', 'politifolio.db')

function main() {
  console.log('DB path:', DB_PATH)
  console.log('')

  // 1. Init and seed
  initTables()
  seedFromMocks(getEventsMock(), getReconciliationTasksMock())

  // 2. Query raw DB
  const db = new Database(DB_PATH, { readonly: true })
  const geoCount = (db.prepare('SELECT COUNT(*) as c FROM geo_events').get() as { c: number }).c
  const recCount = (db.prepare('SELECT COUNT(*) as c FROM reconciliation_tasks').get() as { c: number }).c
  const keyCount = (db.prepare('SELECT COUNT(*) as c FROM key_events').get() as { c: number }).c
  console.log('Row counts:')
  console.log('  geo_events:', geoCount)
  console.log('  reconciliation_tasks:', recCount)
  console.log('  key_events:', keyCount)
  console.log('')

  // 3. Sample geo_events
  if (geoCount > 0) {
    const row = db.prepare('SELECT * FROM geo_events LIMIT 1').get() as Record<string, unknown>
    console.log('geo_events sample (raw):', JSON.stringify(row, null, 2))
    const expected = ['id', 'timestamp', 'type', 'severity', 'title', 'description', 'country', 'affected_transactions', 'source']
    const hasAll = expected.every((k) => k in row)
    console.log('  Has all columns:', hasAll)
  }
  console.log('')

  // 4. Sample reconciliation_tasks
  if (recCount > 0) {
    const row = db.prepare('SELECT * FROM reconciliation_tasks LIMIT 1').get() as Record<string, unknown>
    console.log('reconciliation_tasks sample (raw):', JSON.stringify(row, null, 2))
  }
  console.log('')

  // 5. Service layer format (camelCase for frontend)
  const events = getGeoEvents()
  const tasks = getReconciliationTasks()
  console.log('Service getGeoEvents() format:', events?.[0] ? JSON.stringify(events[0], null, 2) : 'null')
  console.log('  affectedTransactions (camelCase):', events?.[0] && 'affectedTransactions' in events[0])
  console.log('')
  console.log('Service getReconciliationTasks() format:', tasks?.[0] ? JSON.stringify(tasks[0], null, 2) : 'null')
  console.log('  eventType, triggeredBy (camelCase):', tasks?.[0] && 'eventType' in tasks[0] && 'triggeredBy' in tasks[0])

  db.close()
  console.log('')
  console.log('Verification complete.')
}

main()
