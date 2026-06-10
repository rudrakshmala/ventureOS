// 📄 src/routes/outreach.ts — Outreach API routes
import { Router } from 'express';
import { outreachPipeline } from '../outreach/pipeline.js';
import { inboxMonitor } from '../outreach/inbox/monitor.js';

const router = Router();

/** POST /api/v1/outreach/start — trigger outreach cycle */
router.post('/outreach/start', async (req, res) => {
  try {
    const result = await outreachPipeline.start();
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/** GET /api/v1/outreach/stats — outreach statistics */
router.get('/outreach/stats', async (req, res) => {
  try {
    const stats = await outreachPipeline.getStats();
    return res.json({ success: true, stats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/** POST /api/v1/outreach/inbox-sync — force inbox check */
router.post('/outreach/inbox-sync', async (req, res) => {
  try {
    const newReplies = await inboxMonitor.checkInbox();
    return res.json({ success: true, newReplies });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as outreachRouter };
