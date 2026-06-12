import { searchLeads } from './apollo.js'
import { readLeadsFromCSV } from './csv.js'
import { PrismaClient } from '@prisma/client'

// Unified lead acquisition — tries Apollo first, falls back to CSV
export async function acquireLeads(prisma: PrismaClient, batchSize = 20): Promise<number> {
  let contacts = await searchLeads({
    titles: ['Founder', 'CEO', 'CTO', 'Head of Product', 'Head of Engineering'],
    keywords: ['startup', 'saas', 'ai', 'tech'],
    location: ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Chennai', 'Hyderabad'],
    companySizes: ['1,10', '11,50']
  }, batchSize)

  // Fallback to CSV if Apollo returns nothing
  if (contacts.length === 0) {
    console.log('[Leads] Apollo empty — using CSV fallback')
    const csvLeads = readLeadsFromCSV()
    contacts = csvLeads.map(l => ({
      email: l.email,
      firstName: l.name?.split(' ')[0] || '',
      lastName: l.name?.split(' ').slice(1).join(' ') || '',
      title: l.title || '',
      company: l.company || ''
    }))
  }

  let added = 0
  for (const contact of contacts) {
    try {
      await prisma.salesLead.upsert({
        where: { email: contact.email },
        create: {
          email: contact.email,
          name: `${contact.firstName} ${contact.lastName}`.trim(),
          company: contact.company,
          title: contact.title,
          linkedinUrl: contact.linkedinUrl,
          source: 'apollo',
          status: 'sourced'
        },
        update: {}  // Don't overwrite existing leads
      })
      added++
    } catch {
      // Duplicate — skip silently
    }
  }

  console.log(`[Leads] Added ${added} new leads`)
  return added
}
