import fs from 'fs'
import path from 'path'

interface CSVLead {
  email: string
  name?: string
  company?: string
  title?: string
}

// Reads from /leads.csv in project root
// Format: email,name,company,title (header row required)
export function readLeadsFromCSV(filePath = './leads.csv'): CSVLead[] {
  const absolutePath = path.resolve(filePath)
  if (!fs.existsSync(absolutePath)) {
    console.warn('[CSV] leads.csv not found at', absolutePath)
    return []
  }

  const content = fs.readFileSync(absolutePath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  // Skip header row
  return lines.slice(1).map(line => {
    const [email, name, company, title] = line.split(',').map(s => s.trim())
    return { email, name, company, title }
  }).filter(l => l.email && l.email.includes('@'))
}
