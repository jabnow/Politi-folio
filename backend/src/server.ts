import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })
import express from 'express'
import cors from 'cors'
import { getEvents } from './controllers/events.controller.js'
import { getReconciliation } from './controllers/reconciliation.controller.js'
import { getDecisions } from './controllers/decisions.controller.js'
import { runWorkflow } from './controllers/workflow.controller.js'
import { listKeyEvents, getKeyEvent } from './controllers/key-events.controller.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.get('/api/events', getEvents)
app.get('/api/reconciliation', getReconciliation)
app.get('/api/decisions', getDecisions)
app.get('/api/workflow', runWorkflow)
app.post('/api/workflow', runWorkflow)
app.get('/api/key-events', listKeyEvents)
app.get('/api/key-events/:id', getKeyEvent)

app.listen(PORT, () => {
  console.log(`Geopulse backend running at http://localhost:${PORT}`)
})
