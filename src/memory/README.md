# VentureOS Memory Bus Architecture

## Overview

The Memory Bus is a shared inter-agent memory system that allows all 76 VentureOS agents to read and write shared context. It eliminates context loss between departments and enables cross-functional collaboration.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Sales Dept  │     │  Engineering │     │   Security   │
│  (14 agents) │     │  (22 agents) │     │  (10 agents) │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                    MEMORY BUS                           │
│  ┌─────────┐ ┌────────────┐ ┌────────┐ ┌──────────┐   │
│  │ global  │ │   sales    │ │  eng   │ │ security │   │
│  │  scope  │ │   scope    │ │ scope  │ │  scope   │   │
│  └─────────┘ └────────────┘ └────────┘ └──────────┘   │
│                                                         │
│  Backed by LibSQL (venture_core.db)                    │
└─────────────────────────────────────────────────────────┘
```

## Scopes

| Scope       | Agents                                    | Purpose                        |
|-------------|-------------------------------------------|--------------------------------|
| `global`    | All agents (read)                         | Cross-department shared state  |
| `sales`     | 14 sales & outreach agents                | Lead data, pitches, deals      |
| `engineering` | 22 product + engineering agents         | Code context, architecture     |
| `devops`    | 8 DevOps agents                           | Deploy state, infra config     |
| `security`  | 10 security agents                        | Audit logs, vuln reports       |
| `qa`        | 10 QA agents                              | Test results, coverage         |
| `executive` | 3 C-suite agents                          | Strategy directives            |

## API

### MemoryBus Class (`src/memory/bus.ts`)

```typescript
const bus = new MemoryBus();
await bus.init();

// Write
await bus.write('pitchCrafterAgent', 'lead_profile', { name: 'Acme' }, 'sales');

// Read latest for agent+key
const entry = await bus.read('pitchCrafterAgent', 'lead_profile');

// Read all entries in a scope
const salesEntries = await bus.readScope('sales');

// Subscribe to real-time writes
bus.subscribe('sales', (entry) => console.log('New sales entry:', entry));

// Search by key pattern
const results = await bus.search('lead_');

// Clear a scope
await bus.clearScope('qa');
```

### Context Bridge (`src/memory/context-bridge.ts`)

Auto-maps all 76 agents to their department scopes. Call `initMemoryBridge()` once at startup.

### REST API

- `GET /api/v1/memory/:scope` — Returns all active entries for a scope
- `GET /api/v1/memory/:scope/search?q=pattern` — Search entries by key
- `DELETE /api/v1/memory/:scope` — Clear all entries for a scope
- `GET /api/v1/memory/stats` — Entry counts per scope

## Memory Flow Rules

1. Sales agents write lead profiles to `scope='sales'`
2. When a project is confirmed (`key='project_confirmed'`), the Context Bridge auto-promotes it to `scope='global'`
3. Engineering agents can then read confirmed projects from `scope='global'`
4. Expired entries (past TTL) are automatically purged on read
