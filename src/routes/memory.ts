// 📄 src/routes/memory.ts — Memory Bus REST API routes
import { Router } from 'express';
import { memoryBus, type MemoryScope } from '../memory/bus.js';

const router = Router();
const VALID_SCOPES: MemoryScope[] = ['global', 'sales', 'engineering', 'devops', 'security', 'qa', 'executive'];

/** GET /api/v1/memory/stats — entry counts per scope */
router.get('/memory/stats', async (_req, res) => {
  try {
    const stats = await memoryBus.getStats();
    return res.json({ success: true, stats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/** GET /api/v1/memory/:scope — all active entries for a scope */
router.get('/memory/:scope', async (req, res) => {
  const scope = req.params.scope as MemoryScope;
  if (!VALID_SCOPES.includes(scope)) {
    return res.status(400).json({ error: `Invalid scope. Valid: ${VALID_SCOPES.join(', ')}` });
  }
  try {
    const entries = await memoryBus.readScope(scope);
    return res.json({ success: true, scope, count: entries.length, entries });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/** GET /api/v1/memory/:scope/search?q=pattern — search entries */
router.get('/memory/:scope/search', async (req, res) => {
  const scope = req.params.scope as MemoryScope;
  const q = (req.query.q as string) || '';
  try {
    const entries = await memoryBus.search(q, scope);
    return res.json({ success: true, scope, query: q, count: entries.length, entries });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/v1/memory/:scope — clear all entries for a scope */
router.delete('/memory/:scope', async (req, res) => {
  const scope = req.params.scope as MemoryScope;
  if (!VALID_SCOPES.includes(scope)) {
    return res.status(400).json({ error: `Invalid scope.` });
  }
  try {
    const deleted = await memoryBus.clearScope(scope);
    return res.json({ success: true, deleted });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as memoryRouter };
