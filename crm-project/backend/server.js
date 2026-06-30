import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from './db.js';
import { 
  SEED_USERS, 
  SEED_COMPANIES, 
  SEED_CONTACTS, 
  SEED_LEADS, 
  SEED_DEALS, 
  SEED_ACTIVITIES,
  SEED_CAMPAIGNS,
  SEED_SUPPORT_CASES,
  SEED_KB_ARTICLES,
  SEED_SOCIAL_ENGAGEMENTS,
  SEED_EMAIL_MESSAGES
} from './seedData.js';

dotenv.config();

// Assert JWT_SECRET configuration
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: JWT_SECRET environment variable is not defined!');
    process.exit(1);
  } else {
    console.warn('⚠️ WARNING: JWT_SECRET environment variable is missing. Falling back for development only.');
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Custom CORS policy whitelisting
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow local development and Vercel domains
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                      origin.endsWith('.vercel.app') || 
                      /^http:\/\/localhost:\d+$/.test(origin);

    if (!isAllowed) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Custom lightweight in-memory rate limiter middleware for authentication
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_LIMIT = 30; // Max 30 attempts per 15 minutes per IP

const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    return next();
  }
  
  const clientData = rateLimitMap.get(ip);
  if (now - clientData.firstRequestTime > RATE_LIMIT_WINDOW) {
    clientData.count = 1;
    clientData.firstRequestTime = now;
    return next();
  }
  
  clientData.count++;
  if (clientData.count > MAX_LIMIT) {
    return res.status(429).json({ 
      error: 'Too Many Requests', 
      details: 'Rate limit exceeded for authentication requests. Please try again after 15 minutes.' 
    });
  }
  next();
};

app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);

// Database Initialization DDL & Seed Runner
async function initDb() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running database migrations...');
    
    // 0. Create custom types (enums) if they don't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('Admin', 'Sales', 'Manager');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
          CREATE TYPE lead_status AS ENUM ('New', 'Contacted', 'Qualified', 'Converted', 'Disqualified');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
          CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_status') THEN
          CREATE TYPE deal_status AS ENUM ('Open', 'Won', 'Lost', 'Cancelled');
        END IF;
      END$$;
    `);

    // 1. Create core tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(255) NOT NULL DEFAULT 'Sales Rep — Standard',
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
        company_name VARCHAR(255) NOT NULL,
        company_code VARCHAR(100) UNIQUE,
        industry VARCHAR(100),
        website VARCHAR(255),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        notes TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(company_id) ON DELETE SET NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255),
        mobile_number VARCHAR(20),
        linkedin_profile VARCHAR(255),
        job_title VARCHAR(100),
        department VARCHAR(100),
        notes TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        lead_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(company_id) ON DELETE SET NULL,
        primary_contact_id UUID REFERENCES contacts(contact_id) ON DELETE SET NULL,
        assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL,
        created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
        lead_title VARCHAR(255) NOT NULL,
        lead_source VARCHAR(100),
        lead_status lead_status DEFAULT 'New',
        priority priority_level DEFAULT 'Medium',
        estimated_revenue DECIMAL(15,2),
        conversion_probability DECIMAL(5,2),
        campaign_name VARCHAR(255),
        tags JSON,
        custom_fields JSON,
        notes TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS deals (
        deal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES leads(lead_id) ON DELETE CASCADE,
        company_id UUID REFERENCES companies(company_id) ON DELETE SET NULL,
        contact_id UUID REFERENCES contacts(contact_id) ON DELETE SET NULL,
        deal_owner UUID REFERENCES users(user_id) ON DELETE SET NULL,
        created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
        deal_name VARCHAR(255) NOT NULL,
        deal_stage VARCHAR(100),
        deal_status deal_status DEFAULT 'Open',
        priority priority_level DEFAULT 'Medium',
        probability_percentage DECIMAL(5,2),
        deal_value DECIMAL(15,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        sales_pipeline VARCHAR(100),
        expected_closing_date DATE,
        product_service VARCHAR(255),
        competitors TEXT,
        deal_source VARCHAR(100),
        negotiation_status VARCHAR(100),
        contract_status VARCHAR(100),
        last_activity_date TIMESTAMP,
        next_follow_up_date TIMESTAMP,
        tags JSON,
        custom_fields JSON,
        notes TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Run alter scripts for backwards-compatibility or partial schemas
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
      ADD COLUMN IF NOT EXISTS department VARCHAR(100),
      ADD COLUMN IF NOT EXISTS last_active TIMESTAMP,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS custom_permissions JSONB;
    `);

    // Ensure role column is VARCHAR(255) rather than the restricted user_role enum
    await client.query(`
      ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255);
    `);

    const defaultHash = bcrypt.hashSync('password123', 10);
    await client.query(`
      UPDATE users 
      SET password_hash = $1 
      WHERE password_hash IS NULL
    `, [defaultHash]);

    await client.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC(15,2);
    `);

    await client.query(`
      ALTER TABLE deals 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(company_id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(contact_id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS deal_owner UUID REFERENCES users(user_id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
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

    // Create settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        org_name VARCHAR(255) DEFAULT 'Dexnest',
        timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
        deal_stages JSONB,
        departments JSONB,
        role_templates JSONB
      );
    `);

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(255) PRIMARY KEY,
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP,
        duration INTEGER
      );
    `);

    // Create activity_log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        log_id VARCHAR(255) PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        actor_name VARCHAR(255),
        actor_email VARCHAR(255),
        affected_record VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        detail_string TEXT
      );
    `);

    // 5. Create Campaigns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_name VARCHAR(255) NOT NULL,
        campaign_type VARCHAR(100),
        status VARCHAR(100),
        budget DECIMAL(15,2),
        actual_cost DECIMAL(15,2),
        expected_revenue DECIMAL(15,2),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create KB Articles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS kb_articles (
        article_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Draft',
        created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create Support Cases table
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_cases (
        case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_number VARCHAR(50) UNIQUE NOT NULL,
        subject VARCHAR(255) NOT NULL,
        company_id UUID REFERENCES companies(company_id) ON DELETE SET NULL,
        assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL,
        priority VARCHAR(50) DEFAULT 'Medium',
        status VARCHAR(50) DEFAULT 'New',
        description TEXT,
        solution_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Create Support Tasks checklist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tasks (
        task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id UUID REFERENCES support_cases(case_id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Create Social Engagements timeline logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_engagements (
        engagement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES leads(lead_id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        direction VARCHAR(50) NOT NULL,
        content TEXT,
        sender_handle VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Create Email Messages timeline logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_messages (
        email_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES leads(lead_id) ON DELETE CASCADE,
        subject VARCHAR(255),
        body TEXT,
        direction VARCHAR(50) NOT NULL,
        sender VARCHAR(255),
        recipient VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Sent',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. Alter table schemas for relationships
    await client.query(`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(campaign_id) ON DELETE SET NULL;
    `);

    console.log('✅ Database tables initialized/altered.');

    // --- TEMPORARY WIPE AND PROVISION ---
    // Only run this wipe/provision block if user 'hrakeshkumar37@gmail.com' does not exist yet.
    // This wipes the demo/sandbox database and configures a clean environment once.
    const adminCheck = await client.query('SELECT * FROM users WHERE email = $1', ['hrakeshkumar37@gmail.com']);
    if (adminCheck.rows.length === 0) {
      console.log('🧹 Wiping old database data and initializing clean production state...');
      await client.query(`
        TRUNCATE TABLE 
          users, companies, contacts, leads, deals, activities, 
          activity_log, sessions, settings, campaigns, support_cases, 
          support_tasks, kb_articles, social_engagements, email_messages 
        CASCADE;
      `);

      // Seed the single allowed admin user
      const defaultHash = bcrypt.hashSync('password123', 10);
      await client.query(
        `INSERT INTO users (full_name, email, role, status, password_hash) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['H Rakesh Kumar', 'hrakeshkumar37@gmail.com', 'Admin', 'Active', defaultHash]
      );

      // Seed default settings config
      const defaultStages = [
        { id: 'Qualification', name: 'Qualification' },
        { id: 'Discovery', name: 'Discovery' },
        { id: 'Proposal', name: 'Proposal' },
        { id: 'Negotiation', name: 'Negotiation' },
        { id: 'Contract', name: 'Contract' },
        { id: 'Closed Won', name: 'Closed Won' },
        { id: 'Closed Lost', name: 'Closed Lost' }
      ];
      const defaultDepts = ['Sales', 'Marketing', 'Engineering', 'HR', 'Executive', 'Operations'];
      const defaultTemplates = [
        {
          name: 'Sales Rep — View Only',
          permissions: {
            canViewAllDeals: true,
            canCreateDeals: false,
            canEditOwnDeals: false,
            canEditAllDeals: false,
            canDeleteDeals: false,
            canChangeDealStage: false,
            canViewAllContacts: true,
            canCreateContacts: false,
            canEditContacts: false,
            canDeleteContacts: false,
            canExportContacts: false,
            canViewAllTasks: true,
            canCreateTasks: false,
            canReassignTasks: false,
            canDeleteTasks: false,
            canAccessIntegrationsPage: false
          }
        },
        {
          name: 'Sales Rep — Standard',
          permissions: {
            canViewAllDeals: true,
            canCreateDeals: true,
            canEditOwnDeals: true,
            canEditAllDeals: false,
            canDeleteDeals: false,
            canChangeDealStage: true,
            canViewAllContacts: true,
            canCreateContacts: true,
            canEditContacts: true,
            canDeleteContacts: false,
            canExportContacts: false,
            canViewAllTasks: true,
            canCreateTasks: true,
            canReassignTasks: false,
            canDeleteTasks: false,
            canAccessIntegrationsPage: false
          }
        },
        {
          name: 'Senior Executive',
          permissions: {
            canViewAllDeals: true,
            canCreateDeals: true,
            canEditOwnDeals: true,
            canEditAllDeals: true,
            canDeleteDeals: true,
            canChangeDealStage: true,
            canViewAllContacts: true,
            canCreateContacts: true,
            canEditContacts: true,
            canDeleteContacts: true,
            canExportContacts: true,
            canViewAllTasks: true,
            canCreateTasks: true,
            canReassignTasks: true,
            canDeleteTasks: true,
            canAccessIntegrationsPage: true
          }
        }
      ];

      await client.query(
        `INSERT INTO settings (org_name, timezone, deal_stages, departments, role_templates)
         VALUES ('Dexnest', 'Asia/Kolkata', $1, $2, $3)`,
        [JSON.stringify(defaultStages), JSON.stringify(defaultDepts), JSON.stringify(defaultTemplates)]
      );
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

// Import route files
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import companiesRouter from './routes/companies.js';
import contactsRouter from './routes/contacts.js';
import leadsRouter from './routes/leads.js';
import dealsRouter from './routes/deals.js';
import tasksRouter from './routes/tasks.js';
import activitiesRouter from './routes/activities.js';
import campaignsRouter from './routes/campaigns.js';
import supportCasesRouter from './routes/supportCases.js';
import kbArticlesRouter from './routes/kbArticles.js';
import socialRouter from './routes/social.js';
import emailsRouter from './routes/emails.js';
import settingsRouter from './routes/settings.js';
import sessionsRouter from './routes/sessions.js';
import activityLogRouter from './routes/activityLog.js';

// JWT authentication middleware
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

const verifyToken = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  let token = cookies.crm_auth_token;

  if (!token) {
    // Fallback to Auth header for standard client support
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authenticated token required.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Import jwt globally at top or dynamically here
import jwt from 'jsonwebtoken';

app.use('/api/auth', authRouter);
app.use('/api/users', verifyToken, usersRouter);
app.use('/api/companies', verifyToken, companiesRouter);
app.use('/api/contacts', verifyToken, contactsRouter);
app.use('/api/leads', verifyToken, leadsRouter);
app.use('/api/deals', verifyToken, dealsRouter);
app.use('/api/tasks', verifyToken, tasksRouter);
app.use('/api/activities', verifyToken, activitiesRouter);
app.use('/api/campaigns', verifyToken, campaignsRouter);
app.use('/api/support-cases', verifyToken, supportCasesRouter);
app.use('/api/kb-articles', verifyToken, kbArticlesRouter);
app.use('/api/social-engagements', verifyToken, socialRouter);
app.use('/api/email-messages', verifyToken, emailsRouter);
app.use('/api/settings', verifyToken, settingsRouter);
app.use('/api/sessions', verifyToken, sessionsRouter);
app.use('/api/activity-log', verifyToken, activityLogRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 SalesNest Backend Server running on http://localhost:${PORT}`);
});
