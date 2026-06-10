'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function LiveFeed() {
  const [logs, setLogs] = useState<{ id: number, text: string, type: 'info' | 'success' | 'error' }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulated SSE feed for the demo if actual endpoint isn't wired to fire events
    const initialLogs = [
      { id: 1, text: 'System Initialized. Awaiting directives.', type: 'info' as const },
      { id: 2, text: 'Connected to VentureOS API Gateway on port 4000', type: 'success' as const }
    ];
    setLogs(initialLogs);

    // Auto-scroll
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Live Agent Telemetry</h2>
          <p className="text-slate-400">Streaming execution logs from the multi-agent orchestration layer.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-bold border border-blue-500/20">
          <Activity className="w-4 h-4" />
          WebSocket Connected
        </div>
      </div>

      <div className="flex-1 border border-slate-800 bg-[#020617] rounded-xl flex flex-col overflow-hidden relative">
        <div className="bg-[#0a0a0a] border-b border-slate-800 px-4 py-3 flex gap-2 items-center">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">venture_os/sys/stdout</span>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-auto p-6 font-mono text-sm space-y-3">
          {logs.map((log) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-3 ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'success' ? 'text-emerald-400' :
                'text-slate-300'
              }`}
            >
              <span className="text-slate-600 select-none">[{new Date().toLocaleTimeString()}]</span>
              <span className={log.type === 'info' ? 'border-l-2 border-blue-500 pl-3' : ''}>{log.text}</span>
            </motion.div>
          ))}
          <div className="flex items-center gap-2 text-slate-500 mt-4 animate-pulse">
            <span className="w-2 h-4 bg-blue-500 block" />
            Awaiting input stream...
          </div>
        </div>
      </div>
    </div>
  );
}
