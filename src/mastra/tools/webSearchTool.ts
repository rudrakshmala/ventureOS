// 📄 src/mastra/tools/webSearchTool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import https from 'https';

/**
 * Fetches a URL and returns the text content.
 */
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'VentureOS-Scout/1.0 (contact: admin@ventureos.ai)',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

export const webSearchTool = createTool({
  id: 'webSearchTool',
  description: 'Fetches posts from Reddit and Hacker News searching for software development opportunities and clients',
  inputSchema: z.object({
    platform: z.enum(['reddit', 'hackernews']).describe('Which platform to search'),
    keywords: z.array(z.string()).describe('Search keywords to use'),
    subreddit: z.string().optional().describe('Specific subreddit to search (for Reddit)'),
    limit: z.number().optional().default(25).describe('Max posts to fetch'),
  }),
  execute: async ({ input }) => {
    const { platform, keywords, subreddit, limit = 25 } = input;

    try {
      if (platform === 'reddit') {
        const sub = subreddit || 'forhire+entrepreneur+startups+SaaS';
        const query = keywords.join('+');
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${limit}&restrict_sr=false&t=week`;
        const raw = await fetchUrl(url);
        const data = JSON.parse(raw);
        const posts = data?.data?.children || [];
        return {
          success: true,
          platform: 'reddit',
          count: posts.length,
          posts: posts.map((p: any) => ({
            id: p.data.id,
            title: p.data.title,
            content: (p.data.selftext || '').slice(0, 800),
            author: p.data.author,
            url: `https://reddit.com${p.data.permalink}`,
            subreddit: p.data.subreddit,
            score: p.data.score,
            created: new Date(p.data.created_utc * 1000).toISOString(),
            flair: p.data.link_flair_text || '',
          }))
        };
      }

      if (platform === 'hackernews') {
        const query = keywords.join(' ');
        const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=ask_hn,show_hn&hitsPerPage=${limit}&numericFilters=created_at_i>%3D${Math.floor((Date.now() - 7 * 24 * 3600000) / 1000)}`;
        const raw = await fetchUrl(url);
        const data = JSON.parse(raw);
        return {
          success: true,
          platform: 'hackernews',
          count: data.hits?.length || 0,
          posts: (data.hits || []).map((h: any) => ({
            id: h.objectID,
            title: h.title || h.story_title,
            content: (h.story_text || h.comment_text || '').slice(0, 800),
            author: h.author,
            url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
            score: h.points,
            created: h.created_at,
          }))
        };
      }

      return { success: false, error: 'Unknown platform', posts: [] };
    } catch (error: any) {
      return { success: false, error: error.message, posts: [] };
    }
  }
});
