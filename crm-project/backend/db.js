import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2901',
  database: process.env.DB_DATABASE || 'crm_db',
});

// Test connection on boot
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL Connection pool error:', err.message);
  } else {
    console.log('✅ PostgreSQL Database connected successfully via Pool');
  }
});

export default pool;
