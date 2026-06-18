import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/social-engagements
router.get('/', async (req, res, next) => {
  try {
    const { lead_id } = req.query;
    let query = 'SELECT * FROM social_engagements';
    const params = [];
    
    if (lead_id) {
      query += ' WHERE lead_id = $1';
      params.push(lead_id);
    }
    
    query += ' ORDER BY timestamp DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/social-engagements
router.post('/', async (req, res, next) => {
  try {
    const { lead_id, platform, direction, content, sender_handle } = req.body;
    const result = await pool.query(
      `INSERT INTO social_engagements (lead_id, platform, direction, content, sender_handle)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        lead_id || null,
        platform || 'LinkedIn',
        direction || 'Outbound',
        content || '',
        sender_handle || ''
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
