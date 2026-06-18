import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'salesnest-super-secret-key-dev-fallback';
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'salesnest-super-secret-key-dev-fallback')) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET environment variable is missing or insecure in production!');
  process.exit(1);
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Please provide full name, email, and password' });
    }

    // Check if user already exists
    const userExistRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExistRes.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this email address already exists' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, status) 
       VALUES ($1, $2, $3, $4, 'Active') 
       RETURNING user_id, full_name, email, role, status, created_at`,
      [full_name, email, passwordHash, role || 'Sales']
    );

    const newUser = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { user_id: newUser.user_id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];

    // Verify password
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    };

    res.json({ token, user: userProfile });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userRes = await pool.query(
      'SELECT user_id, full_name, email, role, status, created_at FROM users WHERE user_id = $1',
      [decoded.user_id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User session not found' });
    }

    res.json({ user: userRes.rows[0] });
  } catch (err) {
    return res.status(401).json({ error: 'Token is invalid or expired' });
  }
});

export default router;
