import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
// import { 
//   Shield, 
//   FileText, 
//   CheckCircle, 
//   XCircle,
//   Clock,
//   Download,
//   Eye,
//   Zap,
//   Globe,
//   BookOpen
// } from 'lucide-react';
const Shield = () => <span>🛡️</span>;
const FileText = () => <span>📄</span>;
const CheckCircle = () => <span>✅</span>;
const XCircle = () => <span>❌</span>;
const Clock = () => <span>🕒</span>;
const Download = () => <span>⬇️</span>;
const Eye = () => <span>👁️</span>;
const Zap = () => <span>⚡</span>;
const Globe = () => <span>🌐</span>;
const BookOpen = () => <span>📖</span>;
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { exportToPdf } from '@/lib/pdfExport';

interface ComplianceDocument {
  id: string;
  title: string;
  type: 'regulation' | 'sanction' | 'policy' | 'guideline';
  source: string;
  publishDate: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractedRequirements: number;
  affectedProducts: string[];
  implementationDeadline: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  jurisdiction: string;
  confidence: number;
}

const MOCK_DOCUMENTS: ComplianceDocument[] = [
  {
    id: 'DOC-001',
    title: 'EU Sanctions Package - Russian Energy Sector',
    type: 'sanction',
    source: 'EU Official Journal',
    publishDate: '2026-02-05',
    processingStatus: 'completed',
    extractedRequirements: 23,
    affectedProducts: ['Energy Trading', 'Cross-border Payments', 'Derivatives'],
    implementationDeadline: '2026-02-07',
    impact: 'critical',
    jurisdiction: 'EU',
    confidence: 98
  },
  {
    id: 'DOC-002',
    title: 'ECB Anti-Money Laundering Guidelines Update',
    type: 'regulation',
    source: 'European Central Bank',
    publishDate: '2026-02-06',
    processingStatus: 'processing',
    extractedRequirements: 47,
    affectedProducts: ['Cross-border Payments', 'Currency Exchange', 'KYC Procedures'],
    implementationDeadline: '2026-03-01',
    impact: 'high',
    jurisdiction: 'EU',
    confidence: 92
  },
  {
    id: 'DOC-003',
    title: 'OFAC Belarus Trade Restrictions Extension',
    type: 'sanction',
    source: 'US Treasury - OFAC',
    publishDate: '2026-02-06',
    processingStatus: 'completed',
    extractedRequirements: 12,
    affectedProducts: ['Trade Finance', 'Foreign Exchange'],
    implementationDeadline: '2026-02-08',
    impact: 'high',
    jurisdiction: 'USA',
    confidence: 96
  },
  {
    id: 'DOC-004',
    title: 'Basel III Capital Requirements Update',
    type: 'regulation',
    source: 'Basel Committee',
    publishDate: '2026-02-04',
    processingStatus: 'completed',
    extractedRequirements: 156,
    affectedProducts: ['Risk Management', 'Capital Allocation', 'Lending'],
    implementationDeadline: '2026-06-01',
    impact: 'medium',
    jurisdiction: 'Global',
    confidence: 94
  },
  {
    id: 'DOC-005',
    title: 'Singapore MAS Digital Asset Guidelines',
    type: 'guideline',
    source: 'Monetary Authority of Singapore',
    publishDate: '2026-02-03',
    processingStatus: 'completed',
    extractedRequirements: 34,
    affectedProducts: ['Crypto Trading', 'Digital Assets', 'Custody Services'],
    implementationDeadline: '2026-03-01',
    impact: 'medium',
    jurisdiction: 'Singapore',
    confidence: 89
  }
];

const complianceScoreData = [
  { month: 'Aug', score: 87 },
  { month: 'Sep', score: 89 },
  { month: 'Oct', score: 91 },
  { month: 'Nov', score: 88 },
  { month: 'Dec', score: 92 },
  { month: 'Jan', score: 94 },
  { month: 'Feb', score: 96 }
];

// Jurisdiction coverage varies per selected document
const getJurisdictionData = (jurisdiction: string) => {
  const base = { EU: 35, USA: 28, UK: 15, APAC: 22 };
  const colors: Record<string, string> = { EU: '#3b82f6', USA: '#8b5cf6', UK: '#06b6d4', APAC: '#10b981' };
  const focusMap: Record<string, Record<string, number>> = {
    EU: { EU: 52, USA: 22, UK: 14, APAC: 12 },
    USA: { EU: 25, USA: 48, UK: 15, APAC: 12 },
    UK: { EU: 38, USA: 28, UK: 24, APAC: 10 },
    Singapore: { EU: 28, USA: 26, UK: 14, APAC: 32 },
    Global: { EU: 30, USA: 28, UK: 18, APAC: 24 }
  };
  const values = focusMap[jurisdiction] ?? base;
  return [
    { name: 'EU', value: values.EU, color: colors.EU },
    { name: 'USA', value: values.USA, color: colors.USA },
    { name: 'UK', value: values.UK, color: colors.UK },
    { name: 'APAC', value: values.APAC, color: colors.APAC }
  ];
};

export function ComplianceMonitor() {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<ComplianceDocument | null>(documents[0]);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportAnalysis = async () => {
    if (!selectedDoc) return;
    setExporting(true);
    await exportToPdf(exportRef.current, `Compliance Analysis - ${selectedDoc.title}`, [
      { label: 'Document', value: selectedDoc.title },
      { label: 'Source', value: selectedDoc.source },
      { label: 'Jurisdiction', value: selectedDoc.jurisdiction },
      { label: 'Impact', value: selectedDoc.impact },
      { label: 'Requirements Extracted', value: String(selectedDoc.extractedRequirements) },
      { label: 'AI Confidence', value: `${selectedDoc.confidence}%` },
    ]);
    setExporting(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'regulation': return <FileText className="w-4 h-4" />;
      case 'sanction': return <Shield className="w-4 h-4" />;
      case 'policy': return <BookOpen className="w-4 h-4" />;
      case 'guideline': return <Globe className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="min-h-full flex flex-col lg:flex-row gap-4 p-4 bg-zinc-950 overflow-auto">
      {/* Left Panel - Document List */}
      <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 lg:shrink">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-white">Compliance Documents</h3>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-xs text-zinc-400 mb-1">Overall Score</div>
              <div className="text-2xl font-bold text-green-500">96%</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-xs text-zinc-400 mb-1">Critical Items</div>
              <div className="text-2xl font-bold text-red-500">3</div>
            </div>
          </div>
        </Card>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedDoc(doc)}
            >
              <Card className={`p-3 cursor-pointer transition-colors ${
                selectedDoc?.id === doc.id
                  ? 'bg-zinc-800 border-purple-500'
                  : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50'
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  <div className={`p-1.5 rounded ${getImpactColor(doc.impact)}`}>
                    {getTypeIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-xs ${getImpactColor(doc.impact)}`}>
                        {doc.impact.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {doc.jurisdiction}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">{doc.source}</span>
                      {getStatusIcon(doc.processingStatus)}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Compliance Score Trend */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Compliance Score Trend</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={complianceScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#71717a" style={{ fontSize: '10px' }} />
              <YAxis stroke="#71717a" style={{ fontSize: '10px' }} domain={[80, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Right Panel - Document Details */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">
        {selectedDoc && (
          <>
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${getImpactColor(selectedDoc.impact)}`}>
                      {getTypeIcon(selectedDoc.type)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedDoc.title}</h2>
                      <p className="text-sm text-zinc-400">{selectedDoc.source}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getImpactColor(selectedDoc.impact)}>
                      {selectedDoc.impact.toUpperCase()} IMPACT
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {getStatusIcon(selectedDoc.processingStatus)}
                      <span className="ml-1">{selectedDoc.processingStatus.toUpperCase()}</span>
                    </Badge>
                    <span className="text-sm text-zinc-400">Published: {selectedDoc.publishDate}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-zinc-400 mb-1">AI Confidence</div>
                  <div className="text-3xl font-bold text-purple-500">{selectedDoc.confidence}%</div>
                </div>
              </div>

              {/* AI Processing Status */}
              {selectedDoc.processingStatus === 'processing' && (
                <div className="mb-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                    <span className="text-sm font-semibold text-blue-400">AI Processing Document...</span>
                  </div>
                  <Progress value={67} className="h-2 mb-2" />
                  <p className="text-xs text-zinc-400">Extracting compliance requirements and analyzing impact...</p>
                </div>
              )}

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="text-xs text-zinc-400 mb-1">Jurisdiction</div>
                  <div className="text-lg font-bold text-white">{selectedDoc.jurisdiction}</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="text-xs text-zinc-400 mb-1">Requirements Extracted</div>
                  <div className="text-lg font-bold text-purple-500">{selectedDoc.extractedRequirements}</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="text-xs text-zinc-400 mb-1">Deadline</div>
                  <div className="text-lg font-bold text-orange-500">{selectedDoc.implementationDeadline}</div>
                </div>
              </div>

              {/* Affected Products */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-3">Affected Products & Services</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDoc.affectedProducts.map((product, idx) => (
                    <Badge key={idx} variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI-Extracted Requirements Preview */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  AI-Extracted Key Requirements
                </h3>
                <div className="space-y-2">
                  {[
                    'All transactions with listed entities must be frozen within 24 hours',
                    'Enhanced due diligence required for transactions exceeding €10,000',
                    'Quarterly reporting to regulatory authorities mandatory',
                    'Beneficial ownership verification for all new counterparties',
                    'Real-time screening against updated sanctions lists'
                  ].slice(0, selectedDoc.extractedRequirements > 5 ? 5 : selectedDoc.extractedRequirements).map((req, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-300">{req}</span>
                    </motion.div>
                  ))}
                  {selectedDoc.extractedRequirements > 5 && (
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Eye className="w-4 h-4 mr-2" />
                      View All {selectedDoc.extractedRequirements} Requirements
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Generate Compliance Checklist
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleExportAnalysis} disabled={exporting}>
                  <Download className="w-4 h-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export Analysis'}
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Source
                </Button>
              </div>
            </Card>

            {/* Impact Analysis - captured for PDF export */}
            <div ref={exportRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <h3 className="text-sm font-semibold text-white mb-4">Regulatory Coverage by Jurisdiction</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getJurisdictionData(selectedDoc.jurisdiction)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getJurisdictionData(selectedDoc.jurisdiction).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <h3 className="text-sm font-semibold text-white mb-4">Automation Impact</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-400">Manual Processing Time</span>
                      <span className="font-semibold text-white">~4 hours</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-400">AI Processing Time</span>
                      <span className="font-semibold text-green-500">~30 seconds</span>
                    </div>
                    <Progress value={2} className="h-2" />
                  </div>
                  <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                    <div className="text-xs text-zinc-400 mb-1">Cost Savings</div>
                    <div className="text-2xl font-bold text-green-500">$3,200</div>
                    <div className="text-xs text-zinc-500">per document processed</div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

