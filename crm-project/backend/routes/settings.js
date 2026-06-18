import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/settings
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM settings LIMIT 1');
    if (result.rows.length === 0) {
      // Return default settings structure if empty
      return res.json({
        orgName: 'Dexnest',
        timezone: 'Asia/Kolkata',
        dealStages: [],
        departments: [],
        roleTemplates: []
      });
    }
    const dbRow = result.rows[0];
    res.json({
      orgName: dbRow.org_name,
      timezone: dbRow.timezone,
      dealStages: dbRow.deal_stages || [],
      departments: dbRow.departments || [],
      roleTemplates: dbRow.role_templates || []
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings
router.put('/', async (req, res, next) => {
  try {
    const { orgName, timezone, dealStages, departments, roleTemplates } = req.body;
    
    // Get existing settings row
    const existing = await pool.query('SELECT * FROM settings LIMIT 1');
    
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO settings (org_name, timezone, deal_stages, departments, role_templates)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          orgName || 'Dexnest',
          timezone || 'Asia/Kolkata',
          JSON.stringify(dealStages || []),
          JSON.stringify(departments || []),
          JSON.stringify(roleTemplates || [])
        ]
      );
    } else {
      await pool.query(
        `UPDATE settings
         SET org_name = COALESCE($1, org_name),
             timezone = COALESCE($2, timezone),
             deal_stages = COALESCE($3, deal_stages),
             departments = COALESCE($4, departments),
             role_templates = COALESCE($5, role_templates)`,
        [
          orgName || null,
          timezone || null,
          dealStages ? JSON.stringify(dealStages) : null,
          departments ? JSON.stringify(departments) : null,
          roleTemplates ? JSON.stringify(roleTemplates) : null
        ]
      );
    }

    const updated = await pool.query('SELECT * FROM settings LIMIT 1');
    const dbRow = updated.rows[0];
    res.json({
      orgName: dbRow.org_name,
      timezone: dbRow.timezone,
      dealStages: dbRow.deal_stages || [],
      departments: dbRow.departments || [],
      roleTemplates: dbRow.role_templates || []
    });
  } catch (err) {
    next(err);
  }
});

export default router;
