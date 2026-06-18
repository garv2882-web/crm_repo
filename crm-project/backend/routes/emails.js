import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/email-messages
router.get('/', async (req, res, next) => {
  try {
    const { lead_id } = req.query;
    let query = 'SELECT * FROM email_messages';
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

// POST /api/email-messages
router.post('/', async (req, res, next) => {
  try {
    const { lead_id, subject, body, direction, sender, recipient, status } = req.body;
    const result = await pool.query(
      `INSERT INTO email_messages (lead_id, subject, body, direction, sender, recipient, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        lead_id || null,
        subject || 'No Subject',
        body || '',
        direction || 'Outbound',
        sender || 'me@dexnest.com',
        recipient || '',
        status || 'Sent'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
