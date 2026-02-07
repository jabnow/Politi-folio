import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  AlertTriangle,
  Shield,
  DollarSign,
  Globe,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

// Mock data for country risk exposure
const countryExposureData = [
  { country: 'USA', exposure: 4500000, risk: 15, color: '#10b981' },
  { country: 'UK', exposure: 3200000, risk: 18, color: '#22c55e' },
  { country: 'Germany', exposure: 2800000, risk: 12, color: '#84cc16' },
  { country: 'Singapore', exposure: 2100000, risk: 8, color: '#a3e635' },
  { country: 'Japan', exposure: 1900000, risk: 10, color: '#d9f99d' },
  { country: 'Brazil', exposure: 1500000, risk: 68, color: '#fb923c' },
  { country: 'China', exposure: 1200000, risk: 45, color: '#fdba74' },
  { country: 'Russia', exposure: 450000, risk: 95, color: '#dc2626' },
  { country: 'Belarus', exposure: 280000, risk: 78, color: '#f87171' }
];

// Risk score over time
const riskTrendData = [
  { date: '02/01', overall: 28, geopolitical: 35, credit: 22, market: 18 },
  { date: '02/02', overall: 30, geopolitical: 38, credit: 24, market: 19 },
  { date: '02/03', overall: 32, geopolitical: 42, credit: 25, market: 21 },
  { date: '02/04', overall: 35, geopolitical: 48, credit: 27, market: 23 },
  { date: '02/05', overall: 42, geopolitical: 58, credit: 30, market: 26 },
  { date: '02/06', overall: 47, geopolitical: 65, credit: 32, market: 28 }
];

// Sector exposure
const sectorData = [
  { name: 'Energy', value: 3200000, risk: 65, color: '#dc2626' },
  { name: 'Technology', value: 4800000, risk: 22, color: '#3b82f6' },
  { name: 'Finance', value: 5500000, risk: 28, color: '#8b5cf6' },
  { name: 'Manufacturing', value: 2400000, risk: 35, color: '#f59e0b' },
  { name: 'Healthcare', value: 1800000, risk: 15, color: '#10b981' }
];

// Risk factors radar
const riskFactorsData = [
  { factor: 'Sanctions', value: 75 },
  { factor: 'Political', value: 62 },
  { factor: 'Regulatory', value: 45 },
  { factor: 'Credit', value: 32 },
  { factor: 'Market', value: 38 },
  { factor: 'Operational', value: 28 }
];

export function RiskAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M'>('1W');

  const totalExposure = countryExposureData.reduce((sum, c) => sum + c.exposure, 0);
  const highRiskExposure = countryExposureData.filter(c => c.risk >= 60).reduce((sum, c) => sum + c.exposure, 0);
  const currentRiskScore = 47;
  const riskChange = 12;

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-zinc-950 overflow-y-auto">
      {/* Header KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Overall Risk Score</div>
              <div className="text-3xl font-bold text-orange-500">{currentRiskScore}</div>
            </div>
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-red-500">
            <TrendingUp className="w-4 h-4" />
            +{riskChange} from yesterday
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Total Exposure</div>
              <div className="text-3xl font-bold text-white">${(totalExposure / 1000000).toFixed(1)}M</div>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-xs text-zinc-400">Across {countryExposureData.length} countries</div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-zinc-400 mb-1">High-Risk Exposure</div>
              <div className="text-3xl font-bold text-red-500">${(highRiskExposure / 1000000).toFixed(1)}M</div>
            </div>
            <div className="bg-red-500/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="text-xs text-red-400">{((highRiskExposure / totalExposure) * 100).toFixed(1)}% of portfolio</div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Countries Monitored</div>
              <div className="text-3xl font-bold text-white">{countryExposureData.length}</div>
            </div>
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="text-xs text-orange-400">3 critical alerts</div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Risk Mitigation</div>
              <div className="text-3xl font-bold text-green-500">82%</div>
            </div>
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="text-xs text-green-400">Automated coverage</div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Risk Trend Chart */}
        <Card className="bg-zinc-900 border-zinc-800 p-4 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Risk Score Trend</h3>
              <p className="text-xs text-zinc-400">Multi-factor risk analysis over time</p>
            </div>
            <div className="flex gap-2">
              {(['1D', '1W', '1M', '3M'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    timeRange === range
                      ? 'bg-purple-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={riskTrendData}>
              <defs>
                <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGeopolitical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
              <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Legend />
              <Area type="monotone" dataKey="overall" stroke="#f97316" fill="url(#colorOverall)" name="Overall Risk" strokeWidth={2} />
              <Area type="monotone" dataKey="geopolitical" stroke="#dc2626" fill="url(#colorGeopolitical)" name="Geopolitical" strokeWidth={2} />
              <Area type="monotone" dataKey="credit" stroke="#3b82f6" fill="none" name="Credit" strokeWidth={1.5} />
              <Area type="monotone" dataKey="market" stroke="#10b981" fill="none" name="Market" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Factors Radar */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <h3 className="font-semibold text-white mb-4">Risk Factor Analysis</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={riskFactorsData}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis dataKey="factor" stroke="#a1a1aa" style={{ fontSize: '11px' }} />
              <PolarRadiusAxis stroke="#71717a" />
              <Radar name="Risk Level" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Country Exposure */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <h3 className="font-semibold text-white mb-4">Country Risk Exposure</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={countryExposureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" stroke="#71717a" style={{ fontSize: '11px' }} />
              <YAxis dataKey="country" type="category" stroke="#71717a" style={{ fontSize: '11px' }} width={80} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`}
              />
              <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                {countryExposureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sector Distribution */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <h3 className="font-semibold text-white mb-4">Sector Exposure Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* High Risk Countries Table */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">High-Risk Country Breakdown</h3>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            {countryExposureData.filter(c => c.risk >= 60).length} Critical
          </Badge>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs text-zinc-400 pb-3">Country</th>
                <th className="text-right text-xs text-zinc-400 pb-3">Exposure</th>
                <th className="text-right text-xs text-zinc-400 pb-3">% of Portfolio</th>
                <th className="text-center text-xs text-zinc-400 pb-3">Risk Score</th>
                <th className="text-left text-xs text-zinc-400 pb-3">Status</th>
                <th className="text-right text-xs text-zinc-400 pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {countryExposureData.map((country) => (
                <tr key={country.country} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-zinc-400" />
                      <span className="font-medium text-white">{country.country}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-white font-mono">
                    ${(country.exposure / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 text-right text-zinc-400">
                    {((country.exposure / totalExposure) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 text-center">
                    <Badge variant="outline" className={`${
                      country.risk >= 70 ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      country.risk >= 40 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      country.risk >= 20 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {country.risk}
                    </Badge>
                  </td>
                  <td className="py-3">
                    {country.risk >= 70 ? (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Critical
                      </Badge>
                    ) : country.risk >= 40 ? (
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
                        Review Required
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                        Monitored
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {country.risk >= 60 && (
                      <Button size="sm" variant="outline" className="text-xs">
                        Reduce Exposure
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

