import express from 'express';
import bcrypt from 'bcryptjs';
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

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/users
router.post('/', async (req, res, next) => {
  try {
    const { full_name, email, role, status, designation, department, notes, custom_permissions } = req.body;
    
    // Check if user already exists
    const exists = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email.trim().toLowerCase()]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const defaultHash = bcrypt.hashSync('password123', 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, role, status, designation, department, notes, custom_permissions, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        full_name,
        email.trim().toLowerCase(),
        role || 'Sales Rep — Standard',
        status || 'Pending',
        designation || 'Sales Executive',
        department || 'Sales',
        notes || '',
        JSON.stringify(custom_permissions || {}),
        defaultHash
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { full_name, role, status, designation, department, notes, custom_permissions } = req.body;
    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           role = COALESCE($2, role),
           status = COALESCE($3, status),
           designation = COALESCE($4, designation),
           department = COALESCE($5, department),
           notes = COALESCE($6, notes),
           custom_permissions = COALESCE($7, custom_permissions),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8
       RETURNING *`,
      [
        full_name || null,
        role || null,
        status || null,
        designation || null,
        department || null,
        notes || null,
        custom_permissions ? JSON.stringify(custom_permissions) : null,
        req.params.id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
