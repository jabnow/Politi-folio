import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Download,
  Filter,
  RefreshCw,
  TrendingDown,
  Users,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchReconciliationTasks, type ReconciliationTask } from '@/services/api.service';
import { exportToPdf } from '@/lib/pdfExport';

export function ReconciliationDashboard() {
  const [tasks, setTasks] = useState<ReconciliationTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = () => {
    setLoading(true);
    fetchReconciliationTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTasks();
    const handler = () => loadTasks();
    window.addEventListener('politifolio-refresh', handler);
    return () => window.removeEventListener('politifolio-refresh', handler);
  }, []);
  const [filter, setFilter] = useState<'all' | 'processing' | 'completed' | 'requires_review'>('all');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleExportTask = async (task: ReconciliationTask) => {
    setExportingId(task.id);
    await exportToPdf(taskRefs.current[task.id] ?? null, `Reconciliation Report - ${task.eventType}`, [
      { label: 'Task ID', value: task.id },
      { label: 'Event Type', value: task.eventType },
      { label: 'Triggered By', value: task.triggeredBy },
      { label: 'Status', value: task.status },
      { label: 'Transactions Scanned', value: String(task.transactionsScanned) },
      { label: 'Flagged', value: String(task.transactionsFlagged) },
      { label: 'Reconciled', value: String(task.transactionsReconciled) },
      { label: 'Estimated Savings', value: `$${task.estimatedSavings}` },
    ]);
    setExportingId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'requires_review':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'requires_review':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const totalSavings = tasks.reduce((sum, t) => sum + t.estimatedSavings, 0);
  const totalReconciled = tasks.reduce((sum, t) => sum + t.transactionsReconciled, 0);
  const avgProcessingTime = 42; // seconds

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-zinc-950 p-4">
        <div className="text-zinc-400">Loading reconciliation tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col gap-4 p-4 bg-zinc-950 overflow-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Cost Savings Today</div>
              <div className="text-2xl font-bold text-green-500">${totalSavings.toLocaleString()}</div>
              <div className="text-xs text-zinc-500 mt-1">vs. manual processing</div>
            </div>
            <div className="bg-green-500/10 p-2 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Transactions Reconciled</div>
              <div className="text-2xl font-bold text-white">{totalReconciled.toLocaleString()}</div>
              <div className="text-xs text-green-500 mt-1">+12% from yesterday</div>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <FileCheck className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Avg Processing Time</div>
              <div className="text-2xl font-bold text-white">{avgProcessingTime}s</div>
              <div className="text-xs text-zinc-500 mt-1">Manual: ~4 hours</div>
            </div>
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Active Tasks</div>
              <div className="text-2xl font-bold text-white">
                {tasks.filter(t => t.status === 'processing').length}
              </div>
              <div className="text-xs text-orange-500 mt-1">
                {tasks.filter(t => t.status === 'requires_review').length} require review
              </div>
            </div>
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <RefreshCw className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-zinc-900 border-zinc-800 p-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">Filter:</span>
            <div className="flex gap-2">
              {(['all', 'processing', 'completed', 'requires_review'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    filter === f
                      ? 'bg-purple-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {f.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={loadTasks} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Reconciliation Tasks */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredTasks.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-zinc-900 border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
              <div ref={(el) => { if (el) taskRefs.current[task.id] = el; }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-semibold text-white">{task.eventType}</h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{task.status.replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {task.id}
                      </span>
                      <span>Triggered by: {task.triggeredBy}</span>
                      <span>Started: {task.startTime}</span>
                      {task.completionTime && (
                        <span className="text-green-500">Completed: {task.completionTime}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400 mb-1">Estimated Savings</div>
                    <div className="text-xl font-bold text-green-500">${task.estimatedSavings}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span>Reconciliation Progress</span>
                    <span>{task.transactionsReconciled} / {task.transactionsFlagged} transactions</span>
                  </div>
                  <Progress
                    value={(task.transactionsReconciled / task.transactionsFlagged) * 100}
                    className="h-2"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Scanned</div>
                    <div className="text-lg font-bold text-white">{task.transactionsScanned.toLocaleString()}</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Flagged</div>
                    <div className="text-lg font-bold text-orange-500">{task.transactionsFlagged}</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Reconciled</div>
                    <div className="text-lg font-bold text-green-500">{task.transactionsReconciled}</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Assigned To</div>
                    <div className="text-sm font-semibold text-purple-400">{task.assignedTo || 'Unassigned'}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleExportTask(task)}
                  disabled={exportingId === task.id}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportingId === task.id ? 'Exporting...' : 'Export Report'}
                </Button>
                {task.status === 'requires_review' && (
                  <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Users className="w-4 h-4 mr-2" />
                    Assign to Team
                  </Button>
                )}
              </div>
              {task.assignedTo === 'AI Engine' && task.status === 'completed' && (
                <div className="mt-3 p-2 bg-green-500/5 border border-green-500/20 rounded flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Fully automated - No human intervention required</span>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

