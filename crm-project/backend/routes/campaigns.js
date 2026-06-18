import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/campaigns
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/campaigns/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM campaigns WHERE campaign_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns
router.post('/', async (req, res, next) => {
  try {
    const { campaign_name, campaign_type, status, budget, actual_cost, expected_revenue, description } = req.body;
    const result = await pool.query(
      `INSERT INTO campaigns (campaign_name, campaign_type, status, budget, actual_cost, expected_revenue, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        campaign_name || 'Unnamed Campaign',
        campaign_type || 'Email',
        status || 'Planning',
        Number(budget) || 0,
        Number(actual_cost) || 0,
        Number(expected_revenue) || 0,
        description || ''
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/campaigns/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { campaign_name, campaign_type, status, budget, actual_cost, expected_revenue, description } = req.body;
    const result = await pool.query(
      `UPDATE campaigns
       SET campaign_name = $1, campaign_type = $2, status = $3, budget = $4,
           actual_cost = $5, expected_revenue = $6, description = $7, updated_at = CURRENT_TIMESTAMP
       WHERE campaign_id = $8
       RETURNING *`,
      [
        campaign_name,
        campaign_type,
        status,
        Number(budget) || 0,
        Number(actual_cost) || 0,
        Number(expected_revenue) || 0,
        description,
        req.params.id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/campaigns/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM campaigns WHERE campaign_id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
