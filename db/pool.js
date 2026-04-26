// creates and exports the database (db) connection 

// import pool (manages database connections) from sql (pg) library
const { Pool } = require('pg');

// load .env file
require('dotenv').config();

// create new instance of pool object
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    // password keys from env
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// like a return statement
// if you import pool.js this is what it recieves (pool object)
module.exports = pool;