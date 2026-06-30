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

const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      list[name] = decodeURIComponent(value);
    }
  });
  return list;
};

const isAdminEmail = (email) => {
  if (!email) return false;
  return email.trim().toLowerCase() === 'hrakeshkumar37@gmail.com';
};

// GET /api/auth/check-email
router.get('/check-email', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Please provide email address' });
    }

    const emailLower = email.trim().toLowerCase();
    
    // Check if user exists
    const userRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [emailLower]);
    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      if (user.status === 'Suspended') {
        return res.status(403).json({ error: 'Your account has been suspended. Contact your administrator.' });
      }
      return res.json({ exists: true, status: user.status });
    }

    // Auto-provision if it's allowlisted admin
    if (isAdminEmail(emailLower)) {
      const defaultHash = bcrypt.hashSync('password123', 10);
      const insertRes = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, status)
         VALUES ($1, $2, $3, 'Senior Executive', 'Active')
         RETURNING user_id, full_name, email, role, status`,
        [emailLower.split('@')[0].toUpperCase(), emailLower, defaultHash]
      );
      return res.json({ exists: true, user: insertRes.rows[0] });
    }

    return res.status(404).json({ error: 'User email not found in employee directory' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: 'Please provide full name and email' });
    }

    const emailLower = email.trim().toLowerCase();

    // Check if user already exists
    const userExistRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [emailLower]);
    let activeUser;

    if (userExistRes.rows.length > 0) {
      const existing = userExistRes.rows[0];
      if (existing.status !== 'Pending') {
        return res.status(400).json({ error: 'This email is already registered. Please sign in instead.' });
      }
      
      // Update pending user to active
      const updateRes = await pool.query(
        `UPDATE users
         SET full_name = $1, status = 'Active', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2
         RETURNING user_id, full_name, email, role, status, created_at`,
        [full_name, existing.user_id]
      );
      activeUser = updateRes.rows[0];
    } else {
      // Allow self-registration only if they are an admin
      if (isAdminEmail(emailLower)) {
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password || 'password123', salt);

        const result = await pool.query(
          `INSERT INTO users (full_name, email, password_hash, role, status) 
           VALUES ($1, $2, $3, 'Senior Executive', 'Active') 
           RETURNING user_id, full_name, email, role, status, created_at`,
          [full_name, emailLower, passwordHash]
        );
        activeUser = result.rows[0];
      } else {
        return res.status(400).json({ error: 'Your email address was not found in the employee directory. Please contact your CRM Admin.' });
      }
    }

    // Generate token
    const token = jwt.sign(
      { user_id: activeUser.user_id, email: activeUser.email, role: activeUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    res.cookie('crm_auth_token', token, cookieOptions);

    res.status(201).json({ user: activeUser });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide email' });
    }

    const emailLower = email.trim().toLowerCase();

    // Find user
    let userRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [emailLower]);
    
    // Auto-provision admin if they don't exist yet
    if (userRes.rows.length === 0 && isAdminEmail(emailLower)) {
      const defaultHash = bcrypt.hashSync(password || 'password123', 10);
      await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, status)
         VALUES ($1, $2, $3, 'Senior Executive', 'Active')`,
        [emailLower.split('@')[0].toUpperCase(), emailLower, defaultHash]
      );
      userRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [emailLower]);
    }

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or user not found' });
    }

    const user = userRes.rows[0];

    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Contact your administrator.' });
    }

    // Verify password (optional only for the allowlisted admin)
    const isPasslessAdmin = isAdminEmail(emailLower) && !password;

    if (!isPasslessAdmin) {
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      if (!user.password_hash) {
        return res.status(401).json({ error: 'Password has not been set for this account' });
      }
      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // Generate token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    res.cookie('crm_auth_token', token, cookieOptions);

    // Update last active
    await pool.query('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);

    const userProfile = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    };

    res.json({ user: userProfile });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('crm_auth_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/'
  });
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.crm_auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const userRes = await pool.query(
      'SELECT user_id, full_name, email, role, status, created_at FROM users WHERE user_id = $1',
      [decoded.user_id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User session not found' });
    }

    const user = userRes.rows[0];
    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'Account suspended' });
    }

    res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Token is invalid or expired' });
  }
});

export default router;
