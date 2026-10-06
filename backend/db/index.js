const { Pool } = require('pg');

// ─────────────────────────────────────────────────────────
// Multi-Environment PostgreSQL Configuration
// Development mode -> Local PostgreSQL (SSL disabled)
// Production mode  -> AWS RDS PostgreSQL (SSL enabled)
// ─────────────────────────────────────────────────────────

const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
const isProduction = nodeEnv === 'production';

let connectionString = isProduction 
  ? ( process.env.DATABASE_URL)
  : (process.env.LOCAL_DATABASE_URL);



const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 4000,
});

pool.on('error', (err) => {
  console.error('❌ Idle PostgreSQL client error:', err.message);
});


async function query(text, params) {
  if (!connectionString) {
    const err = new Error('DATABASE_URL environment variable is not configured.');
    err.statusCode = 500;
    throw err;
  }
  return pool.query(text, params);
}

const getClient = () => pool.connect();

module.exports = {
  pool,
  query,
  getClient,
  isProduction,
  nodeEnv,
};
