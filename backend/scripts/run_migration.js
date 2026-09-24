const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const migrationFile = process.argv[2] || 'v3_appointments.sql';
  const file = path.join(__dirname, '..', 'migrations', migrationFile);
  if (!fs.existsSync(file)) {
    console.error('Migration file not found:', file);
    process.exit(1);
  }
  const sql = fs.readFileSync(file, 'utf8');

  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Please set DB_HOST, DB_USER and DB_NAME environment variables');
    process.exit(1);
  }

  const conn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, multipleStatements: true });
  try {
    console.log('Running migration:', file);
    const [result] = await conn.query(sql);
    console.log('Migration executed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

if (require.main === module) run();
