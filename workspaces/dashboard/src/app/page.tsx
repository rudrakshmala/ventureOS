'use client';

import { useState, useEffect } from 'react';
import { AgentGrid } from '@/components/AgentGrid';
import { LiveFeed } from '@/components/LiveFeed';
import { MemoryViewer } from '@/components/MemoryViewer';
import { OutreachPanel } from '@/components/OutreachPanel';
import { LayoutDashboard, Users, Database, Zap, Settings, Activity } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('grid');
  const [stats, setStats] = useState({ memory: 0, outreach: 0, leads: 0 });

  useEffect(() => {
    // Fetch some global stats
    fetch('http://localhost:4000/api/v1/memory/stats')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const total = Object.values(d.stats).reduce((a: any, b: any) => a + b, 0);
          setStats(s => ({ ...s, memory: total as number }));
        }
      })
      .catch(console.error);

    fetch('http://localhost:4000/api/v1/outreach/stats')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStats(s => ({ ...s, outreach: d.stats.sent, leads: d.stats.leads }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-mono">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-[#0a0a0a] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">VentureOS <span className="text-blue-500">Empire</span></h1>
        </div>
        
        <div className="flex gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Active Memory Nodes</span>
            <span className="text-emerald-400 font-bold">{stats.memory}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Leads Sourced</span>
            <span className="text-blue-400 font-bold">{stats.leads}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Pitches Sent</span>
            <span className="text-purple-400 font-bold">{stats.outreach}</span>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-[#0a0a0a] p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'grid' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Agent Grid</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'memory' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}
          >
            <Database className="w-5 h-5" />
            <span>Memory Bus</span>
          </button>

          <button 
            onClick={() => setActiveTab('outreach')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'outreach' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}
          >
            <Users className="w-5 h-5" />
            <span>Outreach</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'live' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}
          >
            <Activity className="w-5 h-5" />
            <span>Live Feed</span>
          </button>
          
          <div className="mt-auto pt-4 border-t border-slate-800">
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-slate-800/50 text-slate-400 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-[#050505]">
          {activeTab === 'grid' && <AgentGrid />}
          {activeTab === 'memory' && <MemoryViewer />}
          {activeTab === 'outreach' && <OutreachPanel />}
          {activeTab === 'live' && <LiveFeed />}
        </main>
      </div>
    </div>
  );
}
