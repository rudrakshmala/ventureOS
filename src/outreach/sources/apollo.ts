// Apollo.io API client — 50 free credits/month
// Docs: https://apolloio.github.io/apollo-api-docs/

interface ApolloSearchFilter {
  titles?: string[]          // e.g. ['CTO', 'Founder', 'CEO']
  keywords?: string[]        // industry keywords
  location?: string[]        // e.g. ['Mumbai', 'Bangalore', 'Delhi']
  companySizes?: string[]    // e.g. ['1,10', '11,50']
}

interface ApolloContact {
  email: string
  firstName: string
  lastName: string
  title: string
  company: string
  linkedinUrl?: string
}

export async function searchLeads(filters: ApolloSearchFilter, maxResults = 25): Promise<ApolloContact[]> {
  const apiKey = process.env.APOLLO_API_KEY
  if (!apiKey) {
    console.warn('[Apollo] No API key — falling back to CSV source')
    return []
  }

  const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apiKey
    },
    body: JSON.stringify({
      q_organization_keyword_tags: filters.keywords || ['startup', 'saas', 'technology'],
      person_titles: filters.titles || ['Founder', 'CEO', 'CTO', 'Head of Engineering'],
      person_locations: filters.location || ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad'],
      organization_num_employees_ranges: filters.companySizes || ['1,10', '11,50'],
      page: 1,
      per_page: maxResults
    })
  })

  if (!response.ok) {
    console.error('[Apollo] Search failed:', response.status, await response.text())
    return []
  }

  const data = await response.json()
  return (data.people || []).map((p: any) => ({
    email: p.email,
    firstName: p.first_name,
    lastName: p.last_name,
    title: p.title,
    company: p.organization?.name || '',
    linkedinUrl: p.linkedin_url
  })).filter((c: ApolloContact) => c.email && !c.email.includes('email_not_found'))
}
