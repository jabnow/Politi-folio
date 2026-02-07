import express from 'express'
import cors from 'cors'
import { getEvents } from './controllers/events.controller.js'
import { getReconciliation } from './controllers/reconciliation.controller.js'
import { getDecisions } from './controllers/decisions.controller.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.get('/api/events', getEvents)
app.get('/api/reconciliation', getReconciliation)
app.get('/api/decisions', getDecisions)

app.listen(PORT, () => {
  console.log(`Geopulse backend running at http://localhost:${PORT}`)
})
