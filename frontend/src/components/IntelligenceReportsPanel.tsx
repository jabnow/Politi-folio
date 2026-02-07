/**
 * Intelligence Reports Panel
 * Shows geopolitical intelligence reports with risk scores, staking, and voting
 * Works alongside the RiskAnalyticsDashboard to provide dynamic XRPL-integrated features
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  Coins,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import type { IntelligenceReport } from '@/types';
import { listIntelligenceReports } from '@/services/xrplApi.service';

interface IntelligenceReportsPanelProps {
  selectedCountries?: string[];
  onReportSelect?: (report: IntelligenceReport) => void;
}

export function IntelligenceReportsPanel({
  onReportSelect,
}: IntelligenceReportsPanelProps) {
  const [reports, setReports] = useState<IntelligenceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<'all' | 'pending' | 'verified' | 'disputed'>('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listIntelligenceReports(
          activeStatus === 'all' ? undefined : activeStatus,
          10,
          0
        );
        setReports(response.reports || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [activeStatus]);

  const getRiskColor = (score?: number) => {
    if (score === undefined) return 'text-gray-400';
    if (score >= 75) return 'text-red-500';
    if (score >= 55) return 'text-orange-500';
    if (score >= 35) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBg = (score?: number) => {
    if (score === undefined) return 'bg-gray-900/50';
    if (score >= 75) return 'bg-red-900/20';
    if (score >= 55) return 'bg-orange-900/20';
    if (score >= 35) return 'bg-yellow-900/20';
    return 'bg-green-900/20';
  };

  const getStatusIcon = (status: IntelligenceReport['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disputed':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Intelligence Reports</h3>
          <Badge variant="secondary">{reports.length}</Badge>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'pending', 'verified', 'disputed'] as const).map((status) => (
            <Button
              key={status}
              variant={activeStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveStatus(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="bg-red-900/20 border-red-800 p-4">
          <div className="text-red-300 text-sm">{error}</div>
        </Card>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <Card className="bg-slate-900/50 border-slate-800 p-8 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No reports yet. Be the first to submit intelligence!</p>
        </Card>
      )}

      {/* Reports */}
      <div className="space-y-3">
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:border-purple-500/50 ${getRiskBg(report.riskAssessment?.geopoliticalScore)}`}
              onClick={() => onReportSelect?.(report)}
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                      {report.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{report.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusIcon(report.status)}
                    <Badge
                      variant={report.status === 'verified' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {report.status}
                    </Badge>
                  </div>
                </div>

                {/* Countries & Risk */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">{report.countries.join(', ')}</span>
                  </div>
                  {report.riskAssessment && (
                    <div className={`font-bold ${getRiskColor(report.riskAssessment.geopoliticalScore)}`}>
                      {report.riskAssessment.geopoliticalScore}
                      <span className="text-xs text-gray-400 ml-1">risk</span>
                    </div>
                  )}
                </div>

                {/* Impact & Date */}
                <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-slate-400">
                  <span className="capitalize bg-slate-800/50 px-2 py-1 rounded">
                    {report.impactType}
                  </span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Risk breakdown */}
                {report.riskAssessment && (
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <div className="bg-slate-800/30 rounded p-2 text-center">
                      <div className="text-slate-400">Geo</div>
                      <div className="text-purple-400 font-semibold">
                        {report.riskAssessment.geopoliticalScore}
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-2 text-center">
                      <div className="text-slate-400">Eco</div>
                      <div className="text-blue-400 font-semibold">
                        {report.riskAssessment.economicImpact}
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-2 text-center">
                      <div className="text-slate-400">Mil</div>
                      <div className="text-orange-400 font-semibold">
                        {report.riskAssessment.militaryRisk}
                      </div>
                    </div>
                  </div>
                )}

                {/* Staking & Voting */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1 text-sm">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">{report.stakedPol} POL staked</span>
                  </div>

                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-green-900/30">
                      <ThumbsUp className="w-3.5 h-3.5 text-green-400" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-900/30">
                      <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Sanctions */}
                {report.riskAssessment?.sanctionsHit && (
                  <div className="bg-red-900/30 border border-red-800 rounded px-2 py-1 mt-2 flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-300">Sanctions hit detected</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {reports.length > 0 && (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => {
            // TODO: implement pagination / load more
          }}
        >
          Load More Reports
        </Button>
      )}
    </div>
  );
}

export default IntelligenceReportsPanel;