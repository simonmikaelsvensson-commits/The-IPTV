const db = require('../db');

async function insertRateLimitEvent({ event, ip, path: reqPath, meta }) {
  const q = `INSERT INTO rate_limit_events (event_type, ip, path, meta, created_at) VALUES ($1, $2, $3, $4, now())`;
  try {
    await db.query(q, [event, ip || null, reqPath || null, meta ? JSON.stringify(meta) : null]);
  } catch (e) {
    // don't throw to avoid breaking request flow
    console.error('insertRateLimitEvent error', e);
  }
}

module.exports = { insertRateLimitEvent };
