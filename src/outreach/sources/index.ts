// 📄 src/outreach/sources/index.ts — Lead Source Router
import { apolloClient, type ApolloLead, type ApolloSearchFilters } from './apollo.js';
import { csvLeadSource } from './csv.js';

export class LeadSourceRouter {
  /**
   * Tries to fetch leads from Apollo first.
   * If Apollo is unconfigured, out of quota, or fails, it falls back to the local CSV file.
   */
  async getLeads(filters?: ApolloSearchFilters, limit: number = 25): Promise<ApolloLead[]> {
    console.log(`🔍 [LeadSource] Attempting to source ${limit} leads...`);

    if (apolloClient.isConfigured()) {
      try {
        const apolloLeads = await apolloClient.searchPeople({
          ...filters,
          limit,
        });

        if (apolloLeads.length > 0) {
          console.log(`✅ [LeadSource] Sourced ${apolloLeads.length} leads from Apollo`);
          return apolloLeads;
        } else {
          console.log(`⚠️ [LeadSource] Apollo returned 0 leads. Falling back to CSV...`);
        }
      } catch (error) {
        console.error(`🔴 [LeadSource] Apollo error. Falling back to CSV...`);
      }
    } else {
      console.log(`⚠️ [LeadSource] Apollo not configured (missing API key). Falling back to CSV...`);
    }

    // Fallback to CSV
    return csvLeadSource.getLeads(limit);
  }
}

export const leadSourceRouter = new LeadSourceRouter();
