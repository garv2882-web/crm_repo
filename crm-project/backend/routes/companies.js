import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/companies
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM companies WHERE is_deleted = FALSE ORDER BY company_name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyRes = await pool.query(
      'SELECT * FROM companies WHERE company_id = $1 AND is_deleted = FALSE',
      [id]
    );
    if (companyRes.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Also fetch associated contacts and leads
    const contactsRes = await pool.query(
      'SELECT * FROM contacts WHERE company_id = $1 AND is_deleted = FALSE',
      [id]
    );
    const leadsRes = await pool.query(
      'SELECT * FROM leads WHERE company_id = $1 AND is_deleted = FALSE',
      [id]
    );

    res.json({
      ...companyRes.rows[0],
      contacts: contactsRes.rows,
      leads: leadsRes.rows
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/companies
router.post('/', async (req, res, next) => {
  try {
    const { company_name, company_code, industry, website, country, state, city, annual_revenue, notes, created_by } = req.body;
    const result = await pool.query(
      `INSERT INTO companies (company_name, company_code, industry, website, country, state, city, annual_revenue, notes, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [company_name, company_code || null, industry, website, country, state, city, annual_revenue || 0, notes, created_by || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/companies/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company_name, company_code, industry, website, country, state, city, annual_revenue, notes } = req.body;
    const result = await pool.query(
      `UPDATE companies 
       SET company_name = $1, company_code = $2, industry = $3, website = $4, country = $5, state = $6, city = $7, annual_revenue = $8, notes = $9, updated_at = CURRENT_TIMESTAMP
       WHERE company_id = $10 AND is_deleted = FALSE
       RETURNING *`,
      [company_name, company_code || null, industry, website, country, state, city, annual_revenue, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found or deleted' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/companies/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE companies 
       SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP 
       WHERE company_id = $1 
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ message: 'Company soft-deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
