import { useState } from 'react';
import { runWorkflow } from '@/services/api.service';
import { PolitifolioMapSimple } from '@/components/PolitifolioMapSimple';
import { EventFeed } from '@/components/EventFeed';
import { AIDecisionPanel } from '@/components/AIDecisionPanel';
import { XRPDashboard } from '@/components/XRPDashboard';
import { ReconciliationDashboard } from '@/components/ReconciliationDashboard';
import { ComplianceMonitor } from '@/components/ComplianceMonitor';
import { RiskAnalyticsDashboard } from '@/components/RiskAnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
// import { 
//   Globe, 
//   Radio, 
//   Brain, 
//   Activity, 
//   AlertCircle,
//   CheckCircle,
//   Zap,
//   FileCheck,
//   FileText,
//   BarChart3
// } from 'lucide-react';
// Mock Icons to bypass installation issues
const Globe = ({ className }: { className?: string }) => <span className={className}>🌐</span>;
const Radio = ({ className }: { className?: string }) => <span className={className}>📻</span>;
const Brain = ({ className }: { className?: string }) => <span className={className}>🧠</span>;
const Activity = ({ className }: { className?: string }) => <span className={className}>📈</span>;
const AlertCircle = ({ className }: { className?: string }) => <span className={className}>⚠️</span>;
const CheckCircle = ({ className }: { className?: string }) => <span className={className}>✅</span>;
const Zap = ({ className }: { className?: string }) => <span className={className}>⚡</span>;
const FileCheck = ({ className }: { className?: string }) => <span className={className}>📋</span>;
const FileText = ({ className }: { className?: string }) => <span className={className}>📄</span>;
const BarChart3 = ({ className }: { className?: string }) => <span className={className}>📊</span>;
import './index.css'

export default function App() {
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
    <div className="dark h-screen w-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      <Tabs defaultValue="map" className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shrink-0">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Logo & Title + Run Workflow */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-purple-500 to-blue-600 p-2 sm:p-2.5 rounded-xl">
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Politifolio
                    </h1>
                    <p className="text-xs text-zinc-400 hidden sm:block">Geopolitical Risk Intelligence Platform</p>
                  </div>
                </div>
                <button
                  onClick={handleRunWorkflow}
                  disabled={workflowRunning}
                  className="ml-2 sm:ml-4 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-colors shrink-0"
                >
                  {workflowRunning ? 'Running…' : 'Run Workflow'}
                </button>
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

                <div className="h-8 w-px bg-zinc-700"></div>

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

                <div className="h-8 w-px bg-zinc-700"></div>

                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Active
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - horizontally scrollable on small screens */}
          <div className="px-4 sm:px-6 overflow-x-auto scrollbar-thin">
            <TabsList className="bg-transparent border-b border-zinc-800 rounded-none h-auto p-0 w-max min-w-full justify-start flex-nowrap">
              <TabsTrigger 
                value="map" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0"
              >
                <Globe className="w-4 h-4 mr-2" />
                Global Risk Map
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0"
              >
                <Radio className="w-4 h-4 mr-2" />
                Live Events
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Decision Support
              </TabsTrigger>
              <TabsTrigger 
                value="xrp" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0"
              >
                <Activity className="w-4 h-4 mr-2" />
                POL Risk & Sentiment
              </TabsTrigger>
              <TabsTrigger 
                value="reconciliation" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Reconciliation
              </TabsTrigger>
              <TabsTrigger 
                value="compliance" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0"
              >
                <FileText className="w-4 h-4 mr-2" />
                Compliance Monitor
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 sm:px-6 py-3 data-[state=active]:text-white shrink-0"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Risk Analytics
              </TabsTrigger>
            </TabsList>
          </div>
        </header>

        {/* Tab Content - Scrollable container */}
        <div className="flex-1 min-h-0 overflow-auto">
          <TabsContent value="map" className="h-full min-h-[400px] m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <PolitifolioMapSimple 
              selectedEvent={selectedEvent} 
              onEventClick={(event: any) => setSelectedEvent(event?.id)}
            />
          </TabsContent>

          <TabsContent value="events" className="h-full min-h-[400px] m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <EventFeed />
          </TabsContent>

          <TabsContent value="ai" className="h-full min-h-[400px] m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <AIDecisionPanel />
          </TabsContent>

          <TabsContent value="xrp" className="h-full min-h-[400px] m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <XRPDashboard />
          </TabsContent>

          <TabsContent value="reconciliation" className="h-full min-h-[400px] m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ReconciliationDashboard />
          </TabsContent>

          <TabsContent value="compliance" className="h-full min-h-[400px] m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ComplianceMonitor />
          </TabsContent>

          <TabsContent value="analytics" className="h-full min-h-[400px] m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <RiskAnalyticsDashboard />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
