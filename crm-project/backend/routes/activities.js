import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/activities
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM activities ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/activities
router.post('/', async (req, res, next) => {
  try {
    const { action_type, text } = req.body;
    const activityId = 'act_' + Math.random().toString(36).substr(2, 9);
    const result = await pool.query(
      `INSERT INTO activities (activity_id, action_type, text, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [activityId, action_type || 'custom', text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
