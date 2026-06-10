'use client';

import { useState, useEffect } from 'react';
import { Database, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function MemoryViewer() {
  const [entries, setEntries] = useState<any[]>([]);
  const [scope, setScope] = useState('global');
  const [loading, setLoading] = useState(false);

  const SCOPES = ['global', 'sales', 'engineering', 'devops', 'security', 'qa', 'executive'];

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:4000/api/v1/memory/${scope}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setEntries(data.entries);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [scope]);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Inter-Agent Memory Bus</h2>
        <p className="text-slate-400">View shared contextual memory passing between all 76 autonomous agents.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {SCOPES.map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
              scope === s 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'bg-[#0a0a0a] text-slate-500 border border-slate-800 hover:text-slate-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto border border-slate-800 rounded-xl bg-[#020617] relative">
        {loading && (
          <div className="absolute inset-0 bg-[#020617]/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {entries.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Database className="w-12 h-12 mb-4 opacity-20" />
            <p>No active memory entries in this scope.</p>
          </div>
        )}

        <div className="divide-y divide-slate-800/50">
          {entries.map((entry, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={entry.id} 
              className="p-6 hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-slate-800 rounded text-xs font-bold text-slate-300">
                    {entry.agentId}
                  </div>
                  <h3 className="font-mono text-blue-400">{entry.key}</h3>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
              <pre className="text-sm text-slate-300 bg-[#0a0a0a] p-4 rounded-lg overflow-x-auto border border-slate-800/50">
                {JSON.stringify(entry.value, null, 2)}
              </pre>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
