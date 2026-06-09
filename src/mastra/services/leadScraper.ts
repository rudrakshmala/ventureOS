// 📄 src/mastra/services/leadScraper.ts
// Scrapes Reddit + Hacker News for developer-hiring opportunities using free public APIs
import https from 'https';

const SCOUT_KEYWORDS = [
  'need a developer', 'looking for developer', 'hire developer',
  'need someone to build', 'build me a', 'need an app built',
  'need automation', 'need a bot', 'need api integration',
  'looking for freelancer', 'web scraper needed', 'need mvp built',
  'saas idea need developer', 'chatbot development', 'need backend developer',
  'willing to pay', 'budget available', 'paid project',
  'need fullstack', 'react developer needed', 'node js developer'
];

const SUBREDDITS = [
  'forhire', 'entrepreneur', 'startups', 'SaaS',
  'webdev', 'slavelabour', 'hiring', 'learnprogramming'
];

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'VentureOS-BusinessScout/1.0',
        'Accept': 'application/json'
      },
      timeout: 12000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

export interface RawPost {
  id: string;
  platform: string;
  title: string;
  content: string;
  author: string;
  url: string;
  subreddit?: string;
  score?: number;
  created: string;
}

/**
 * Scrapes Reddit for fresh developer hiring posts
 */
export async function scrapeReddit(limitPerSubreddit = 10): Promise<RawPost[]> {
  const allPosts: RawPost[] = [];
  const seenIds = new Set<string>();

  for (const sub of SUBREDDITS) {
    try {
      const url = `https://www.reddit.com/r/${sub}/new.json?limit=${limitPerSubreddit}`;
      const raw = await fetchUrl(url);
      const data = JSON.parse(raw);
      const posts = data?.data?.children || [];

      for (const p of posts) {
        const d = p.data;
        if (seenIds.has(d.id)) continue;
        seenIds.add(d.id);

        const text = `${d.title} ${d.selftext}`.toLowerCase();
        const isRelevant = SCOUT_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
        if (!isRelevant) continue;

        allPosts.push({
          id: `reddit_${d.id}`,
          platform: 'reddit',
          title: d.title,
          content: (d.selftext || '').slice(0, 1000),
          author: d.author,
          url: `https://reddit.com${d.permalink}`,
          subreddit: d.subreddit,
          score: d.score,
          created: new Date(d.created_utc * 1000).toISOString()
        });
      }

      // Gentle rate-limit compliance
      await new Promise(r => setTimeout(r, 500));
    } catch (err: any) {
      console.warn(`⚠️ [Scout] Reddit r/${sub} fetch failed: ${err.message}`);
    }
  }

  return allPosts;
}

/**
 * Scrapes Hacker News for hiring / freelance opportunities
 */
export async function scrapeHackerNews(limit = 20): Promise<RawPost[]> {
  const queries = ['hire developer', 'need developer', 'freelance developer', 'build app'];
  const allPosts: RawPost[] = [];
  const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 3600 * 1000) / 1000);
  const seenIds = new Set<string>();

  for (const query of queries) {
    try {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=${limit}&numericFilters=created_at_i>=${sevenDaysAgo}`;
      const raw = await fetchUrl(url);
      const data = JSON.parse(raw);

      for (const h of (data.hits || [])) {
        if (seenIds.has(h.objectID)) continue;
        seenIds.add(h.objectID);

        allPosts.push({
          id: `hn_${h.objectID}`,
          platform: 'hackernews',
          title: h.title || h.story_title || 'HN Post',
          content: (h.story_text || h.comment_text || '').replace(/<[^>]+>/g, '').slice(0, 1000),
          author: h.author,
          url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          score: h.points || 0,
          created: h.created_at
        });
      }

      await new Promise(r => setTimeout(r, 300));
    } catch (err: any) {
      console.warn(`⚠️ [Scout] HN query "${query}" failed: ${err.message}`);
    }
  }

  return allPosts;
}

/**
 * Master scrape function — runs all sources in parallel
 */
export async function scrapeAllPlatforms(): Promise<{ posts: RawPost[]; totalFound: number }> {
  console.log('🔍 [Lead Scraper] Starting multi-platform intelligence sweep...');

  const [redditPosts, hnPosts] = await Promise.allSettled([
    scrapeReddit(15),
    scrapeHackerNews(25)
  ]);

  const posts: RawPost[] = [
    ...(redditPosts.status === 'fulfilled' ? redditPosts.value : []),
    ...(hnPosts.status === 'fulfilled' ? hnPosts.value : []),
  ];

  console.log(`✅ [Lead Scraper] Found ${posts.length} relevant posts across all platforms`);
  return { posts, totalFound: posts.length };
}
