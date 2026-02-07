import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
// import { Globe, Radio } from 'lucide-react';
const Globe = () => <span>🌐</span>;
const Radio = () => <span>📻</span>;

export function PolitifolioMapSimple({ 
  selectedEvent, 
  onEventClick 
}: { 
  selectedEvent: number | null, 
  onEventClick: (event: any) => void 
}) {
  return (
    <div className="min-h-full w-full bg-zinc-950 p-4 flex items-center justify-center overflow-auto">
      <Card className="bg-zinc-900 border-zinc-800 p-8 text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
            <Globe className="w-16 h-16 text-blue-500 relative z-10" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Interactive Global Map</h2>
        <p className="text-zinc-400 mb-6">
          Map visualization is simplified for this demo. 
          In the full version, this would render a WebGL globe with real-time event markers.
        </p>
        
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-white">Russia</span>
            </div>
            <p className="text-xs text-zinc-400">High Risk (Sanctions)</p>
          </div>
          
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-xs font-semibold text-white">Belarus</span>
            </div>
            <p className="text-xs text-zinc-400">Trade Restrictions</p>
          </div>

          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-xs font-semibold text-white">Brazil</span>
            </div>
            <p className="text-xs text-zinc-400">Political Instability</p>
          </div>

          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-semibold text-white">EU Zone</span>
            </div>
            <p className="text-xs text-zinc-400">New Regulations</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
