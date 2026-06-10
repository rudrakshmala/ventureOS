// 📄 src/outreach/sources/csv.ts — CSV fallback lead source
import fs from 'fs';
import path from 'path';
import type { ApolloLead } from './apollo.js';

const DEFAULT_CSV_PATH = path.resolve(process.cwd(), 'workspaces/leads.csv');

export class CsvLeadSource {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || DEFAULT_CSV_PATH;
  }

  isAvailable(): boolean {
    return fs.existsSync(this.filePath);
  }

  async getLeads(limit: number = 25): Promise<ApolloLead[]> {
    if (!this.isAvailable()) {
      console.warn(`⚠️ [CSV] Lead file not found at ${this.filePath}`);
      return [];
    }

    const raw = fs.readFileSync(this.filePath, 'utf-8');
    const lines = raw.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const leads: ApolloLead[] = [];

    for (let i = 1; i < Math.min(lines.length, limit + 1); i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      leads.push({
        id: `csv_${i}`,
        firstName: row['firstname'] || row['first_name'] || row['name']?.split(' ')[0] || '',
        lastName: row['lastname'] || row['last_name'] || row['name']?.split(' ').slice(1).join(' ') || '',
        email: row['email'] || '',
        company: row['company'] || row['organization'] || '',
        title: row['title'] || row['position'] || '',
        linkedinUrl: row['linkedin'] || row['linkedin_url'] || '',
        industry: row['industry'] || '',
        companySize: row['company_size'] || row['employees'] || '',
        location: row['location'] || row['city'] || '',
      });
    }

    console.log(`📋 [CSV] Loaded ${leads.length} leads from ${this.filePath}`);
    return leads;
  }
}

export const csvLeadSource = new CsvLeadSource();
