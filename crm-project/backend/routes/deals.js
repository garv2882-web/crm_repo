import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/deals
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.*,
        l.lead_title,
        co.company_name,
        co.company_code,
        ct.first_name AS contact_first_name,
        ct.last_name AS contact_last_name,
        u.full_name AS deal_owner_name
      FROM deals d
      LEFT JOIN leads l ON d.lead_id = l.lead_id
      LEFT JOIN companies co ON d.company_id = co.company_id
      LEFT JOIN contacts ct ON d.contact_id = ct.contact_id
      LEFT JOIN users u ON d.deal_owner = u.user_id
      WHERE d.is_deleted = FALSE
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/deals/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        d.*,
        l.lead_title,
        co.company_name,
        co.industry AS company_industry,
        ct.first_name AS contact_first_name,
        ct.last_name AS contact_last_name,
        ct.email AS contact_email,
        ct.mobile_number AS contact_mobile,
        u.full_name AS deal_owner_name
      FROM deals d
      LEFT JOIN leads l ON d.lead_id = l.lead_id
      LEFT JOIN companies co ON d.company_id = co.company_id
      LEFT JOIN contacts ct ON d.contact_id = ct.contact_id
      LEFT JOIN users u ON d.deal_owner = u.user_id
      WHERE d.deal_id = $1 AND d.is_deleted = FALSE
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Get associated tasks
    const tasksRes = await pool.query(
      'SELECT * FROM tasks WHERE deal_id = $1 ORDER BY due_date ASC',
      [id]
    );

    res.json({
      ...result.rows[0],
      tasks: tasksRes.rows
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/deals
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      lead_id, company_id, contact_id, deal_owner, created_by,
      deal_name, deal_stage, deal_status, priority,
      probability_percentage, deal_value, currency, sales_pipeline,
      expected_closing_date, product_service, competitors,
      deal_source, negotiation_status, contract_status, tags, notes
    } = req.body;

    const result = await client.query(
      `INSERT INTO deals (
        lead_id, company_id, contact_id, deal_owner, created_by,
        deal_name, deal_stage, deal_status, priority,
        probability_percentage, deal_value, currency, sales_pipeline,
        expected_closing_date, product_service, competitors,
        deal_source, negotiation_status, contract_status, tags, notes
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        lead_id || null, company_id || null, contact_id || null, deal_owner || null, created_by || null,
        deal_name, deal_stage || 'Qualification', deal_status || 'Open', priority || 'Medium',
        probability_percentage || 0, deal_value || 0, currency || 'INR', sales_pipeline || 'Standard',
        expected_closing_date || null, product_service || '', competitors || '',
        deal_source || '', negotiation_status || '', contract_status || '',
        JSON.stringify(tags || []), notes || ''
      ]
    );
    const newDeal = result.rows[0];

    // Log activity
    const userRes = await client.query('SELECT full_name FROM users WHERE user_id = $1', [deal_owner || created_by]);
    const userName = userRes.rows[0]?.full_name || 'System';
    const activityId = 'act_' + Math.random().toString(36).substr(2, 9);
    const activityText = `<span>${userName}</span> converted/created deal <span>${deal_name}</span> valued at ${currency || 'INR'} ${deal_value}`;

    await client.query(
      `INSERT INTO activities (activity_id, action_type, text, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [activityId, 'convert_lead', activityText]
    );

    await client.query('COMMIT');
    res.status(201).json(newDeal);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PUT /api/deals/:id
router.put('/:id', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const {
      lead_id, company_id, contact_id, deal_owner,
      deal_name, deal_stage, deal_status, priority,
      probability_percentage, deal_value, currency, sales_pipeline,
      expected_closing_date, product_service, competitors,
      deal_source, negotiation_status, contract_status, tags, notes
    } = req.body;

    // Get old stage first
    const oldDealRes = await client.query('SELECT deal_stage FROM deals WHERE deal_id = $1', [id]);
    if (oldDealRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Deal not found' });
    }
    const oldStage = oldDealRes.rows[0].deal_stage;

    const result = await client.query(
      `UPDATE deals 
       SET lead_id = $1, company_id = $2, contact_id = $3, deal_owner = $4,
           deal_name = $5, deal_stage = $6, deal_status = $7, priority = $8,
           probability_percentage = $9, deal_value = $10, currency = $11, sales_pipeline = $12,
           expected_closing_date = $13, product_service = $14, competitors = $15,
           deal_source = $16, negotiation_status = $17, contract_status = $18,
           tags = $19, notes = $20, updated_at = CURRENT_TIMESTAMP
       WHERE deal_id = $21 AND is_deleted = FALSE
       RETURNING *`,
      [
        lead_id, company_id || null, contact_id || null, deal_owner || null,
        deal_name, deal_stage, deal_status, priority,
        probability_percentage, deal_value, currency, sales_pipeline,
        expected_closing_date || null, product_service, competitors,
        deal_source, negotiation_status, contract_status,
        JSON.stringify(tags || []), notes,
        id
      ]
    );

    const updatedDeal = result.rows[0];

    // Log update if stage changed
    if (oldStage !== deal_stage) {
      const userRes = await client.query('SELECT full_name FROM users WHERE user_id = $1', [deal_owner]);
      const userName = userRes.rows[0]?.full_name || 'System';
      const activityId = 'act_' + Math.random().toString(36).substr(2, 9);
      const activityText = `<span>${userName}</span> updated stage of deal <span>${deal_name}</span> to ${deal_stage}`;

      await client.query(
        `INSERT INTO activities (activity_id, action_type, text, created_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [activityId, 'status_update', activityText]
      );
    }

    await client.query('COMMIT');
    res.json(updatedDeal);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// DELETE /api/deals/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE deals 
       SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP 
       WHERE deal_id = $1 
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json({ message: 'Deal soft-deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
