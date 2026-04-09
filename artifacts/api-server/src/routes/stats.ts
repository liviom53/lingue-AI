import { Router } from "express";
import pg from "pg";

const router = Router();

function getPool() {
  return new pg.Pool({ connectionString: process.env.DATABASE_URL });
}

const STATS_PASSWORD = process.env.STATS_PASSWORD ?? "macolingue";

router.post("/track/:event", async (req, res) => {
  const { event } = req.params;
  const { session_id } = req.body ?? {};
  const allowed = ["landing_view", "app_installed", "ai_call", "app_open"];
  if (!allowed.includes(event)) {
    res.status(400).json({ error: "Evento non valido" });
    return;
  }
  const pool = getPool();
  try {
    await pool.query(
      "INSERT INTO site_stats (event_name, session_id) VALUES ($1, $2)",
      [event, session_id ?? null]
    );
    res.json({ ok: true });
  } catch {
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
    const summary = await pool.query(`
      SELECT
        event_name,
        COUNT(*) AS total,
        COUNT(DISTINCT session_id) FILTER (WHERE session_id IS NOT NULL) AS unique_sessions,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS last_24h,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')  AS last_7d,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS last_30d,
        COUNT(*) FILTER (WHERE created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days') AS prev_7d,
        MAX(created_at) AS last_event
      FROM site_stats
      GROUP BY event_name
      ORDER BY total DESC
    `);

    const daily = await pool.query(`
      SELECT
        event_name,
        DATE(created_at) AS day,
        COUNT(*) AS count
      FROM site_stats
      WHERE created_at > NOW() - INTERVAL '14 days'
      GROUP BY event_name, DATE(created_at)
      ORDER BY event_name, day
    `);

    const firstEvent = await pool.query(`
      SELECT MIN(created_at) AS first_event FROM site_stats
    `);

    res.json({
      stats: summary.rows,
      daily: daily.rows,
      first_event: firstEvent.rows[0]?.first_event ?? null,
    });
  } catch (e) {
    res.status(500).json({ error: "DB error" });
  } finally {
    await pool.end();
  }
});

export default router;
