import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Leser miljøvariabler fra .env

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Kreves for Render
  },
});

export default pool;
