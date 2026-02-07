import { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import Globe from 'react-globe.gl';
// import { Card } from '@/components/ui/card';
import type { GeopoliticalEvent, Transaction, CountryRisk } from '../types';
// import { useTheme } from '@/components/theme-provider'; 
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup
} from 'react-simple-maps';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';

// Mock Data (re-using your existing mocks or importing them if they were in a separate file)
// Since we are replacing the file content, I will include the mocks here to ensure it works immediately.
// In a real app, these should come from props.

interface AIEnhancedEvent extends GeopoliticalEvent {
  aiRecommendation: string;
}

const MOCK_EVENTS: AIEnhancedEvent[] = [
  {
    id: 1,
    title: 'New EU Sanctions on Russian Energy',
    description: 'Comprehensive sanctions targeting energy sector.',
    severity: 'CRITICAL',
    type: 'sanctions',
    country: 'Russia',
    location: { lat: 61.5240, lng: 105.3188 },
    timestamp: '2026-02-06T14:23:00',
    affectedTransactions: 125,
    source: 'EU Official Journal',
    aiRecommendation: 'Freeze all transactions with listed entities immediately.'
  },
  {
    id: 2,
    title: 'Belarus Trade Restrictions',
    description: 'Extended trade restrictions on financial sector.',
    severity: 'HIGH',
    type: 'trade',
    country: 'Belarus',
    location: { lat: 53.7098, lng: 27.9534 },
    timestamp: '2026-02-06T14:18:00',
    affectedTransactions: 45,
    source: 'OFAC',
    aiRecommendation: 'Enhanced due diligence required for all new trades.'
  },
  {
    id: 3,
    title: 'Political Instability in Brazil',
    description: 'Protests escalating in major cities.',
    severity: 'HIGH',
    type: 'political',
    country: 'Brazil',
    location: { lat: -14.2350, lng: -51.9253 },
    timestamp: '2026-02-06T13:58:00',
    affectedTransactions: 156,
    source: 'Reuters',
    aiRecommendation: 'Monitor local currency volatility and delay non-urgent transfers.'
  },
  {
    id: 4,
    title: 'Singapore Crypto Regulations',
    description: 'New compliance requirements for digital assets.',
    severity: 'LOW',
    type: 'regulation',
    country: 'Singapore',
    location: { lat: 1.3521, lng: 103.8198 },
    timestamp: '2026-02-06T13:45:00',
    affectedTransactions: 23,
    source: 'MAS',
    aiRecommendation: 'Update compliance checklists to reflect new reporting thresholds.'
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX001',
    amount: 125000,
    currency: 'USD',
    location: { lat: 55.7558, lng: 37.6173 }, // Moscow
    riskLevel: 'CRITICAL',
    status: 'flagged',
    timestamp: '2026-02-06T14:23:15'
  },
  {
    id: 'TX002',
    amount: 50000,
    currency: 'EUR',
    location: { lat: 52.5200, lng: 13.4050 }, // Berlin
    riskLevel: 'LOW',
    status: 'approved',
    timestamp: '2026-02-06T14:20:00'
  },
  {
    id: 'TX003',
    amount: 245000,
    currency: 'USD',
    location: { lat: -23.5505, lng: -46.6333 }, // Sao Paulo
    riskLevel: 'HIGH',
    status: 'pending',
    timestamp: '2026-02-06T14:15:00'
  },
  {
    id: 'TX004',
    amount: 75000,
    currency: 'SGD',
    location: { lat: 1.3521, lng: 103.8198 }, // Singapore
    riskLevel: 'LOW',
    status: 'approved',
    timestamp: '2026-02-06T14:10:00'
  },
  {
    id: 'TX005',
    amount: 180000,
    currency: 'GBP',
    location: { lat: 40.7128, lng: -74.0060 }, // New York
    riskLevel: 'MEDIUM',
    status: 'approved',
    timestamp: '2026-02-06T14:05:00'
  }
];

const MOCK_COUNTRY_RISKS: CountryRisk[] = [
  {
    country: 'Russia',
    code: 'RU',
    riskScore: 95,
    location: { lat: 61.5240, lng: 105.3188 },
    riskFactors: { political: 90, economic: 85, regulatory: 95 }
  },
  {
    country: 'Belarus',
    code: 'BY',
    riskScore: 78,
    location: { lat: 53.7098, lng: 27.9534 },
    riskFactors: { political: 80, economic: 75, regulatory: 80 }
  },
  {
    country: 'Brazil',
    code: 'BR',
    riskScore: 65,
    location: { lat: -14.2350, lng: -51.9253 },
    riskFactors: { political: 70, economic: 60, regulatory: 50 }
  },
  {
    country: 'China',
    code: 'CN',
    riskScore: 45,
    location: { lat: 35.8617, lng: 104.1954 },
    riskFactors: { political: 50, economic: 40, regulatory: 60 }
  },
  {
    country: 'USA',
    code: 'US',
    riskScore: 15,
    location: { lat: 37.0902, lng: -95.7129 },
    riskFactors: { political: 20, economic: 10, regulatory: 15 }
  }
];

// GeoJSON URL for the world map
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Re-implementing the 2D Map Logic using React Simple Maps
function Map2DView({
  events,
  transactions,
  countryRisks,
  onEventClick,
  setHoveredInfo
}: {
  events: AIEnhancedEvent[];
  transactions: Transaction[];
  countryRisks: CountryRisk[];
  onEventClick: (event: any) => void;
  setHoveredInfo: (info: string | null) => void;
}) {
  const HQ_LOCATION = { lat: 51.5074, lng: -0.1278 }; // London
  const CURRENT_LOCATION = { lat: 40.4406, lng: -79.9959 }; // Pittsburgh

  const getRiskColor = (riskScore: number): string => {
    if (riskScore >= 80) return '#dc2626'; // red-600
    if (riskScore >= 60) return '#ea580c'; // orange-600
    if (riskScore >= 40) return '#ca8a04'; // yellow-600
    return '#16a34a'; // green-600
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'CRITICAL': return '#ef4444'; // red-500
      case 'HIGH': return '#f97316'; // orange-500
      case 'MEDIUM': return '#eab308'; // yellow-500
      case 'LOW': return '#22c55e'; // green-500
      default: return '#71717a'; // zinc-500
    }
  };

  return (
    <div className="w-full h-full bg-transparent">
      <ComposableMap 
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup zoom={1}>
          {/* Base Map */}
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                // Find if this country has a risk score
                const countryRisk = countryRisks.find(c => c.country === geo.properties.name || c.code === geo.properties.ISO_A2);
                const fillColor = countryRisk 
                  ? getRiskColor(countryRisk.riskScore) + '40' // Add transparency (hex alpha)
                  : '#27272a'; // zinc-800
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#3f3f46" // zinc-700
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#52525b", outline: "none" }, // zinc-600
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={() => {
                      setHoveredInfo(geo.properties.name);
                      document.body.style.cursor = 'default';
                    }}
                    onMouseLeave={() => {
                      setHoveredInfo(null);
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Transactions (Arcs) */}
          {transactions.map((tx) => {
            const start: [number, number] = [HQ_LOCATION.lng, HQ_LOCATION.lat];
            const end: [number, number] = [tx.location.lng, tx.location.lat];
            const color = tx.riskLevel === 'CRITICAL' ? '#ef4444' :
                          tx.riskLevel === 'HIGH' ? '#f97316' :
                          '#22c55e';
            
            return (
              <Line
                key={tx.id}
                from={start}
                to={end}
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeOpacity={0.6}
              />
            );
          })}

          {/* Country Risk Markers (Halos) */}
          {countryRisks.map((country, idx) => (
            <Marker key={`risk-${idx}`} coordinates={[country.location.lng, country.location.lat]}>
              <circle r={8} fill={getRiskColor(country.riskScore)} fillOpacity={0.3} />
              <circle r={4} fill={getRiskColor(country.riskScore)} fillOpacity={0.6} />
            </Marker>
          ))}

          {/* Events (Points) */}
          {events.map((event) => (
            <Marker 
              key={event.id} 
              coordinates={[event.location.lng, event.location.lat]}
              onClick={() => onEventClick(event)}
              onMouseEnter={() => {
                setHoveredInfo(event.title);
                document.body.style.cursor = 'pointer';
              }}
              onMouseLeave={() => {
                setHoveredInfo(null);
                document.body.style.cursor = 'default';
              }}
            >
              <circle 
                r={event.severity === 'CRITICAL' ? 6 : 4} 
                fill={getSeverityColor(event.severity)}
                stroke="#fff"
                strokeWidth={1.5}
              />
            </Marker>
          ))}

          {/* HQ Marker */}
          <Marker coordinates={[HQ_LOCATION.lng, HQ_LOCATION.lat]}>
            <circle r={4} fill="#3b82f6" stroke="#fff" strokeWidth={1} />
            <text textAnchor="middle" y={-10} style={{ fontFamily: "system-ui", fill: "#9ca3af", fontSize: "10px" }}>
              HQ
            </text>
          </Marker>
          
          {/* Current Location Marker */}
          <Marker coordinates={[CURRENT_LOCATION.lng, CURRENT_LOCATION.lat]}>
            <circle r={4} fill="#10b981" stroke="#fff" strokeWidth={1} />
            <text textAnchor="middle" y={-10} style={{ fontFamily: "system-ui", fill: "#10b981", fontSize: "10px" }}>
              You
            </text>
          </Marker>

        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

interface PolitifolioMapSimpleProps {
  selectedEvent: number | null;
  onEventClick: (event: any) => void;
  events?: AIEnhancedEvent[];
  transactions?: Transaction[];
  countryRisks?: CountryRisk[];
}

export function PolitifolioMapSimple({ 
  selectedEvent: _selectedEvent, 
  onEventClick,
  events = MOCK_EVENTS,
  transactions = MOCK_TRANSACTIONS,
  countryRisks = MOCK_COUNTRY_RISKS
}: PolitifolioMapSimpleProps) {
  const globeEl = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  
  // View Mode State: '3D' or '2D'
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [eventFilter, setEventFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  // Resize observer to handle responsive container
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Auto-rotate effect
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  // Prepare Arcs Data (Transactions)
  const HQ_LOCATION = { lat: 51.5074, lng: -0.1278 }; // London (Global HQ)
  const CURRENT_LOCATION = { lat: 40.4406, lng: -79.9959 }; // Pittsburgh (User Location)

  // Load GeoJSON for 3D map country hover
  const [geoJsonData, setGeoJsonData] = useState<any[]>([]);
  useEffect(() => {
    // Load low-res world geojson for 3D hover detection
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        setGeoJsonData(data.features);
      })
      .catch(err => console.error('Failed to load map data', err));
  }, []);
  
  const arcsData = useMemo(() => {
    return transactions.map(tx => ({
      startLat: HQ_LOCATION.lat,
      startLng: HQ_LOCATION.lng,
      endLat: tx.location.lat,
      endLng: tx.location.lng,
      color: tx.riskLevel === 'CRITICAL' ? ['rgba(255, 0, 0, 0.5)', 'rgba(255, 0, 0, 0.8)'] :
             tx.riskLevel === 'HIGH' ? ['rgba(255, 165, 0, 0.5)', 'rgba(255, 165, 0, 0.8)'] :
             ['rgba(0, 255, 0, 0.5)', 'rgba(0, 255, 0, 0.8)'],
      name: `TX: ${tx.amount} ${tx.currency}`
    }));
  }, [transactions]);

  // Prepare Points Data (Events & Risks)
  const pointsData = useMemo(() => {
    const eventPoints = events.map(ev => ({
      lat: ev.location.lat,
      lng: ev.location.lng,
      size: ev.severity === 'CRITICAL' ? 1.5 : ev.severity === 'HIGH' ? 1.0 : 0.5,
      color: ev.severity === 'CRITICAL' ? 'red' : ev.severity === 'HIGH' ? 'orange' : 'yellow',
      name: ev.title,
      type: 'event',
      data: ev
    }));

    // Add HQ
    eventPoints.push({
      lat: HQ_LOCATION.lat,
      lng: HQ_LOCATION.lng,
      size: 1.2,
      color: '#3b82f6', // Blue
      name: 'Global HQ (London)',
      type: 'hq',
      data: {} as any
    });

    // Add Current Location (Pittsburgh)
    eventPoints.push({
      lat: CURRENT_LOCATION.lat,
      lng: CURRENT_LOCATION.lng,
      size: 1.2,
      color: '#10b981', // Green
      name: 'Current Location (Pittsburgh)',
      type: 'user',
      data: {} as any
    });

    return eventPoints;
  }, [events]);

  // Rings Data (Ripple effect for critical events)
  const ringsData = useMemo(() => {
    return events
      .filter(ev => ev.severity === 'CRITICAL' || ev.severity === 'HIGH')
      .map(ev => ({
        lat: ev.location.lat,
        lng: ev.location.lng,
        color: ev.severity === 'CRITICAL' ? 'red' : 'orange',
        maxRadius: ev.severity === 'CRITICAL' ? 15 : 10,
        propagationSpeed: 2,
        repeatPeriod: 1000
      }));
  }, [events]);

  return (
    <div className="flex flex-1 min-h-0 w-full bg-transparent overflow-hidden rounded-b-lg">
      {/* Side News Feed - Left Column */}
      <div className="w-100 border-r flex flex-col shrink-0 overflow-hidden politifolio-card backdrop-blur-sm" style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }}>
        <div className="p-4 border-b shrink-0 flex items-center justify-between" style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }}>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-500 animate-pulse" />
              Live Intelligence
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Real-time global events feed</p>
          </div>
          
          <div className="flex p-0.5 rounded-lg politifolio-card" style={{ border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <button
              onClick={() => setEventFilter('ALL')}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                eventFilter === 'ALL' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-300 border border-transparent'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setEventFilter('CRITICAL')}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                eventFilter === 'CRITICAL' 
                  ? 'bg-violet-600/80 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-300 border border-transparent'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setEventFilter('HIGH')}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                eventFilter === 'HIGH' 
                  ? 'bg-violet-600/80 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-300 border border-transparent'
              }`}
            >
              High
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {events
            .filter(e => eventFilter === 'ALL' || e.severity === eventFilter)
            .map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}
            >
            <Card 
              className="p-3 hover:border-violet-500/40 transition-colors cursor-pointer group politifolio-card"
              onClick={() => onEventClick(event)}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                  event.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  event.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                  'politifolio-badge-neutral'
                }`}>
                  {event.severity}
                </Badge>
                <span className="text-[10px] text-zinc-500">
                  {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <h4 className="text-sm font-medium text-white mb-1 group-hover:text-purple-400 transition-colors">
                {event.title}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                {event.description}
              </p>
              
              {/* AI Recommendation Section */}
              {(event.severity === 'CRITICAL' || event.severity === 'HIGH') && (
                <div className="mt-2 mb-2 p-2 bg-purple-500/5 border border-purple-500/20 rounded-md">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-purple-400">AI Recommendation</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 italic">
                    "{event.aiRecommendation || 'Analyze impact on local supply chains.'}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-white/10 pt-2">
                <div className="flex items-center gap-1">
                  <span>🌍</span>
                  <span className="text-zinc-400">{event.country}</span>
                </div>
                <span>{event.source}</span>
          </div>
            </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Map Area - Right Column */}
      <div ref={containerRef} className="flex-1 min-h-0 relative bg-transparent overflow-hidden">
        
        {/* View Toggle */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 p-1 rounded-lg backdrop-blur-sm politifolio-card" style={{ border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <button
            onClick={() => setViewMode('3D')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              viewMode === '3D' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            3D Globe
          </button>
          <button
            onClick={() => setViewMode('2D')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              viewMode === '2D' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            2D Map
          </button>
        </div>

        {viewMode === '3D' ? (
          <Globe
            ref={globeEl}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            
            // Arcs (Transactions)
            arcsData={arcsData}
            arcColor="color"
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={1500}
            arcStroke={0.5}
            arcAltitude={0.25} // Increase altitude to make arcs more visible
            
            // Polygons (Country Names on Hover)
            polygonsData={geoJsonData}
            polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
            polygonCapColor={() => 'rgba(0, 0, 0, 0)'} // Transparent to show base map/bump
            polygonStrokeColor={() => 'rgba(255, 255, 255, 0)'} // Hide borders, rely on bump map or keep subtle
            polygonAltitude={0.005} // Slightly above surface
            onPolygonHover={(polygon: any) => {
              setHoveredInfo(polygon ? polygon.properties.NAME || polygon.properties.name : null);
              document.body.style.cursor = polygon ? 'pointer' : 'default';
            }}
            
            // Points (Events)
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointRadius="size"
            pointAltitude={0.01}
            onPointClick={(point: any) => {
              if (point.type === 'event') {
                onEventClick(point.data);
              }
            }}
            onPointHover={(point: any) => {
              setHoveredInfo(point ? point.name : null);
              document.body.style.cursor = point ? 'pointer' : 'default';
            }}

            // Rings (Critical Alerts)
            ringsData={ringsData}
            ringColor="color"
            ringMaxRadius="maxRadius"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"

            // Labels
            labelsData={countryRisks}
            labelLat={d => (d as any).location.lat}
            labelLng={d => (d as any).location.lng}
            labelText={d => (d as any).country}
            labelSize={1.5}
            labelDotRadius={0.5}
            labelColor={() => 'rgba(255, 255, 255, 0.75)'}
            labelResolution={2}
          />
        ) : (
          <Map2DView 
            events={events}
            transactions={transactions}
            countryRisks={countryRisks}
            onEventClick={onEventClick}
            setHoveredInfo={setHoveredInfo}
          />
        )}

        {/* Map legend */}
        <div className="absolute bottom-8 right-8 backdrop-blur-sm rounded-lg p-4 text-white text-sm shadow-xl pointer-events-none politifolio-card" style={{ border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <h3 className="font-semibold mb-3">Live Intelligence</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <span className="text-zinc-300">Critical Event</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600" />
              <span className="text-zinc-300">High Risk</span>
          </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-transparent" />
              <span className="text-zinc-300">Live Transaction</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-zinc-500">
            <p>Interactive Visualization</p>
            <p>Switch views top-left</p>
            </div>
          </div>

        {/* Hover Tooltip */}
        {hoveredInfo && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
            <div className="bg-black/80 text-white px-3 py-1 rounded border border-white/20 backdrop-blur-md whitespace-nowrap">
              {hoveredInfo}
            </div>
          </div>
        )}
        </div>
    </div>
  );
}
