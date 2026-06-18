import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/kb-articles
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        u.full_name AS creator_name
      FROM kb_articles a
      LEFT JOIN users u ON a.created_by = u.user_id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/kb-articles/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        u.full_name AS creator_name
      FROM kb_articles a
      LEFT JOIN users u ON a.created_by = u.user_id
      WHERE a.article_id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/kb-articles
router.post('/', async (req, res, next) => {
  try {
    const { title, content, category, status } = req.body;
    // Set created_by from authenticated user
    const created_by = req.user ? req.user.user_id : null;

    const result = await pool.query(
      `INSERT INTO kb_articles (title, content, category, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        title || 'Untitled Article',
        content || '',
        category || 'General',
        status || 'Draft',
        created_by
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/kb-articles/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { title, content, category, status } = req.body;
    const result = await pool.query(
      `UPDATE kb_articles
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           category = COALESCE($3, category),
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE article_id = $5
       RETURNING *`,
      [
        title || null,
        content || null,
        category || null,
        status || null,
        req.params.id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Article not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/kb-articles/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM kb_articles WHERE article_id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
