'use client';

import { motion } from 'framer-motion';
import { Bot, Shield, Code2, LineChart, Cpu, Search, Megaphone } from 'lucide-react';

const DEPARTMENTS = [
  { name: 'Sales & Outreach', icon: Megaphone, count: 14, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { name: 'Engineering', icon: Code2, count: 22, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { name: 'Quality Assurance', icon: Search, count: 10, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { name: 'DevOps', icon: Cpu, count: 8, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { name: 'Security', icon: Shield, count: 10, color: 'text-red-400', bg: 'bg-red-400/10' },
  { name: 'Self-Healing', icon: Bot, count: 7, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { name: 'Executive Strategy', icon: LineChart, count: 3, color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
];

export function AgentGrid() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">76-Agent Corporate Grid</h2>
        <p className="text-slate-400">Real-time status of the VentureOS autonomous workforce.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DEPARTMENTS.map((dept, idx) => (
          <motion.div 
            key={dept.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="border border-slate-800 bg-[#0a0a0a] rounded-xl p-6 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full ${dept.bg} -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-lg ${dept.bg} flex items-center justify-center`}>
                <dept.icon className={`w-6 h-6 ${dept.color}`} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </div>
            </div>

            <h3 className="text-lg font-bold mb-1 text-slate-200">{dept.name}</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black tracking-tighter text-white">{dept.count}</span>
              <span className="text-slate-500 font-medium mb-1">Active Agents</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-800/50 flex justify-between items-center text-sm">
              <span className="text-slate-500">System Load</span>
              <span className="text-blue-400 font-medium">{Math.floor(Math.random() * 40 + 10)}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
