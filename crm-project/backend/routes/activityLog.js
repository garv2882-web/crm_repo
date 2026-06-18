import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/activity-log
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 200');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/activity-log
router.post('/', async (req, res, next) => {
  try {
    const { log_id, event_type, actor_name, actor_email, affected_record, detail_string, timestamp } = req.body;
    const result = await pool.query(
      `INSERT INTO activity_log (log_id, event_type, actor_name, actor_email, affected_record, detail_string, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        log_id,
        event_type,
        actor_name,
        actor_email,
        affected_record,
        detail_string || '',
        timestamp || new Date().toISOString()
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
