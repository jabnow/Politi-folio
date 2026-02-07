import { ReconciliationDashboard } from './components/Dashboard/ReconciliationDashboard'
import { EventFeed } from './components/Dashboard/EventFeed'
import { RiskMonitor } from './components/Dashboard/RiskMonitor'
import { AIDecisionPanel } from './components/Decisions/AIDecisionPanel'
import { WorkflowActions } from './components/Decisions/WorkflowActions'
import './index.css'

function App() {
  return (
    <main className="app">
      <header>
        <h1>Geopulse</h1>
        <p>Geopolitical intelligence for XRP Ledger reconciliation</p>
      </header>

      <section className="dashboard">
        <ReconciliationDashboard />
        <EventFeed />
        <RiskMonitor />
        <AIDecisionPanel />
        <WorkflowActions />
      </section>
    </main>
  )
}

export default App
