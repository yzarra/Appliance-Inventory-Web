// creates and exports the database connection
const { Pool } = require('pg');

// create a new pool instance with connection settings
const pool = new Pool(
    process.env.DATABASE_URL
        ? { 
            // Railway connection settings
            connectionString: process.env.DATABASE_URL, 
            ssl: { rejectUnauthorized: false } // required for Railway's PostgreSQL
          }
        : {
            // local connection settings
            host: 'localhost',
            port: 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
          }
);

// return statement
module.exports = pool;