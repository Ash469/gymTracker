require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function migrate() {
  const activeUrl = pool.options?.connectionString || process.env.DATABASE_URL || 'NOT SET';
  console.log('⚡ Running database migrations...');
  console.log(`📌 Target DB URL: ${activeUrl.replace(/:[^:@]+@/, ':****@')}\n`);

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('✅ Database migrations applied successfully.\n');
  } catch (err) {
    console.error('❌ Migration failed!');
    console.error('   Message:', err.message);
    if (err.code) console.error('   PostgreSQL Code:', err.code);
    if (err.detail) console.error('   Detail:', err.detail);
    if (err.hint) console.error('   Hint:', err.hint);
    console.error('\nFull Error:\n', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
