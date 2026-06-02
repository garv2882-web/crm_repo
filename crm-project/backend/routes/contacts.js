import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/contacts
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT c.*, co.company_name 
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.company_id
      WHERE c.is_deleted = FALSE 
      ORDER BY c.first_name ASC, c.last_name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, co.company_name 
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.company_id
      WHERE c.contact_id = $1 AND c.is_deleted = FALSE
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts
router.post('/', async (req, res, next) => {
  try {
    const { company_id, first_name, last_name, email, mobile_number, linkedin_profile, job_title, department, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO contacts (company_id, first_name, last_name, email, mobile_number, linkedin_profile, job_title, department, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [company_id || null, first_name, last_name, email, mobile_number, linkedin_profile, job_title, department, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company_id, first_name, last_name, email, mobile_number, linkedin_profile, job_title, department, notes } = req.body;
    const result = await pool.query(
      `UPDATE contacts 
       SET company_id = $1, first_name = $2, last_name = $3, email = $4, mobile_number = $5, linkedin_profile = $6, job_title = $7, department = $8, notes = $9, updated_at = CURRENT_TIMESTAMP
       WHERE contact_id = $10 AND is_deleted = FALSE
       RETURNING *`,
      [company_id || null, first_name, last_name, email, mobile_number, linkedin_profile, job_title, department, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE contacts 
       SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP 
       WHERE contact_id = $1 
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact soft-deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
