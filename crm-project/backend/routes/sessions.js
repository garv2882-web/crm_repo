import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/sessions
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM sessions ORDER BY login_time DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions
router.post('/', async (req, res, next) => {
  try {
    const { session_id, user_id, user_name, user_email, login_time } = req.body;
    const result = await pool.query(
      `INSERT INTO sessions (session_id, user_id, user_name, user_email, login_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        session_id,
        user_id,
        user_name,
        user_email,
        login_time || new Date().toISOString()
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/sessions/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { logout_time, duration } = req.body;
    const result = await pool.query(
      `UPDATE sessions
       SET logout_time = $1, duration = $2
       WHERE session_id = $3
       RETURNING *`,
      [
        logout_time || new Date().toISOString(),
        duration,
        req.params.id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
