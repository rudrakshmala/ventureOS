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
  TrendingUp,
  DollarSign,
  Send,
  Trophy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Zap,
  Target,
  Play,
  Search,
  StopCircle,
  CheckCircle2,
  AlertCircle,
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

interface EmpireStats {
  totalLeads: number;
  pitchesSent: number;
  dealsWon: number;
  totalRevenue: number;
}

interface SalesLead {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  source: string;
  status: string;
  painPoint: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface SalesProject {
  id: string;
  clientEmail: string;
  clientName: string | null;
  brief: string;
  status: string;
  priceQuoted: number | null;
  paidAmount: number | null;
  createdAt: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  status: string;
  closedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  lead: { contactEmail: string | null; authorUsername: string } | null;
}

interface AgentRun {
  id: string;
  runType: string;
  status: string;
  leadsFound: number;
  pitchesSent: number;
  dealsWon: number;
  revenue: number;
  startedAt: string;
  completedAt: string | null;
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

const LOGS_STORAGE_KEY = 'ventureos_activity_log';
const MAX_STORED_LOGS = 200;

function fmt(n: number | null | undefined) {
  if (n == null) return '-';
  return n.toLocaleString();
}

function fmtInr(paise: number | null | undefined) {
  if (paise == null) return '-';
  return 'Rs.' + (paise / 100).toLocaleString('en-IN');
}

function fmtUsd(usd: number) {
  return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 0 });
}

function fmtDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString();
}

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (['won', 'paid', 'delivered', 'success', 'closed_won', 'replied'].includes(s))
    return 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40';
  if (['running', 'negotiating', 'building', 'emailed', 'sourced', 'follow_up_1', 'follow_up_2', 'scoping'].includes(s))
    return 'bg-indigo-950/50 text-indigo-400 border-indigo-800/40';
  if (['failed', 'lost', 'closed_lost', 'bounced'].includes(s))
    return 'bg-red-950/50 text-red-400 border-red-800/40';
  if (['intake', 'draft', 'pending'].includes(s))
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  return 'bg-amber-950/40 text-amber-400 border-amber-800/40';
}

function Badge({ label }: { label: string }) {
  return (
    <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ' + statusColor(label)}>
      {label.replace(/_/g, ' ')}
    </span>
  );
}

type PipelineState = 'idle' | 'running' | 'done' | 'error';

export default function Dashboard() {
  const [time, setTime] = useState('');
  const [outreachStats, setOutreachStats] = useState<Stats>({});
  const [empireStats, setEmpireStats] = useState<EmpireStats | null>(null);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [projects, setProjects] = useState<SalesProject[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [leadsPage, setLeadsPage] = useState(0);
  const LEADS_PER_PAGE = 10;
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);
  const logBufferRef = useRef<LogEntry[]>([]);
  const logsRef = useRef<LogEntry[]>([]);

  // Agent control panel state
  const [outreachState, setOutreachState] = useState<PipelineState>('idle');
  const [empireState, setEmpireState] = useState<PipelineState>('idle');
  const [scoutState, setScoutState] = useState<PipelineState>('idle');
  const [controlLog, setControlLog] = useState<string[]>([]);
  const controlLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      setTime(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        }).format(new Date()) + ' IST'
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const fetchOutreachStats = async () => {
    try { const r = await apiFetch('/api/v1/outreach/stats'); if (r.ok) setOutreachStats(await r.json()); } catch {}
  };
  const fetchEmpireStats = async () => {
    try { const r = await apiFetch('/api/v1/empire/stats'); if (r.ok) setEmpireStats(await r.json()); } catch {}
  };
  const fetchLeads = async () => {
    try { const r = await apiFetch('/api/v1/leads'); if (r.ok) setLeads(await r.json()); } catch {}
  };
  const fetchProjects = async () => {
    try { const r = await apiFetch('/api/v1/projects'); if (r.ok) setProjects(await r.json()); } catch {}
  };
  const fetchDeals = async () => {
    try { const r = await apiFetch('/api/v1/deals'); if (r.ok) setDeals(await r.json()); } catch {}
  };
  const fetchAgentRuns = async () => {
    try { const r = await apiFetch('/api/v1/agent-runs'); if (r.ok) setAgentRuns(await r.json()); } catch {}
  };
  const fetchMemory = async () => {
    try { const r = await apiFetch('/api/v1/memory/global'); if (r.ok) setMemory(await r.json()); } catch {}
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) { const p: LogEntry[] = JSON.parse(stored); logsRef.current = p; setLogs(p); }
    } catch {}
    fetchOutreachStats(); fetchEmpireStats(); fetchLeads(); fetchProjects();
    fetchDeals(); fetchAgentRuns(); fetchMemory();
    const ids = [
      setInterval(fetchOutreachStats, 15000),
      setInterval(fetchEmpireStats, 30000),
      setInterval(fetchLeads, 30000),
      setInterval(fetchProjects, 15000),
      setInterval(fetchDeals, 30000),
      setInterval(fetchAgentRuns, 30000),
      setInterval(fetchMemory, 5000),
    ];
    return () => ids.forEach(clearInterval);
  }, []);

  useEffect(() => {
    const es = new EventSource(`${API_BASE}/api/v1/stream`);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const newLog: LogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          type: parsed.type || 'stats_update',
          data: parsed.data || parsed,
          timestamp: parsed.timestamp || new Date().toISOString(),
        };
        if (isHoveredRef.current) {
          logBufferRef.current = [newLog, ...logBufferRef.current].slice(0, MAX_STORED_LOGS);
        } else {
          logsRef.current = [newLog, ...logsRef.current].slice(0, MAX_STORED_LOGS);
          setLogs([...logsRef.current]);
          try { localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logsRef.current)); } catch {}
        }
        if (parsed.type === 'stats_update' && parsed.data && Object.keys(parsed.data).length > 0) {
          setOutreachStats(parsed.data);
        }
      } catch {}
    };
    return () => es.close();
  }, []);

  useEffect(() => { isHoveredRef.current = isHovered; }, [isHovered]);

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (logBufferRef.current.length > 0) {
      logsRef.current = [...logBufferRef.current, ...logsRef.current].slice(0, MAX_STORED_LOGS);
      setLogs([...logsRef.current]);
      logBufferRef.current = [];
      try { localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logsRef.current)); } catch {}
    }
  };

  const sourcedLeads = Object.values(outreachStats).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
  const emailsSent = (outreachStats.emailed || 0) + (outreachStats.follow_up_1 || 0) + (outreachStats.follow_up_2 || 0);
  const repliesReceived = outreachStats.replied || 0;
  const replyRate = emailsSent > 0 ? ((repliesReceived / (emailsSent + repliesReceived)) * 100).toFixed(1) : '0.0';
  const handleLogout = () => {
    window.location.href = window.location.protocol + '//logout:logout@' + window.location.host + window.location.pathname;
  };
  const pagedLeads = leads.slice(leadsPage * LEADS_PER_PAGE, (leadsPage + 1) * LEADS_PER_PAGE);
  const totalLeadPages = Math.ceil(leads.length / LEADS_PER_PAGE);

  const addControlLog = (msg: string) => {
    setControlLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 100));
    setTimeout(() => controlLogRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  // Trigger: Source leads from Apollo NOW
  const runScout = async () => {
    if (scoutState === 'running') return;
    setScoutState('running');
    addControlLog('Starting scout — fetching leads from Apollo...');
    try {
      const es = new EventSource(`${API_BASE}/api/v1/empire/run-scout`);
      es.addEventListener('EMPIRE_LOG', (e: any) => {
        const d = JSON.parse(e.data);
        addControlLog(d.log);
      });
      es.addEventListener('COMPLETE', () => {
        es.close();
        setScoutState('done');
        addControlLog('Scout complete. Refreshing leads...');
        fetchLeads(); fetchOutreachStats(); fetchEmpireStats();
      });
      es.addEventListener('CRASH', (e: any) => {
        const d = JSON.parse(e.data);
        es.close();
        setScoutState('error');
        addControlLog('Scout CRASHED: ' + d.message);
      });
      es.onerror = () => { es.close(); setScoutState('error'); addControlLog('Scout connection lost.'); };
    } catch (err: any) {
      setScoutState('error');
      addControlLog('Scout error: ' + err.message);
    }
  };

  // Trigger: Run full outreach cycle (source leads + send emails)
  const runOutreach = async () => {
    if (outreachState === 'running') return;
    setOutreachState('running');
    addControlLog('Starting outreach pipeline — sourcing leads + sending emails...');
    try {
      const res = await apiFetch('/api/v1/outreach/start', { method: 'POST' });
      if (res.ok) {
        addControlLog('Outreach pipeline started. Emails will send with 30s delays. Check leads table in 2 mins.');
        setOutreachState('done');
        setTimeout(() => { fetchLeads(); fetchOutreachStats(); }, 5000);
      } else {
        setOutreachState('error');
        addControlLog('Outreach start failed: ' + res.status);
      }
    } catch (err: any) {
      setOutreachState('error');
      addControlLog('Outreach error: ' + err.message);
    }
  };

  // Trigger: Full empire cycle (76 agents — scout + pitch + build)
  const runEmpire = async () => {
    if (empireState === 'running') return;
    setEmpireState('running');
    addControlLog('Launching full 76-agent empire cycle...');
    try {
      const es = new EventSource(`${API_BASE}/api/v1/empire/run-cycle`);
      es.addEventListener('EMPIRE_LOG', (e: any) => {
        const d = JSON.parse(e.data);
        addControlLog(d.log);
      });
      es.addEventListener('COMPLETE', () => {
        es.close();
        setEmpireState('done');
        addControlLog('Empire cycle complete!');
        fetchLeads(); fetchOutreachStats(); fetchEmpireStats(); fetchAgentRuns();
      });
      es.addEventListener('CRASH', (e: any) => {
        const d = JSON.parse(e.data);
        es.close();
        setEmpireState('error');
        addControlLog('Empire CRASHED: ' + d.message);
      });
      es.onerror = () => { es.close(); setEmpireState('error'); addControlLog('Empire connection lost.'); };
    } catch (err: any) {
      setEmpireState('error');
      addControlLog('Empire error: ' + err.message);
    }
  };

  const stateIcon = (s: PipelineState) => {
    if (s === 'running') return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (s === 'done') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === 'error') return <AlertCircle className="w-4 h-4 text-red-400" />;
    return null;
  };

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8 max-w-7xl mx-auto">

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
            VentureOS <span className="text-zinc-500 font-normal">|</span> <span className="text-zinc-400 font-medium">Internal</span>
          </h1>
          <p className="text-sm text-[var(--text2)] mt-1">Autonomous outbound & product engineering execution console.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-[var(--border)]">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-zinc-300">{time || '00:00:00 IST'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-[var(--border)]">
            <span className="status-dot working"></span>
            <span className="text-zinc-300 font-medium">operational</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/30 text-red-400 border border-red-900/40 hover:bg-red-950/60 transition cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /><span>Logout</span>
          </button>
        </div>
      </header>

      {/* ── AGENT CONTROL PANEL ── */}
      <section className="card p-6 space-y-5 border border-indigo-900/40 bg-indigo-950/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-zinc-200">Agent Control Panel</h2>
          <span className="ml-2 text-[10px] uppercase tracking-wider bg-indigo-950/60 text-indigo-400 border border-indigo-800/40 px-2 py-0.5 rounded">76 agents ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Scout */}
          <button
            onClick={runScout}
            disabled={scoutState === 'running'}
            className="flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-indigo-600 hover:bg-indigo-950/30 disabled:opacity-50 disabled:cursor-not-allowed transition group text-left"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200 group-hover:text-indigo-300 transition">
                <Search className="w-4 h-4 text-indigo-400" /> Source Leads
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Pull fresh leads from Apollo right now</p>
            </div>
            {stateIcon(scoutState) || <Play className="w-4 h-4 text-indigo-400 opacity-60 group-hover:opacity-100" />}
          </button>

          {/* Outreach */}
          <button
            onClick={runOutreach}
            disabled={outreachState === 'running'}
            className="flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-sky-600 hover:bg-sky-950/20 disabled:opacity-50 disabled:cursor-not-allowed transition group text-left"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200 group-hover:text-sky-300 transition">
                <Send className="w-4 h-4 text-sky-400" /> Run Outreach
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Source leads + send cold emails now</p>
            </div>
            {stateIcon(outreachState) || <Play className="w-4 h-4 text-sky-400 opacity-60 group-hover:opacity-100" />}
          </button>

          {/* Empire */}
          <button
            onClick={runEmpire}
            disabled={empireState === 'running'}
            className="flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-emerald-600 hover:bg-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed transition group text-left"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200 group-hover:text-emerald-300 transition">
                <Cpu className="w-4 h-4 text-emerald-400" /> Full Empire Cycle
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Fire all 76 agents — scout, pitch & build</p>
            </div>
            {stateIcon(empireState) || <Play className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100" />}
          </button>
        </div>

        {/* Live output */}
        {controlLog.length > 0 && (
          <div
            ref={controlLogRef}
            className="mt-2 h-36 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[11px] text-zinc-400 space-y-0.5"
          >
            {controlLog.map((line, i) => (
              <div key={i} className={line.includes('CRASH') || line.includes('error') ? 'text-red-400' : line.includes('complete') || line.includes('done') ? 'text-emerald-400' : ''}>
                {line}
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-zinc-600">
          Pipeline also auto-runs daily at 9:00 AM IST. Manual triggers above run immediately regardless of schedule.
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: fmt(empireStats?.totalLeads), Icon: Users, color: 'text-indigo-400', sub: 'All-time leads sourced' },
          { label: 'Pitches Sent', value: fmt(empireStats?.pitchesSent), Icon: Send, color: 'text-sky-400', sub: 'Outreach campaigns sent' },
          { label: 'Deals Won', value: fmt(empireStats?.dealsWon), Icon: Trophy, color: 'text-emerald-400', sub: 'Clients closed' },
          { label: 'Total Revenue', value: empireStats ? fmtUsd(empireStats.totalRevenue) : '-', Icon: DollarSign, color: 'text-yellow-400', sub: 'From paid invoices' },
        ].map(({ label, value, Icon, color, sub }) => (
          <div key={label} className="metric-card">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text2)]">{label}</span>
              <Icon className={'w-4 h-4 ' + color} />
            </div>
            <div className="text-[28px] font-bold mt-2 text-[var(--text)]">{value}</div>
            <div className="text-xs text-[var(--text2)] mt-1">{sub}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Leads', value: sourcedLeads, Icon: Target, color: 'text-indigo-400' },
          { label: 'Emails Sent', value: emailsSent, Icon: Mail, color: 'text-indigo-400' },
          { label: 'Replies', value: repliesReceived, Icon: MessageSquare, color: 'text-emerald-400' },
          { label: 'Reply Rate', value: replyRate + '%', Icon: Percent, color: 'text-emerald-400' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="metric-card py-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text2)]">{label}</span>
              <Icon className={'w-3.5 h-3.5 ' + color} />
            </div>
            <div className="text-xl font-bold mt-1 text-[var(--text)]">{value}</div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 card p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Outreach pipeline funnel
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Sourced', count: outreachStats.sourced || 0, color: 'bg-indigo-600' },
              { label: 'Emailed', count: outreachStats.emailed || 0, color: 'bg-indigo-500' },
              { label: 'Follow Up 1', count: outreachStats.follow_up_1 || 0, color: 'bg-indigo-400' },
              { label: 'Follow Up 2', count: outreachStats.follow_up_2 || 0, color: 'bg-indigo-300' },
              { label: 'Replied', count: outreachStats.replied || 0, color: 'bg-emerald-500' },
              { label: 'Closed Won', count: outreachStats.closed_won || 0, color: 'bg-emerald-400' },
              { label: 'Closed Lost', count: outreachStats.closed_lost || 0, color: 'bg-red-500' },
            ].map((stage) => {
              const pct = Math.max(((stage.count) / (sourcedLeads || 1)) * 100, 2);
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">{stage.label}</span>
                    <span className="text-zinc-200 font-bold">{stage.count}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
                    <div className={'h-full ' + stage.color + ' rounded-full transition-all duration-700'} style={{ width: pct + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-5 card p-6 flex flex-col h-[380px]"
          onMouseEnter={() => setIsHovered(true)} onMouseLeave={handleMouseLeave}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" /> Activity log
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">{logs.length} events</span>
              {isHovered && <span className="text-[10px] uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded animate-pulse">Paused</span>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="text-zinc-600 block text-base mb-1">??</span>
                <span className="text-zinc-500 block">Waiting for events</span>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2 rounded bg-zinc-950 border border-zinc-900/60 flex flex-col gap-0.5">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span className="font-semibold text-zinc-400">{log.type}</span>
                    <span>{fmtTime(log.timestamp)}</span>
                  </div>
                  {log.data && Object.keys(log.data).length > 0 && (
                    <pre className="text-zinc-400 text-[10px] whitespace-pre-wrap break-all leading-relaxed">{JSON.stringify(log.data, null, 2)}</pre>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Sales leads <span className="ml-1 text-xs text-zinc-500 font-normal">({leads.length} total)</span>
          </h2>
          <button onClick={fetchLeads} className="text-zinc-500 hover:text-zinc-300 transition p-1 rounded"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
        {leads.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <span className="text-zinc-600 block text-2xl mb-2">??</span>
            <span className="text-zinc-500">No leads sourced yet</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-[var(--text2)]">
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Company</th>
                    <th className="pb-3 pr-4 font-medium">Source</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Pain point</th>
                    <th className="pb-3 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-xs font-mono">
                  {pagedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-900/10 transition">
                      <td className="py-3 pr-4 text-zinc-300 font-medium">{lead.email}</td>
                      <td className="py-3 pr-4 text-zinc-400">{lead.company || '-'}</td>
                      <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">{lead.source}</span></td>
                      <td className="py-3 pr-4"><Badge label={lead.status} /></td>
                      <td className="py-3 pr-4 text-zinc-500 max-w-[180px] truncate" title={lead.painPoint || ''}>{lead.painPoint ? lead.painPoint.substring(0, 50) + (lead.painPoint.length > 50 ? '...' : '') : '-'}</td>
                      <td className="py-3 text-zinc-500">{fmtDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalLeadPages > 1 && (
              <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-900">
                <span>Page {leadsPage + 1} of {totalLeadPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setLeadsPage(p => Math.max(0, p - 1))} disabled={leadsPage === 0} className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 transition"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setLeadsPage(p => Math.min(totalLeadPages - 1, p + 1))} disabled={leadsPage === totalLeadPages - 1} className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 transition"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" /> Client projects <span className="ml-1 text-xs text-zinc-500 font-normal">({projects.length} total)</span>
          </h2>
          <button onClick={fetchProjects} className="text-zinc-500 hover:text-zinc-300 transition p-1 rounded"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
        {projects.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <span className="text-zinc-600 block text-2xl mb-2">??</span>
            <span className="text-zinc-500">No projects yet</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-[var(--text2)]">
                  <th className="pb-3 pr-4 font-medium">Client</th>
                  <th className="pb-3 pr-4 font-medium">Brief</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Quoted</th>
                  <th className="pb-3 pr-4 font-medium">Paid</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-xs font-mono">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/10 transition">
                    <td className="py-3 pr-4 text-zinc-300">{p.clientEmail}</td>
                    <td className="py-3 pr-4 text-zinc-400 max-w-[200px] truncate" title={p.brief}>{p.brief.substring(0, 55)}{p.brief.length > 55 ? '...' : ''}</td>
                    <td className="py-3 pr-4"><Badge label={p.status} /></td>
                    <td className="py-3 pr-4 text-zinc-300">{fmtInr(p.priceQuoted)}</td>
                    <td className="py-3 pr-4 text-emerald-400 font-semibold">{fmtInr(p.paidAmount)}</td>
                    <td className="py-3 text-zinc-500">{fmtDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Deal pipeline <span className="ml-1 text-xs text-zinc-500 font-normal">({deals.length} total)</span>
          </h2>
          <button onClick={fetchDeals} className="text-zinc-500 hover:text-zinc-300 transition p-1 rounded"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
        {deals.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <span className="text-zinc-600 block text-2xl mb-2">??</span>
            <span className="text-zinc-500">No deals yet</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-[var(--text2)]">
                  <th className="pb-3 pr-4 font-medium">Deal</th>
                  <th className="pb-3 pr-4 font-medium">Contact</th>
                  <th className="pb-3 pr-4 font-medium">Value</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Closed</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-xs font-mono">
                {deals.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-900/10 transition">
                    <td className="py-3 pr-4 text-zinc-300 font-medium max-w-[180px] truncate">{d.title}</td>
                    <td className="py-3 pr-4 text-zinc-400">{d.lead?.contactEmail || d.lead?.authorUsername || '-'}</td>
                    <td className="py-3 pr-4 text-yellow-400 font-bold">{fmtUsd(d.value)} <span className="text-zinc-600 font-normal">{d.currency}</span></td>
                    <td className="py-3 pr-4"><Badge label={d.status} /></td>
                    <td className="py-3 pr-4 text-zinc-500">{fmtDate(d.closedAt)}</td>
                    <td className="py-3 text-zinc-500">{fmtDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" /> Agent run history <span className="ml-1 text-xs text-zinc-500 font-normal">({agentRuns.length} runs)</span>
          </h2>
          <button onClick={fetchAgentRuns} className="text-zinc-500 hover:text-zinc-300 transition p-1 rounded"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
        {agentRuns.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <span className="text-zinc-600 block text-2xl mb-2">??</span>
            <span className="text-zinc-500">No agent runs logged yet</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-[var(--text2)]">
                  <th className="pb-3 pr-4 font-medium">Run type</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Leads</th>
                  <th className="pb-3 pr-4 font-medium">Pitches</th>
                  <th className="pb-3 pr-4 font-medium">Deals</th>
                  <th className="pb-3 pr-4 font-medium">Revenue</th>
                  <th className="pb-3 font-medium">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-xs font-mono">
                {agentRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-zinc-900/10 transition">
                    <td className="py-3 pr-4 text-zinc-300 font-semibold">{run.runType.replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4"><Badge label={run.status} /></td>
                    <td className="py-3 pr-4 text-zinc-400">{run.leadsFound}</td>
                    <td className="py-3 pr-4 text-zinc-400">{run.pitchesSent}</td>
                    <td className="py-3 pr-4 text-emerald-400">{run.dealsWon}</td>
                    <td className="py-3 pr-4 text-yellow-400">{fmtUsd(run.revenue)}</td>
                    <td className="py-3 text-zinc-500">{fmtDate(run.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" /> Global agent memory bus
        </h2>
        {memory.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <span className="text-zinc-600 block text-2xl mb-2">??</span>
            <span className="text-zinc-500">No shared memory entries yet</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                      <td className="py-3 pr-4 font-semibold text-indigo-400">{entry.agentId}</td>
                      <td className="py-3 pr-4 text-zinc-300">{entry.key}</td>
                      <td className="py-3 pr-4 text-zinc-400 max-w-sm truncate" title={valStr}>{valStr.substring(0, 60)}{valStr.length > 60 ? '...' : ''}</td>
                      <td className="py-3 text-zinc-500">{fmtTime(entry.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
