// 📄 src/outreach/sources/apollo.ts — Apollo.io API client for lead sourcing
import dotenv from 'dotenv';
dotenv.config();

const APOLLO_BASE = 'https://api.apollo.io/v1';
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || '';

export interface ApolloLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  linkedinUrl?: string;
  industry?: string;
  companySize?: string;
  location?: string;
}

export interface ApolloSearchFilters {
  personTitles?: string[];
  industries?: string[];
  employeeRanges?: string[];
  locations?: string[];
  keywords?: string[];
  limit?: number;
}

export class ApolloClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || APOLLO_API_KEY;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async searchPeople(filters: ApolloSearchFilters): Promise<ApolloLead[]> {
    if (!this.isConfigured()) {
      throw new Error('APOLLO_API_KEY not set');
    }

    try {
      const response = await fetch(`${APOLLO_BASE}/mixed_people/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          person_titles: filters.personTitles || ['CTO', 'CEO', 'Founder', 'VP Engineering'],
          person_locations: filters.locations || [],
          organization_industry_tag_ids: filters.industries || [],
          organization_num_employees_ranges: filters.employeeRanges || ['1,50', '51,200'],
          q_keywords: filters.keywords?.join(' ') || 'saas startup',
          per_page: filters.limit || 25,
          page: 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apollo API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const people = data.people || [];

      return people.map((p: any) => ({
        id: p.id,
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        email: p.email || '',
        company: p.organization?.name || '',
        title: p.title || '',
        linkedinUrl: p.linkedin_url || '',
        industry: p.organization?.industry || '',
        companySize: p.organization?.estimated_num_employees?.toString() || '',
        location: `${p.city || ''}, ${p.country || ''}`.trim(),
      }));
    } catch (error: any) {
      console.error('🔴 [Apollo] Search failed:', error.message);
      throw error;
    }
  }

  async enrichPerson(email: string): Promise<ApolloLead | null> {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${APOLLO_BASE}/people/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      const p = data.person;
      if (!p) return null;

      return {
        id: p.id,
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        email: p.email || email,
        company: p.organization?.name || '',
        title: p.title || '',
        linkedinUrl: p.linkedin_url || '',
        industry: p.organization?.industry || '',
        companySize: p.organization?.estimated_num_employees?.toString() || '',
        location: `${p.city || ''}, ${p.country || ''}`.trim(),
      };
    } catch {
      return null;
    }
  }
}

export const apolloClient = new ApolloClient();
