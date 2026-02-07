import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { runWorkflow } from '@/services/api.service';
import { Scene3DBackground } from '@/components/Scene3DBackground';
import { PolitifolioMapSimple } from '@/components/PolitifolioMapSimple';
import { EventFeed } from '@/components/EventFeed';
import { AIDecisionPanel } from '@/components/AIDecisionPanel';
import { XRPDashboard } from '@/components/XRPDashboard';
import { ReconciliationDashboard } from '@/components/ReconciliationDashboard';
import { ComplianceMonitor } from '@/components/ComplianceMonitor';
import { RiskAnalyticsDashboard } from '@/components/RiskAnalyticsDashboard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Radio,
  Brain,
  Activity,
  AlertCircle,
  CheckCircle,
  Zap,
  FileCheck,
  FileText,
  BarChart3,
} from 'lucide-react';
import './index.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);

  const handleRunWorkflow = async () => {
    setWorkflowError(null);
    setWorkflowRunning(true);
    const result = await runWorkflow({ q: 'semiconductors', portfolio: ['NVDA', 'TSM', 'ASML'] });
    setWorkflowRunning(false);
    if (result.error) setWorkflowError(result.error);
  };

  return (
    <div className="dark h-screen w-screen text-white flex flex-col overflow-hidden relative">
      <div className="politifolio-bg" />
      <Suspense fallback={null}>
        <Scene3DBackground />
      </Suspense>
      <div className="politifolio-grid" />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Header */}
        <header
          className="border-b shrink-0 backdrop-blur-xl"
          style={{
            background: 'var(--gradient-header)',
            borderColor: 'rgba(99, 102, 241, 0.15)',
          }}
        >
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Logo & Title + Run Workflow */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                    <img
                      src="/logo.png"
                      alt="Politifolio"
                      className="relative w-9 h-9 sm:w-10 sm:h-10 object-contain"
                    />
                  </motion.div>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-bold gradient-text">
                      Politifolio
                    </h1>
                    <p className="text-xs text-zinc-400 hidden sm:block">Geopolitical Risk Intelligence Platform</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleRunWorkflow}
                  disabled={workflowRunning}
                  whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  className="ml-2 sm:ml-4 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-all shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 2px 12px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {workflowRunning ? 'Running…' : 'Run Workflow'}
                </motion.button>
                {workflowError && (
                  <span className="text-xs text-red-400 truncate max-w-[120px] sm:max-w-none" title={workflowError}>
                    {workflowError}
                  </span>
                )}
              </div>

              {/* Real-time Stats - hidden on small screens */}
              <div className="hidden lg:flex items-center gap-4 xl:gap-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-xs text-zinc-400">Live Monitoring</span>
                </div>

                <div className="h-8 w-px opacity-40" style={{ background: 'linear-gradient(180deg, transparent, rgba(99, 102, 241, 0.5), transparent)' }}></div>

                <div className="flex items-center gap-3 xl:gap-6">
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-0.5">Events Today</div>
                    <div className="text-base xl:text-lg font-bold text-white">247</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-0.5">Critical</div>
                    <div className="text-base xl:text-lg font-bold text-red-500 flex items-center gap-1 justify-center">
                      <AlertCircle className="w-3 h-3 xl:w-4 xl:h-4" />
                      12
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-0.5">Flagged Txns</div>
                    <div className="text-base xl:text-lg font-bold text-orange-500">58</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-0.5">Approved</div>
                    <div className="text-base xl:text-lg font-bold text-green-500 flex items-center gap-1 justify-center">
                      <CheckCircle className="w-3 h-3 xl:w-4 xl:h-4" />
                      189
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px opacity-40" style={{ background: 'linear-gradient(180deg, transparent, rgba(99, 102, 241, 0.5), transparent)' }}></div>

                <Badge
                  variant="outline"
                  className="text-cyan-400"
                  style={{
                    background: 'rgba(6, 182, 212, 0.12)',
                    borderColor: 'rgba(6, 182, 212, 0.35)',
                  }}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  AI Active
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - horizontally scrollable on small screens */}
          <div className="px-4 sm:px-6 overflow-x-auto scrollbar-thin">
            <TabsList
              className="bg-transparent border-b rounded-none h-auto p-0 w-max min-w-full justify-start flex-nowrap"
              style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }}
            >
              <TabsTrigger
                value="map"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <Globe className="w-4 h-4 mr-2" />
                Global Risk Map
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <Radio className="w-4 h-4 mr-2" />
                Live Events
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Decision Support
              </TabsTrigger>
              <TabsTrigger
                value="xrp"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <Activity className="w-4 h-4 mr-2" />
                POL Risk & Sentiment
              </TabsTrigger>
              <TabsTrigger
                value="reconciliation"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Reconciliation
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Compliance Monitor
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Risk Analytics
              </TabsTrigger>
            </TabsList>
          </div>
        </header>

        {/* Tab Content - Scrollable container with transitions */}
        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex-1 flex flex-col min-h-0 min-h-[400px] w-full"
            >
              {activeTab === 'map' && (
                <PolitifolioMapSimple
                  selectedEvent={selectedEvent}
                  onEventClick={(event: any) => setSelectedEvent(event?.id)}
                />
              )}
              {activeTab === 'events' && <EventFeed />}
              {activeTab === 'ai' && <AIDecisionPanel />}
              {activeTab === 'xrp' && <XRPDashboard />}
              {activeTab === 'reconciliation' && <ReconciliationDashboard />}
              {activeTab === 'compliance' && <ComplianceMonitor />}
              {activeTab === 'analytics' && <RiskAnalyticsDashboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}
