// creates and exports the database connection
const { Pool } = require('pg');

// check if running in Railway or local environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

// create a new pool instance with connection settings
const pool = new Pool(
    isProduction
        ? {
            // connection settings for Railway
            host: 'hopper.proxy.rlwy.net',
            port: 51698,
            database: 'railway',
            user: 'postgres',
            password: process.env.DB_PASSWORD,
            ssl: { rejectUnauthorized: false }
          }
        : {
            // connection settings for local development
            host: 'localhost',
            port: 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
          }
);

// test
console.log('Is production:', isProduction);
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
// return statement
module.exports = pool;