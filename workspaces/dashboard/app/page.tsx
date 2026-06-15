'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch, API_BASE } from '@/lib/api';
import { 
  Users, 
  Mail, 
  MessageSquare, 
  Percent, 
  Clock, 
  Activity, 
  Cpu, 
  FolderGit2, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface Stats {
  sourced?: number;
  emailed?: number;
  follow_up_1?: number;
  follow_up_2?: number;
  replied?: number;
  closed_won?: number;
  closed_lost?: number;
  [key: string]: number | undefined;
}

interface Project {
  id: string;
  clientEmail: string;
  clientName: string | null;
  brief: string;
  status: string;
  createdAt: string;
}

interface MemoryEntry {
  agentId: string;
  key: string;
  value: any;
  updatedAt: string;
}

interface LogEntry {
  id: string;
  type: string;
  data: any;
  timestamp: string;
}


export default function Dashboard() {
  const [time, setTime] = useState('');
  const [stats, setStats] = useState<Stats>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // SSE buffering for hover pause
  const [isHovered, setIsHovered] = useState(false);
  const logBufferRef = useRef<LogEntry[]>([]);
  const logsRef = useRef<LogEntry[]>([]);

  // Live Clock (IST)
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setTime(new Intl.DateTimeFormat('en-IN', options).format(new Date()) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Outreach Stats
  const fetchStats = async () => {
    try {
      const res = await apiFetch('/api/v1/outreach/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch outreach stats:', err);
    }
  };

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const res = await apiFetch('/api/v1/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  // Fetch Memory Scope
  const fetchMemory = async () => {
    try {
      const res = await apiFetch('/api/v1/memory/global');
      if (res.ok) {
        const data = await res.json();
        setMemory(data);
      }
    } catch (err) {
      console.error('Failed to fetch memory:', err);
    }
  };

  // SSE Stream
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE}/api/v1/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const newLog: LogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          type: parsed.type || 'stats_update',
          data: parsed.data || parsed,
          timestamp: parsed.timestamp || new Date().toISOString()
        };

        if (isHovered) {
          logBufferRef.current = [newLog, ...logBufferRef.current].slice(0, 50);
        } else {
          logsRef.current = [newLog, ...logsRef.current].slice(0, 50);
          setLogs([...logsRef.current]);
        }
      } catch (err) {
        console.error('Failed to parse SSE packet:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [isHovered]);

  // Handle un-hover: flush buffer to list
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (logBufferRef.current.length > 0) {
      logsRef.current = [...logBufferRef.current, ...logsRef.current].slice(0, 50);
      setLogs([...logsRef.current]);
      logBufferRef.current = [];
    }
  };

  // Fetch Polling loops
  useEffect(() => {
    fetchStats();
    fetchProjects();
    fetchMemory();

    const statsInterval = setInterval(fetchStats, 15000);
    const projectsInterval = setInterval(fetchProjects, 15000);
    const memoryInterval = setInterval(fetchMemory, 5000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(projectsInterval);
      clearInterval(memoryInterval);
    };
  }, []);

  // Calculate Metrics
  const sourcedLeads = Object.values(stats).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
  const emailsSent = (stats.emailed || 0) + (stats.follow_up_1 || 0) + (stats.follow_up_2 || 0);
  const repliesReceived = stats.replied || 0;
  const replyRate = emailsSent > 0 ? ((repliesReceived / (emailsSent + repliesReceived)) * 100).toFixed(1) : '0.0';

  // Logout utility
  const handleLogout = () => {
    // Force invalid credentials in url to force re-auth prompt
    const nextUrl = window.location.protocol + '//logout:logout@' + window.location.host + window.location.pathname;
    window.location.href = nextUrl;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'intake':
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
      case 'scoping':
        return 'bg-amber-950/40 text-amber-400 border border-amber-800/40';
      case 'building':
        return 'bg-indigo-950/40 text-indigo-400 border border-indigo-800/40';
      case 'delivered':
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* 1. TOP BAR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
            VentureOS <span className="text-zinc-500 font-normal">|</span> <span className="text-zinc-400 font-medium">Internal</span>
          </h1>
          <p className="text-sm text-[var(--text2)] mt-1">Autonomous outbound & product engineering execution console.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-[var(--border)]">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-zinc-300">{time || '00:00:00 IST'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-[var(--border)]">
            <span className="status-dot working"></span>
            <span className="text-zinc-300 font-medium">operational</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/30 text-red-400 border border-red-900/40 hover:bg-red-950/60 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* 2. HERO METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="metric-card">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text2)]">Total Leads Sourced</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-[28px] font-bold mt-2 text-[var(--text)]">{sourcedLeads}</div>
          <div className="text-xs text-[var(--text2)] mt-1">Active leads inside outreach pipeline</div>
        </div>

        <div className="metric-card">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text2)]">Emails Sent</span>
            <Mail className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-[28px] font-bold mt-2 text-[var(--text)]">{emailsSent}</div>
          <div className="text-xs text-[var(--text2)] mt-1">Sum of init pitch + follow-ups</div>
        </div>

        <div className="metric-card">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text2)]">Replies Received</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-[28px] font-bold mt-2 text-[var(--text)]">{repliesReceived}</div>
          <div className="text-xs text-[var(--text2)] mt-1">Direct replies registered in monitor</div>
        </div>

        <div className="metric-card">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text2)]">Reply Rate</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-[28px] font-bold mt-2 text-[var(--text)]">{replyRate}%</div>
          <div className="text-xs text-[var(--text2)] mt-1">Percent of contacted leads replying</div>
        </div>
      </section>

      {/* Middle row: Pipeline & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4. PIPELINE FUNNEL */}
        <section className="lg:col-span-7 card p-6 space-y-6">
          <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Outreach pipeline funnel
          </h2>

          <div className="space-y-4">
            {[
              { label: 'Sourced', count: stats.sourced || 0, color: 'bg-indigo-600' },
              { label: 'Emailed', count: stats.emailed || 0, color: 'bg-indigo-500' },
              { label: 'Follow Up', count: (stats.follow_up_1 || 0) + (stats.follow_up_2 || 0), color: 'bg-indigo-400' },
              { label: 'Replied', count: stats.replied || 0, color: 'bg-emerald-500' },
              { label: 'Closed Won', count: stats.closed_won || 0, color: 'bg-emerald-400' }
            ].map((stage, idx) => {
              const maxVal = sourcedLeads || 1;
              const widthPct = Math.max((stage.count / maxVal) * 100, 3); // min-width for rendering

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">{stage.label}</span>
                    <span className="text-zinc-200 font-bold">{stage.count}</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
                    <div 
                      className={`h-full ${stage.color} rounded-full transition-all duration-1000`} 
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. LIVE ACTIVITY FEED */}
        <section 
          className="lg:col-span-5 card p-6 flex flex-col h-[340px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" /> Live activity feed
            </h2>
            {isHovered && (
              <span className="text-[10px] uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded animate-pulse">
                Paused (Hovered)
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="text-zinc-600 block text-base mb-1">📡</span>
                <span className="text-zinc-500 block">No activity yet — system is idle</span>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2.5 rounded bg-zinc-950 border border-zinc-900/60 flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>{log.type}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre className="text-zinc-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed break-all">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 3. RECENT PROJECTS TABLE */}
      <section className="card p-6 space-y-6">
        <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-indigo-400" /> Recent intake projects
        </h2>

        <div className="overflow-x-auto">
          {projects.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="text-zinc-600 block text-2xl mb-2">📁</span>
              <span className="text-zinc-500 block max-w-md">
                No projects yet — leads will appear here once they submit a brief
              </span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-[var(--text2)]">
                  <th className="pb-3 pr-4 font-medium">Client email</th>
                  <th className="pb-3 pr-4 font-medium">Brief</th>
                  <th className="pb-3 pr-4 font-medium">Status badge</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-xs font-mono">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-zinc-900/10 transition">
                    <td className="py-4 pr-4 font-medium text-zinc-300">{project.clientEmail}</td>
                    <td className="py-4 pr-4 text-zinc-400 max-w-xs truncate" title={project.brief}>
                      {project.brief.substring(0, 60)}{project.brief.length > 60 && '...'}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-500">
                      {new Date(project.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 6. MEMORY BUS PANEL */}
      <section className="card p-6 space-y-6">
        <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" /> Global agent memory bus
        </h2>

        <div className="overflow-x-auto">
          {memory.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="text-zinc-600 block text-2xl mb-2">🧠</span>
              <span className="text-zinc-500 block">No shared memory entries yet</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-[var(--text2)]">
                  <th className="pb-3 pr-4 font-medium">Agent ID</th>
                  <th className="pb-3 pr-4 font-medium">Key</th>
                  <th className="pb-3 pr-4 font-medium">Value preview</th>
                  <th className="pb-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-xs font-mono">
                {memory.map((entry, idx) => {
                  const valStr = typeof entry.value === 'object' ? JSON.stringify(entry.value) : String(entry.value);
                  return (
                    <tr key={idx} className="hover:bg-zinc-900/10 transition">
                      <td className="py-4 pr-4 font-semibold text-indigo-400">{entry.agentId}</td>
                      <td className="py-4 pr-4 text-zinc-300">{entry.key}</td>
                      <td className="py-4 pr-4 text-zinc-400 max-w-sm truncate" title={valStr}>
                        {valStr.substring(0, 60)}{valStr.length > 60 && '...'}
                      </td>
                      <td className="py-4 text-zinc-500">
                        {new Date(entry.updatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
