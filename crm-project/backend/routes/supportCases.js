import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/support-cases
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        c.company_name,
        u.full_name AS assigned_user_name
      FROM support_cases s
      LEFT JOIN companies c ON s.company_id = c.company_id
      LEFT JOIN users u ON s.assigned_to = u.user_id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/support-cases/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        c.company_name,
        u.full_name AS assigned_user_name
      FROM support_cases s
      LEFT JOIN companies c ON s.company_id = c.company_id
      LEFT JOIN users u ON s.assigned_to = u.user_id
      WHERE s.case_id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Support Case not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/support-cases
router.post('/', async (req, res, next) => {
  try {
    const { subject, company_id, assigned_to, priority, status, description, solution_id } = req.body;
    
    // Generate case number automatically
    const countRes = await pool.query('SELECT COUNT(*) FROM support_cases');
    const count = parseInt(countRes.rows[0].count) + 101;
    const case_number = `CAS-${String(count).padStart(5, '0')}`;

    const result = await pool.query(
      `INSERT INTO support_cases (case_number, subject, company_id, assigned_to, priority, status, description, solution_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        case_number,
        subject || 'New Support Case',
        company_id || null,
        assigned_to || null,
        priority || 'Medium',
        status || 'New',
        description || '',
        solution_id || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/support-cases/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { subject, company_id, assigned_to, priority, status, description, solution_id } = req.body;
    
    // Solution_id could be an empty string, convert it to null
    const resolvedSolutionId = (solution_id === '' || solution_id === undefined) ? null : solution_id;

    const result = await pool.query(
      `UPDATE support_cases
       SET subject = COALESCE($1, subject),
           company_id = COALESCE($2, company_id),
           assigned_to = COALESCE($3, assigned_to),
           priority = COALESCE($4, priority),
           status = COALESCE($5, status),
           description = COALESCE($6, description),
           solution_id = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE case_id = $8
       RETURNING *`,
      [
        subject || null,
        company_id || null,
        assigned_to || null,
        priority || null,
        status || null,
        description || null,
        resolvedSolutionId,
        req.params.id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Support Case not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/support-cases/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM support_cases WHERE case_id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Support Case not found' });
    res.json({ message: 'Support Case deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
