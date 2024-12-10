// First install required dependencies:
// npm install pg

// db/config.js
import { Pool } from 'pg';

const pool = new Pool({
  user: 'next',
  host: 'localhost',
  database: 'next-dashboard',
  password: 'next',
  port: 5432,  // default PostgreSQL port
});

// Verify connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL');
});

// Helper function to run queries
export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    throw new Error(err);
  }
}

