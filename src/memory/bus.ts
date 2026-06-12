import { PrismaClient } from '@prisma/client'
import { prisma } from '../db.js'

// Scopes — departments that can isolate their memory
export type MemoryScope = 'global' | 'sales' | 'engineering' | 'devops' | 'security' | 'qa' | 'executive'

function getPrisma(): PrismaClient {
  return prisma as any
}

export class MemoryBus {
  async init(): Promise<void> {}
  subscribe(scope: MemoryScope, callback: (entry: any) => void): void {}
  
  // Write a value — any agent calling this persists state for others to read
  async write(agentId: string, key: string, value: unknown, scope: MemoryScope = 'global', ttlSeconds?: number): Promise<void> {
    const prisma = getPrisma()
    await prisma.agentMemory.upsert({
      where: { id: `${scope}:${agentId}:${key}` },
      create: {
        id: `${scope}:${agentId}:${key}`,
        agentId,
        key,
        value: JSON.stringify(value),
        scope,
        ttl: ttlSeconds ?? null
      },
      update: {
        value: JSON.stringify(value),
        ttl: ttlSeconds ?? null,
        updatedAt: new Date()
      }
    })
  }

  // Read a specific key written by a specific agent
  async read(agentId: string, key: string): Promise<unknown | null> {
    const prisma = getPrisma()
    const record = await prisma.agentMemory.findUnique({
      where: { id: `${scope_from_key(key)}:${agentId}:${key}` }
    })
    if (!record) return null
    if (record.ttl) {
      const age = (Date.now() - record.updatedAt.getTime()) / 1000
      if (age > record.ttl) {
        await prisma.agentMemory.delete({ where: { id: record.id } })
        return null
      }
    }
    return JSON.parse(record.value)
  }

  // Read everything in a scope — used by dashboard and cross-department agents
  async readScope(scope: MemoryScope): Promise<Array<{ agentId: string; key: string; value: unknown; updatedAt: Date }>> {
    const prisma = getPrisma()
    const records = await prisma.agentMemory.findMany({
      where: { scope },
      orderBy: { updatedAt: 'desc' }
    })
    const now = Date.now()
    return records
      .filter(r => !r.ttl || (now - r.updatedAt.getTime()) / 1000 < r.ttl)
      .map(r => ({
        agentId: r.agentId,
        key: r.key,
        value: JSON.parse(r.value),
        updatedAt: r.updatedAt
      }))
  }

  // Broadcast to global scope — any agent can call this
  async broadcast(agentId: string, event: string, payload: unknown): Promise<void> {
    await this.write(agentId, `event:${event}:${Date.now()}`, payload, 'global', 3600)
  }

  // Called by sales when a lead replies — triggers engineering readiness
  async promoteLead(leadId: string, leadData: Record<string, unknown>): Promise<void> {
    await this.write('system', `hot_lead:${leadId}`, leadData, 'global')
    await this.write('system', `hot_lead:${leadId}`, leadData, 'sales')
  }

  // Check if engineering is aware of a project
  async getProjectContext(projectId: string): Promise<unknown | null> {
    return this.read('system', `project:${projectId}`)
  }

  async setProjectContext(projectId: string, context: Record<string, unknown>): Promise<void> {
    await this.write('system', `project:${projectId}`, context, 'global')
    await this.write('system', `project:${projectId}`, context, 'engineering')
  }
}

function scope_from_key(key: string): MemoryScope {
  if (key.startsWith('project:') || key.startsWith('hot_lead:')) return 'global'
  return 'global'
}

// Export singleton
export const memoryBus = new MemoryBus()
