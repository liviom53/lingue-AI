import { Router } from "express";
import pg from "pg";

const router = Router();

function getPool() {
  return new pg.Pool({ connectionString: process.env.DATABASE_URL });
}

const STATS_PASSWORD = process.env.STATS_PASSWORD ?? "lingue2025";

router.post("/track/:event", async (req, res) => {
  const { event } = req.params;
  const allowed = ["landing_view", "app_installed", "ai_call", "app_open"];
  if (!allowed.includes(event)) {
    res.status(400).json({ error: "Evento non valido" });
    return;
  }
  const pool = getPool();
  try {
    await pool.query("INSERT INTO site_stats (event_name) VALUES ($1)", [event]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "DB error" });
  } finally {
    await pool.end();
  }
});

router.get("/", async (req, res) => {
  const { password } = req.query;
  if (password !== STATS_PASSWORD) {
    res.status(401).json({ error: "Password errata" });
    return;
  }
  const pool = getPool();
  try {
    const result = await pool.query(`
      SELECT
        event_name,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS last_24h,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS last_7d,
        MAX(created_at) AS last_event
      FROM site_stats
      GROUP BY event_name
      ORDER BY total DESC
    `);
    res.json({ stats: result.rows });
  } catch (e) {
    res.status(500).json({ error: "DB error" });
  } finally {
    await pool.end();
  }
});

export default router;
