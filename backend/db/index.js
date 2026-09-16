const { Pool } = require('pg');

// Parse DATABASE_URL or use individual env variables
const connectionString = process.env.DATABASE_URL;

// Determine SSL config: required for AWS RDS or production if specified
const isProduction = process.env.NODE_ENV === 'production';
const ssl = isProduction || connectionString?.includes('sslmode=require')
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString,
  ssl,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Execute a query with parameters.
 * @param {string} text - SQL query string
 * @param {Array} [params] - Parameter values
 */
const query = (text, params) => pool.query(text, params);

/**
 * Acquire a client from pool for transactions.
 */
const getClient = () => pool.connect();

module.exports = {
  pool,
  query,
  getClient,
};
