import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY full_name ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
