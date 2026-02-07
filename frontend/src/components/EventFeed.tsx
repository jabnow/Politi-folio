import { useState, type HTMLAttributes } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
// import { AlertCircle, Globe, TrendingUp, FileText, Zap, Shield, Radio } from 'lucide-react';
const AlertCircle = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={className} {...props}>⚠️</span>;
const Globe = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={className} {...props}>🌐</span>;
const TrendingUp = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={className} {...props}>📈</span>;
const FileText = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={className} {...props}>📄</span>;
const Zap = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={className} {...props}>⚡</span>;
const Shield = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={className} {...props}>🛡️</span>;
const Radio = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={className} {...props}>📻</span>;

interface GeopoliticalEvent {
  id: number;
  timestamp: string;
  type: 'sanctions' | 'trade' | 'policy' | 'regulation' | 'political' | 'compliance';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  country: string;
  affectedTransactions: number;
  source: string;
}

const EVENT_FEED: GeopoliticalEvent[] = [
  {
    id: 1,
    timestamp: '2026-02-06 14:23:00',
    type: 'sanctions',
    severity: 'CRITICAL',
    title: 'New EU Sanctions on Russian Energy Sector',
    description: 'European Union announces comprehensive sanctions targeting Russian energy companies. All transactions with listed entities must be frozen immediately.',
    country: 'Russia',
    affectedTransactions: 125,
    source: 'EU Official Journal'
  },
  {
    id: 2,
    timestamp: '2026-02-06 14:18:00',
    type: 'trade',
    severity: 'HIGH',
    title: 'Belarus Trade Restrictions Extended',
    description: 'US Treasury extends trade restrictions on Belarus financial sector for additional 6 months. Enhanced due diligence required.',
    country: 'Belarus',
    affectedTransactions: 45,
    source: 'OFAC'
  },
  {
    id: 3,
    timestamp: '2026-02-06 14:12:00',
    type: 'regulation',
    severity: 'MEDIUM',
    title: 'ECB Updates AML Requirements',
    description: 'European Central Bank releases updated anti-money laundering guidelines for cross-border transactions exceeding €10,000.',
    country: 'EU',
    affectedTransactions: 234,
    source: 'ECB'
  },
  {
    id: 4,
    timestamp: '2026-02-06 14:05:00',
    type: 'policy',
    severity: 'MEDIUM',
    title: 'Fed Maintains Interest Rates',
    description: 'Federal Reserve maintains interest rates at 5.25-5.50%. Statement emphasizes continued focus on inflation management.',
    country: 'USA',
    affectedTransactions: 312,
    source: 'Federal Reserve'
  },
  {
    id: 5,
    timestamp: '2026-02-06 13:58:00',
    type: 'political',
    severity: 'HIGH',
    title: 'Political Instability in Brazil',
    description: 'Protests escalate in São Paulo. Increased country risk assessment recommended for Brazilian counterparties.',
    country: 'Brazil',
    affectedTransactions: 156,
    source: 'Reuters'
  },
  {
    id: 6,
    timestamp: '2026-02-06 13:45:00',
    type: 'compliance',
    severity: 'LOW',
    title: 'Singapore Updates Crypto Regulations',
    description: 'MAS clarifies compliance requirements for digital asset transactions. New reporting thresholds effective March 1.',
    country: 'Singapore',
    affectedTransactions: 23,
    source: 'MAS'
  },
  {
    id: 7,
    timestamp: '2026-02-06 13:32:00',
    type: 'sanctions',
    severity: 'MEDIUM',
    title: 'UK Adds Entities to Sanctions List',
    description: 'UK government adds 12 entities to consolidated sanctions list. Immediate screening of existing relationships required.',
    country: 'UK',
    affectedTransactions: 67,
    source: 'UK Treasury'
  }
];

export function EventFeed() {
  const [events] = useState(EVENT_FEED);
  const [filter, setFilter] = useState<'all' | 'CRITICAL' | 'HIGH'>('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sanctions': return <Shield className="w-4 h-4" />;
      case 'trade': return <Globe className="w-4 h-4" />;
      case 'policy': return <TrendingUp className="w-4 h-4" />;
      case 'regulation': return <FileText className="w-4 h-4" />;
      case 'political': return <AlertCircle className="w-4 h-4" />;
      case 'compliance': return <Zap className="w-4 h-4" />;
      default: return <Radio className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'LOW': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.severity === filter);

  return (
    <div className="min-h-full flex flex-col bg-zinc-950 p-4 overflow-auto">
      <Card className="bg-zinc-900 border-zinc-800 p-4 mb-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Radio className="w-5 h-5 text-purple-500 animate-pulse" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Live Event Feed</h2>
              <p className="text-xs text-zinc-400">Real-time geopolitical intelligence</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filter === 'all' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filter === 'CRITICAL' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilter('HIGH')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filter === 'HIGH' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              High
            </button>
          </div>
        </div>
      </Card>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2">
        <AnimatePresence>
          {filteredEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                    {getTypeIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-white text-sm leading-tight">
                        {event.title}
                      </h3>
                      <Badge variant="outline" className={`text-xs shrink-0 ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {event.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {event.affectedTransactions} affected
                        </span>
                      </div>
                      
                      <div className="text-xs text-zinc-500">
                        {event.timestamp}
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-zinc-800">
                      <span className="text-xs text-zinc-500">Source: </span>
                      <span className="text-xs text-zinc-400 font-medium">{event.source}</span>
                    </div>
                  </div>
                </div>

                {/* Action indicator for critical events */}
                {event.severity === 'CRITICAL' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-2 bg-red-500/5 border border-red-500/20 rounded flex items-center gap-2 text-xs text-red-400"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Automated workflow triggered - {event.affectedTransactions} transactions frozen</span>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <Card className="bg-zinc-900 border-zinc-800 p-4 mt-4 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{events.length}</div>
            <div className="text-xs text-zinc-400">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-500">
              {events.filter(e => e.severity === 'CRITICAL').length}
            </div>
            <div className="text-xs text-zinc-400">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-500">
              {events.filter(e => e.severity === 'HIGH').length}
            </div>
            <div className="text-xs text-zinc-400">High Risk</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {events.reduce((sum, e) => sum + e.affectedTransactions, 0)}
            </div>
            <div className="text-xs text-zinc-400">Affected Txns</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

