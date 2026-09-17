const { Pool } = require('pg');

// ─────────────────────────────────────────────────────────
// Multi-Environment PostgreSQL Configuration
// Development mode -> Local PostgreSQL (SSL disabled)
// Production mode  -> AWS RDS PostgreSQL (SSL enabled)
// ─────────────────────────────────────────────────────────

const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
const isProduction = nodeEnv === 'production';

let connectionString;
let ssl;

if (isProduction) {
  // Production Mode: AWS RDS PostgreSQL (SSL Enabled)
  connectionString = process.env.AWS_DATABASE_URL || process.env.DATABASE_URL;
  // Strip inline sslmode query parameter to avoid pg-connection-string security warnings
  if (connectionString?.includes('sslmode=')) {
    connectionString = connectionString.replace(/([?&])sslmode=[^&]*/, '$1').replace(/[?&]$/, '');
  }
  ssl = { rejectUnauthorized: false };
} else {
  // Development Mode: Local PostgreSQL (SSL Disabled)
  connectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
  ssl = false;
}

const pool = new Pool({
  connectionString,
  ssl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Execute a SQL query.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Acquire a client from pool for multi-statement transactions.
 */
const getClient = () => pool.connect();

// Auto-verify & patch optional schema columns on startup for seamless migrations
(async () => {
  try {
    await pool.query('ALTER TABLE workout_sets ADD COLUMN IF NOT EXISTS "caloriesBurned" INT DEFAULT 0');
    await pool.query('ALTER TABLE workouts ADD COLUMN IF NOT EXISTS "totalCalories" INT DEFAULT 0');
  } catch (err) {
    // Silent catch if tables are created later by migrate script
  }
})();

module.exports = {
  pool,
  query,
  getClient,
  isProduction,
  nodeEnv,
};
