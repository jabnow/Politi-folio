import { useState } from 'react';
import { GeoPulseMapSimple } from '@/components/GeoPulseMapSimple';
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
const Globe = () => <span>🌐</span>;
const Radio = () => <span>📻</span>;
const Brain = () => <span>🧠</span>;
const Activity = () => <span>📈</span>;
const AlertCircle = () => <span>⚠️</span>;
const CheckCircle = () => <span>✅</span>;
const Zap = () => <span>⚡</span>;
const FileCheck = () => <span>📋</span>;
const FileText = () => <span>📄</span>;
const BarChart3 = () => <span>📊</span>;
import './index.css'

export default function App() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  return (
    <div className="dark h-screen w-screen bg-zinc-950 text-white overflow-hidden flex flex-col">
      <Tabs defaultValue="map" className="h-full flex flex-col">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-purple-500 to-blue-600 p-2.5 rounded-xl">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      GeoPulse
                    </h1>
                    <p className="text-xs text-zinc-400">Geopolitical Risk Intelligence Platform</p>
                  </div>
                </div>
              </div>

              {/* Real-time Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-xs text-zinc-400">Live Monitoring</span>
                </div>

                <div className="h-8 w-px bg-zinc-700"></div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-0.5">Events Today</div>
                    <div className="text-lg font-bold text-white">247</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-0.5">Critical</div>
                    <div className="text-lg font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      12
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-0.5">Flagged Txns</div>
                    <div className="text-lg font-bold text-orange-500">58</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 mb-0.5">Approved</div>
                    <div className="text-lg font-bold text-green-500 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
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

          {/* Navigation Tabs */}
          <div className="px-6">
            <TabsList className="bg-transparent border-b border-zinc-800 rounded-none h-auto p-0 w-full justify-start">
              <TabsTrigger 
                value="map" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 data-[state=active]:text-white"
              >
                <Globe className="w-4 h-4 mr-2" />
                Global Risk Map
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 data-[state=active]:text-white"
              >
                <Radio className="w-4 h-4 mr-2" />
                Live Events
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 data-[state=active]:text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Decision Support
              </TabsTrigger>
              <TabsTrigger 
                value="xrp" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 data-[state=active]:text-white"
              >
                <Activity className="w-4 h-4 mr-2" />
                XRP Ledger Monitor
              </TabsTrigger>
              <TabsTrigger 
                value="reconciliation" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 data-[state=active]:text-white"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Reconciliation
              </TabsTrigger>
              <TabsTrigger 
                value="compliance" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Compliance Monitor
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Risk Analytics
              </TabsTrigger>
            </TabsList>
          </div>
        </header>

        {/* Tab Content - Full height container */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="map" className="h-full m-0 data-[state=active]:flex">
            <GeoPulseMapSimple 
              selectedEvent={selectedEvent} 
              onEventClick={(event: any) => setSelectedEvent(event?.id)}
            />
          </TabsContent>

          <TabsContent value="events" className="h-full m-0 data-[state=active]:flex">
            <EventFeed />
          </TabsContent>

          <TabsContent value="ai" className="h-full m-0 data-[state=active]:flex">
            <AIDecisionPanel />
          </TabsContent>

          <TabsContent value="xrp" className="h-full m-0 data-[state=active]:flex">
            <XRPDashboard />
          </TabsContent>

          <TabsContent value="reconciliation" className="h-full m-0 data-[state=active]:flex">
            <ReconciliationDashboard />
          </TabsContent>

          <TabsContent value="compliance" className="h-full m-0 data-[state=active]:flex">
            <ComplianceMonitor />
          </TabsContent>

          <TabsContent value="analytics" className="h-full m-0 data-[state=active]:flex">
            <RiskAnalyticsDashboard />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
