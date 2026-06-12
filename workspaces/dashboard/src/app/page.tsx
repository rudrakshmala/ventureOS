'use client'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface Stats {
  sourced?: number
  emailed?: number
  follow_up_1?: number
  replied?: number
  closed_won?: number
}

interface MemoryEntry {
  agentId: string
  key: string
  value: unknown
  updatedAt: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({})
  const [memory, setMemory] = useState<MemoryEntry[]>([])
  const [events, setEvents] = useState<string[]>([])
  const [time, setTime] = useState('')

  useEffect(() => {
    // Live clock IST
    const clockTick = () => {
      const ist = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setTime(ist)
    }
    clockTick()
    const clockInterval = setInterval(clockTick, 1000)

    // Fetch stats every 15s
    const fetchStats = async () => {
      try {
        const r = await fetch(`${API}/api/v1/outreach/stats`)
        if (r.ok) setStats(await r.json())
      } catch {}
    }
    fetchStats()
    const statsInterval = setInterval(fetchStats, 15000)

    // Fetch memory every 5s
    const fetchMemory = async () => {
      try {
        const r = await fetch(`${API}/api/v1/memory/global`)
        if (r.ok) setMemory(await r.json())
      } catch {}
    }
    fetchMemory()
    const memoryInterval = setInterval(fetchMemory, 5000)

    // SSE stream
    const source = new EventSource(`${API}/api/v1/stream`)
    source.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setEvents(prev => [`[${new Date().toLocaleTimeString('en-IN')}] ${data.type}`, ...prev.slice(0, 49)])
    }

    return () => {
      clearInterval(clockInterval)
      clearInterval(statsInterval)
      clearInterval(memoryInterval)
      source.close()
    }
  }, [])

  const totalInPipeline = (stats.emailed || 0) + (stats.follow_up_1 || 0)
  const replyRate = totalInPipeline > 0 ? Math.round(((stats.replied || 0) / totalInPipeline) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px' }}>
      
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)' }}>VentureOS</h1>
          <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>Autonomous Agency Platform</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text2)', fontFamily: 'monospace' }}>{time} IST</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot working"></span>
            <span style={{ fontSize: '12px', color: 'var(--emerald)' }}>76 agents active</span>
          </div>
        </div>
      </div>

      {/* Hero metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Leads in pipeline', value: totalInPipeline, color: 'var(--indigo)' },
          { label: 'Replies received', value: stats.replied || 0, color: 'var(--emerald)' },
          { label: 'Reply rate', value: `${replyRate}%`, color: 'var(--amber)' },
          { label: 'Total sourced', value: stats.sourced || 0, color: 'var(--text2)' }
        ].map(m => (
          <div key={m.label} className="metric-card">
            <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '8px' }}>{m.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 600, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Live activity feed */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live activity</h3>
          <div style={{ height: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {events.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text2)' }}>Waiting for events...</p>
            ) : events.map((e, i) => (
              <p key={i} style={{ fontSize: '11px', color: i === 0 ? 'var(--text)' : 'var(--text2)', fontFamily: 'monospace', transition: 'color 0.3s' }}>{e}</p>
            ))}
          </div>
        </div>

        {/* Memory bus panel */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shared memory — global scope</h3>
          <div style={{ height: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {memory.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text2)' }}>No memory entries yet</p>
            ) : memory.slice(0, 20).map((m, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--indigo2)', fontFamily: 'monospace' }}>{m.agentId}:{m.key}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text2)' }}>{new Date(m.updatedAt).toLocaleTimeString('en-IN')}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {JSON.stringify(m.value).substring(0, 80)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="card" style={{ padding: '20px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 500, marginBottom: '20px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pipeline funnel</h3>
        <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
          {[
            { label: 'Sourced', count: stats.sourced || 0, color: '#6366F1' },
            { label: 'Emailed', count: stats.emailed || 0, color: '#818CF8' },
            { label: 'Follow-up', count: stats.follow_up_1 || 0, color: '#A5B4FC' },
            { label: 'Replied', count: stats.replied || 0, color: '#10B981' },
            { label: 'Won', count: stats.closed_won || 0, color: '#34D399' }
          ].map((stage, i, arr) => (
            <div key={stage.label} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontSize: '22px', fontWeight: 600, color: stage.color }}>{stage.count}</p>
              <p style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '4px' }}>{stage.label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
