// 📄 src/memory/bus.ts — VentureOS Inter-Agent Memory Bus
// Shared memory system backed by LibSQL so all 76 agents can read/write context
import { createClient, type Client } from '@libsql/client';

export type MemoryScope = 'global' | 'sales' | 'engineering' | 'devops' | 'security' | 'qa' | 'executive';

export interface MemoryEntry {
  id: string;
  agentId: string;
  key: string;
  value: any;
  scope: MemoryScope;
  createdAt: string;
  ttl: number | null;
}

type SubscriberCallback = (entry: MemoryEntry) => void;

export class MemoryBus {
  private db: Client;
  private subscribers: Map<MemoryScope, SubscriberCallback[]> = new Map();
  private initialized = false;

  constructor(dbUrl: string = 'file:./venture_core.db') {
    this.db = createClient({ url: dbUrl });
  }

  /** Bootstrap the memory_bus table if it doesn't exist */
  async init(): Promise<void> {
    if (this.initialized) return;

    await this.db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS memory_bus (
        id TEXT PRIMARY KEY,
        agentId TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        scope TEXT NOT NULL DEFAULT 'global',
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        ttl INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_memory_bus_scope ON memory_bus(scope);
      CREATE INDEX IF NOT EXISTS idx_memory_bus_agent_key ON memory_bus(agentId, key);
    `);

    this.initialized = true;
    console.log('🧠 [MemoryBus] Shared inter-agent memory table ready');
  }

  /** Write a key-value entry scoped to a department */
  async write(agentId: string, key: string, value: any, scope: MemoryScope = 'global', ttl?: number): Promise<MemoryEntry> {
    await this.init();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await this.db.execute({
      sql: `INSERT INTO memory_bus (id, agentId, key, value, scope, createdAt, ttl) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, agentId, key, JSON.stringify(value), scope, createdAt, ttl ?? null],
    });

    const entry: MemoryEntry = { id, agentId, key, value, scope, createdAt, ttl: ttl ?? null };

    // Notify scope subscribers
    this._notify(scope, entry);
    // Also notify global subscribers for cross-department visibility
    if (scope !== 'global') {
      this._notify('global', entry);
    }

    return entry;
  }

  /** Read the latest value for a specific agent + key */
  async read(agentId: string, key: string): Promise<MemoryEntry | null> {
    await this.init();
    const result = await this.db.execute({
      sql: `SELECT * FROM memory_bus WHERE agentId = ? AND key = ? ORDER BY createdAt DESC LIMIT 1`,
      args: [agentId, key],
    });

    if (result.rows.length === 0) return null;
    return this._rowToEntry(result.rows[0]);
  }

  /** Read all active (non-expired) entries for a given scope */
  async readScope(scope: MemoryScope): Promise<MemoryEntry[]> {
    await this.init();

    // Purge expired entries first
    await this.db.execute({
      sql: `DELETE FROM memory_bus WHERE ttl IS NOT NULL AND datetime(createdAt, '+' || ttl || ' seconds') < datetime('now')`,
      args: [],
    });

    const result = await this.db.execute({
      sql: `SELECT * FROM memory_bus WHERE scope = ? ORDER BY createdAt DESC LIMIT 500`,
      args: [scope],
    });

    return result.rows.map((r) => this._rowToEntry(r));
  }

  /** Search memory entries by key pattern */
  async search(keyPattern: string, scope?: MemoryScope): Promise<MemoryEntry[]> {
    await this.init();
    const sql = scope
      ? `SELECT * FROM memory_bus WHERE key LIKE ? AND scope = ? ORDER BY createdAt DESC LIMIT 100`
      : `SELECT * FROM memory_bus WHERE key LIKE ? ORDER BY createdAt DESC LIMIT 100`;
    const args = scope ? [`%${keyPattern}%`, scope] : [`%${keyPattern}%`];

    const result = await this.db.execute({ sql, args });
    return result.rows.map((r) => this._rowToEntry(r));
  }

  /** Clear all entries for a scope */
  async clearScope(scope: MemoryScope): Promise<number> {
    await this.init();
    const result = await this.db.execute({
      sql: `DELETE FROM memory_bus WHERE scope = ?`,
      args: [scope],
    });
    return result.rowsAffected;
  }

  /** Subscribe to new writes for a scope (in-process event) */
  subscribe(scope: MemoryScope, callback: SubscriberCallback): () => void {
    if (!this.subscribers.has(scope)) {
      this.subscribers.set(scope, []);
    }
    this.subscribers.get(scope)!.push(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(scope);
      if (subs) {
        const idx = subs.indexOf(callback);
        if (idx >= 0) subs.splice(idx, 1);
      }
    };
  }

  /** Get stats about the memory bus */
  async getStats(): Promise<Record<string, number>> {
    await this.init();
    const result = await this.db.execute({
      sql: `SELECT scope, COUNT(*) as count FROM memory_bus GROUP BY scope`,
      args: [],
    });
    const stats: Record<string, number> = {};
    for (const row of result.rows) {
      stats[row.scope as string] = row.count as number;
    }
    return stats;
  }

  private _notify(scope: MemoryScope, entry: MemoryEntry): void {
    const subs = this.subscribers.get(scope) || [];
    for (const cb of subs) {
      try {
        cb(entry);
      } catch (e) {
        console.error(`🧠 [MemoryBus] Subscriber error on scope=${scope}:`, e);
      }
    }
  }

  private _rowToEntry(row: any): MemoryEntry {
    return {
      id: row.id as string,
      agentId: row.agentId as string,
      key: row.key as string,
      value: JSON.parse(row.value as string),
      scope: row.scope as MemoryScope,
      createdAt: row.createdAt as string,
      ttl: row.ttl as number | null,
    };
  }
}

// Singleton instance
export const memoryBus = new MemoryBus();
