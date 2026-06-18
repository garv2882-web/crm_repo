import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/leads
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.*,
        c.company_name,
        c.company_code,
        ct.first_name AS contact_first_name,
        ct.last_name AS contact_last_name,
        ct.email AS contact_email,
        u_assign.full_name AS assigned_user_name,
        u_create.full_name AS creator_name
      FROM leads l
      LEFT JOIN companies c ON l.company_id = c.company_id
      LEFT JOIN contacts ct ON l.primary_contact_id = ct.contact_id
      LEFT JOIN users u_assign ON l.assigned_to = u_assign.user_id
      LEFT JOIN users u_create ON l.created_by = u_create.user_id
      WHERE l.is_deleted = FALSE
      ORDER BY l.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const leadRes = await pool.query(`
      SELECT 
        l.*,
        c.company_name,
        c.industry AS company_industry,
        c.website AS company_website,
        ct.first_name AS contact_first_name,
        ct.last_name AS contact_last_name,
        ct.email AS contact_email,
        ct.mobile_number AS contact_mobile,
        u_assign.full_name AS assigned_user_name,
        u_create.full_name AS creator_name
      FROM leads l
      LEFT JOIN companies c ON l.company_id = c.company_id
      LEFT JOIN contacts ct ON l.primary_contact_id = ct.contact_id
      LEFT JOIN users u_assign ON l.assigned_to = u_assign.user_id
      LEFT JOIN users u_create ON l.created_by = u_create.user_id
      WHERE l.lead_id = $1 AND l.is_deleted = FALSE
    `, [id]);

    if (leadRes.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Get associated tasks
    const tasksRes = await pool.query(
      'SELECT * FROM tasks WHERE lead_id = $1 ORDER BY due_date ASC',
      [id]
    );

    // Get associated deals
    const dealsRes = await pool.query(
      'SELECT * FROM deals WHERE lead_id = $1 AND is_deleted = FALSE',
      [id]
    );

    res.json({
      ...leadRes.rows[0],
      tasks: tasksRes.rows,
      deals: dealsRes.rows
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/leads
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      company_id, primary_contact_id, assigned_to, created_by,
      lead_title, lead_source, lead_status, priority,
      estimated_revenue, conversion_probability, campaign_name,
      tags, notes
    } = req.body;

    const result = await client.query(
      `INSERT INTO leads (
        company_id, primary_contact_id, assigned_to, created_by,
        lead_title, lead_source, lead_status, priority,
        estimated_revenue, conversion_probability, campaign_name,
        tags, notes
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        company_id || null, primary_contact_id || null, assigned_to || null, created_by || null,
        lead_title, lead_source || 'Website', lead_status || 'New', priority || 'Medium',
        estimated_revenue || 0, conversion_probability || 0, campaign_name || '',
        JSON.stringify(tags || []), notes || ''
      ]
    );
    const newLead = result.rows[0];

    // Fetch user and company names for audit log
    const userRes = await client.query('SELECT full_name FROM users WHERE user_id = $1', [created_by || assigned_to]);
    const companyRes = await client.query('SELECT company_name FROM companies WHERE company_id = $1', [company_id]);
    
    const userName = userRes.rows[0]?.full_name || 'System';
    const companyName = companyRes.rows[0]?.company_name || 'Prospect';

    const activityId = 'act_' + Math.random().toString(36).substr(2, 9);
    const activityText = `<span>${userName}</span> created lead <span>${lead_title}</span> for ${companyName}`;

    await client.query(
      `INSERT INTO activities (activity_id, action_type, text, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [activityId, 'create_lead', activityText]
    );

    await client.query('COMMIT');
    res.status(201).json(newLead);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PUT /api/leads/:id
router.put('/:id', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const {
      company_id, primary_contact_id, assigned_to,
      lead_title, lead_source, lead_status, priority,
      estimated_revenue, conversion_probability, campaign_name,
      tags, notes
    } = req.body;

    // Get old lead status first
    const oldLeadRes = await client.query('SELECT lead_status, lead_title FROM leads WHERE lead_id = $1', [id]);
    if (oldLeadRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead not found' });
    }
    const oldStatus = oldLeadRes.rows[0].lead_status;

    const result = await client.query(
      `UPDATE leads 
       SET company_id = $1, primary_contact_id = $2, assigned_to = $3,
           lead_title = $4, lead_source = $5, lead_status = $6, priority = $7,
           estimated_revenue = $8, conversion_probability = $9, campaign_name = $10,
           tags = $11, notes = $12, updated_at = CURRENT_TIMESTAMP
       WHERE lead_id = $13 AND is_deleted = FALSE
       RETURNING *`,
      [
        company_id || null, primary_contact_id || null, assigned_to || null,
        lead_title, lead_source, lead_status, priority,
        estimated_revenue, conversion_probability, campaign_name,
        JSON.stringify(tags || []), notes,
        id
      ]
    );

    const updatedLead = result.rows[0];

    // Log status update if changed
    if (oldStatus !== lead_status) {
      const userRes = await client.query('SELECT full_name FROM users WHERE user_id = $1', [assigned_to]);
      const userName = userRes.rows[0]?.full_name || 'System';
      const activityId = 'act_' + Math.random().toString(36).substr(2, 9);
      const activityText = `<span>${userName}</span> updated status of <span>${lead_title}</span> to ${lead_status}`;

      await client.query(
        `INSERT INTO activities (activity_id, action_type, text, created_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [activityId, 'status_update', activityText]
      );
    }

    await client.query('COMMIT');
    res.json(updatedLead);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// DELETE /api/leads/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE leads 
       SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP 
       WHERE lead_id = $1 
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead soft-deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/leads/:id/convert
router.post('/:id/convert', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    
    // Find the lead
    const leadRes = await client.query('SELECT * FROM leads WHERE lead_id = $1 AND is_deleted = FALSE', [id]);
    if (leadRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead not found' });
    }
    const lead = leadRes.rows[0];

    // Update lead status to Converted
    await client.query(
      "UPDATE leads SET lead_status = 'Converted', updated_at = CURRENT_TIMESTAMP WHERE lead_id = $1",
      [id]
    );

    // Create a new deal
    const dealName = lead.lead_title + ' Deal';
    
    const dealRes = await client.query(
      `INSERT INTO deals (
         lead_id, company_id, contact_id, deal_owner, created_by,
         deal_name, deal_stage, deal_status, priority, probability_percentage,
         deal_value, currency, sales_pipeline
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'Qualification', 'Open', $7, $8, $9, 'INR', 'Standard')
       RETURNING *`,
      [
        id,
        lead.company_id,
        lead.primary_contact_id,
        lead.assigned_to,
        lead.created_by,
        dealName,
        lead.priority,
        lead.conversion_probability,
        lead.estimated_revenue
      ]
    );
    const newDeal = dealRes.rows[0];

    // Log activity
    const userRes = await client.query('SELECT full_name FROM users WHERE user_id = $1', [lead.assigned_to]);
    const userName = userRes.rows[0]?.full_name || 'System';
    const activityId = 'act_' + Math.random().toString(36).substr(2, 9);
    const activityText = `<span>${userName}</span> converted lead <span>${lead.lead_title}</span> into a Deal`;

    await client.query(
      `INSERT INTO activities (activity_id, action_type, text, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [activityId, 'convert_lead', activityText]
    );

    await client.query('COMMIT');
    res.json(newDeal);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
