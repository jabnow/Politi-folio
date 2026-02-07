import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchEvents, type GeopoliticalEvent } from '@/services/api.service';
import { AlertCircle, Globe, TrendingUp, FileText, Zap, Shield, Radio } from 'lucide-react';

export function EventFeed() {
  const [events, setEvents] = useState<GeopoliticalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    fetchEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  };
  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('politifolio-refresh', handler);
    return () => window.removeEventListener('politifolio-refresh', handler);
  }, []);
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
      default: return 'politifolio-badge-neutral';
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.severity === filter);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="text-zinc-400">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col p-4 overflow-auto">
      <Card className="p-4 mb-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <Radio className="w-5 h-5 text-purple-500 animate-pulse" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Live Event Feed</h2>
              <p className="text-xs text-zinc-400">Real-time geopolitical intelligence</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {(['all', 'CRITICAL', 'HIGH'] as const).map((f) => {
              const activeClass = f === 'all' ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]' : f === 'CRITICAL' ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.5)]';
              return (
                <motion.button
                  key={f}
                  onClick={() => setFilter(f)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-3 py-1 rounded text-xs transition-colors ${filter === f ? activeClass : 'politifolio-panel text-zinc-400 hover:bg-violet-600/20'}`}
                >
                  {f === 'all' ? 'All' : f === 'CRITICAL' ? 'Critical' : 'High'}
                </motion.button>
              );
            })}
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
              <Card className="p-4 hover:border-violet-500/40 transition-colors cursor-pointer">
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
                    
                    <div className="mt-2 pt-2 border-t border-white/10">
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
      <Card className="p-4 mt-4 shrink-0">
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

