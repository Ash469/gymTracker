const { Pool } = require('pg');

// ─────────────────────────────────────────────────────────
// Multi-Environment PostgreSQL Configuration
// Development mode -> Local PostgreSQL (SSL disabled)
// Production mode  -> AWS RDS PostgreSQL (SSL enabled)
// ─────────────────────────────────────────────────────────

const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
const isProduction = nodeEnv === 'production';

let connectionString = isProduction 
  ? (process.env.AWS_DATABASE_URL || process.env.DATABASE_URL)
  : (process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL);

let ssl = false;
if (isProduction) {
  // Strip inline sslmode query parameter to avoid pg-connection-string security warnings
  if (connectionString?.includes('sslmode=')) {
    connectionString = connectionString.replace(/([?&])sslmode=[^&]*/, '$1').replace(/[?&]$/, '');
  }
  ssl = { rejectUnauthorized: false };
}

// Fallback dummy connection string if env vars are missing to prevent pg.Pool cold-boot crash
const activeDbConfigured = Boolean(connectionString);
if (!connectionString) {
  console.warn('⚠️ WARNING: No PostgreSQL connection string configured in environment variables.');
  connectionString = 'postgresql://postgres:dummy@127.0.0.1:5432/FormFit';
}

const pool = new Pool({
  connectionString,
  ssl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 4000,
});

pool.on('error', (err) => {
  console.error('❌ Idle PostgreSQL client error:', err.message);
});

/**
 * Safe query wrapper that handles missing database connection strings gracefully.
 */
async function query(text, params) {
  if (!activeDbConfigured) {
    const err = new Error('AWS_DATABASE_URL environment variable is not configured in Vercel Settings.');
    err.statusCode = 500;
    throw err;
  }
  return pool.query(text, params);
}

/**
 * Acquire a client from pool for multi-statement transactions.
 */
const getClient = () => pool.connect();

module.exports = {
  pool,
  query,
  getClient,
  isProduction,
  nodeEnv,
};
