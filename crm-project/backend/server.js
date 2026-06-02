import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import { 
  SEED_USERS, 
  SEED_COMPANIES, 
  SEED_CONTACTS, 
  SEED_LEADS, 
  SEED_DEALS, 
  SEED_ACTIVITIES 
} from './seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Initialization DDL & Seed Runner
async function initDb() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running database migrations...');
    
    // 1. Alter companies to add annual_revenue if missing
    await client.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC(15,2);
    `);

    // 2. Alter deals to add company_id, contact_id, sales_pipeline if missing
    await client.query(`
      ALTER TABLE deals 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(company_id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(contact_id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS sales_pipeline VARCHAR(100);
    `);

    // 3. Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL,
        lead_id UUID REFERENCES leads(lead_id) ON DELETE SET NULL,
        deal_id UUID REFERENCES deals(deal_id) ON DELETE SET NULL,
        company_id UUID REFERENCES companies(company_id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        priority VARCHAR(50) DEFAULT 'Medium',
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        activity_id VARCHAR(255) PRIMARY KEY,
        action_type VARCHAR(100),
        text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables initialized/altered.');

    // --- SEED RUNNER ---
    // Seed Users
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count) === 0) {
      console.log('🌱 Seeding users...');
      for (const u of SEED_USERS) {
        await client.query(
          `INSERT INTO users (user_id, full_name, email, role, status) 
           VALUES ($1, $2, $3, $4, $5)`,
          [u.user_id, u.full_name, u.email, u.role, u.status]
        );
      }
    }

    // Seed Companies
    const companiesCount = await client.query('SELECT COUNT(*) FROM companies');
    if (parseInt(companiesCount.rows[0].count) === 0) {
      console.log('🌱 Seeding companies...');
      for (const c of SEED_COMPANIES) {
        await client.query(
          `INSERT INTO companies (company_id, company_name, company_code, industry, website, country, state, city, annual_revenue) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [c.company_id, c.company_name, c.company_code, c.industry, c.website, c.country, c.state, c.city, c.annual_revenue]
        );
      }
    }

    // Seed Contacts
    const contactsCount = await client.query('SELECT COUNT(*) FROM contacts');
    if (parseInt(contactsCount.rows[0].count) === 0) {
      console.log('🌱 Seeding contacts...');
      for (const ct of SEED_CONTACTS) {
        await client.query(
          `INSERT INTO contacts (contact_id, company_id, first_name, last_name, email, mobile_number, linkedin_profile, job_title, department) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [ct.contact_id, ct.company_id, ct.first_name, ct.last_name, ct.email, ct.mobile_number, ct.linkedin_profile, ct.job_title, ct.department]
        );
      }
    }

    // Seed Leads
    const leadsCount = await client.query('SELECT COUNT(*) FROM leads');
    if (parseInt(leadsCount.rows[0].count) === 0) {
      console.log('🌱 Seeding leads...');
      for (const l of SEED_LEADS) {
        await client.query(
          `INSERT INTO leads (lead_id, company_id, primary_contact_id, assigned_to, created_by, lead_title, lead_source, lead_status, priority, estimated_revenue, conversion_probability, campaign_name, tags, notes, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            l.lead_id, l.company_id, l.primary_contact_id, l.assigned_to, l.created_by,
            l.lead_title, l.lead_source, l.lead_status, l.priority, l.estimated_revenue,
            l.conversion_probability, l.campaign_name, JSON.stringify(l.tags), l.notes,
            l.created_at, l.updated_at
          ]
        );
      }
    }

    // Seed Deals
    const dealsCount = await client.query('SELECT COUNT(*) FROM deals');
    if (parseInt(dealsCount.rows[0].count) === 0) {
      console.log('🌱 Seeding deals...');
      for (const d of SEED_DEALS) {
        await client.query(
          `INSERT INTO deals (deal_id, lead_id, company_id, contact_id, deal_owner, deal_stage, deal_status, priority, probability_percentage, deal_value, currency, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            d.deal_id, d.lead_id, d.company_id, d.contact_id, d.deal_owner,
            d.deal_stage, d.deal_status, d.priority, d.probability_percentage,
            d.deal_value, d.currency, d.created_at
          ]
        );
      }
    }

    // Seed Activities
    const activitiesCount = await client.query('SELECT COUNT(*) FROM activities');
    if (parseInt(activitiesCount.rows[0].count) === 0) {
      console.log('🌱 Seeding activities...');
      for (const act of SEED_ACTIVITIES) {
        await client.query(
          `INSERT INTO activities (activity_id, action_type, text, created_at) 
           VALUES ($1, $2, $3, $4)`,
          [act.activity_id, act.action_type, act.text, act.created_at]
        );
      }
    }

    console.log('✅ Database seeding process complete.');

  } catch (err) {
    console.error('❌ Database initialization error:', err);
  } finally {
    client.release();
  }
}

// Boot database before configuring routes
initDb().then(() => {
  // Import routes dynamically or attach
  // We will mount router configurations
});

// Import route files (we will write these next)
import usersRouter from './routes/users.js';
import companiesRouter from './routes/companies.js';
import contactsRouter from './routes/contacts.js';
import leadsRouter from './routes/leads.js';
import dealsRouter from './routes/deals.js';
import tasksRouter from './routes/tasks.js';
import activitiesRouter from './routes/activities.js';

app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/activities', activitiesRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 SalesNest Backend Server running on http://localhost:${PORT}`);
});
