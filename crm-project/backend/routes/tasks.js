import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/tasks
router.get('/', async (req, res, next) => {
  try {
    const { lead_id, deal_id, company_id } = req.query;
    
    let query = `
      SELECT 
        t.*,
        u.full_name AS assigned_user_name,
        l.lead_title,
        d.deal_name,
        c.company_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.user_id
      LEFT JOIN leads l ON t.lead_id = l.lead_id
      LEFT JOIN deals d ON t.deal_id = d.deal_id
      LEFT JOIN companies c ON t.company_id = c.company_id
    `;
    const params = [];
    const conditions = [];

    if (lead_id) {
      params.push(lead_id);
      conditions.push(`t.lead_id = $${params.length}`);
    }
    if (deal_id) {
      params.push(deal_id);
      conditions.push(`t.deal_id = $${params.length}`);
    }
    if (company_id) {
      params.push(company_id);
      conditions.push(`t.company_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY t.due_date ASC, t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE task_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
router.post('/', async (req, res, next) => {
  try {
    const { assigned_to, lead_id, deal_id, company_id, title, description, due_date, priority, status } = req.body;
    const result = await pool.query(
      `INSERT INTO tasks (assigned_to, lead_id, deal_id, company_id, title, description, due_date, priority, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        assigned_to || null, 
        lead_id || null, 
        deal_id || null, 
        company_id || null, 
        title, 
        description || '', 
        due_date || null, 
        priority || 'Medium', 
        status || 'Pending'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assigned_to, lead_id, deal_id, company_id, title, description, due_date, priority, status } = req.body;
    const result = await pool.query(
      `UPDATE tasks 
       SET assigned_to = $1, lead_id = $2, deal_id = $3, company_id = $4, title = $5, description = $6, due_date = $7, priority = $8, status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE task_id = $10
       RETURNING *`,
      [
        assigned_to || null, 
        lead_id || null, 
        deal_id || null, 
        company_id || null, 
        title, 
        description, 
        due_date || null, 
        priority, 
        status, 
        id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE task_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
