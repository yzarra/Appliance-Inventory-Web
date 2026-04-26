// Password screen logic / methods

// import bycrypt (scrambles passwords) and import jsonwebtoken (creates & verifies login tokens) & import pool
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// REGISTER Method
const register = async (req, res) => {
    // input, basically String username = keyboard.nextLine() and String password = keyboard.nextLine();
    const { username, password } = req.body;

    // check for invalid input
    if (!username || !password){
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // try catch block
    try{ 
        // check if username is available
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        // If taken (existingUser.rows is an array so if >0, username is taken)
        if (existingUser.rows.length > 0){
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Scramble the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const result = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        
        // Print success and info
        res.status(201).json({
            message: 'User registered successfully',
            user: { id: result.rows[0].id, username: result.rows[0].username }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: ' Server error during registration' });
    }
};

// LOGIN Method
const login = async (req, res) => {
    const { username, password } = req.body;

    // if empty input
    if (!username || !password){
        return res.status(400).json({ error: 'Username and password are required' });
    } 

    // try catch block
    try {
        // check if user exists
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        // if user not found
        if (result.rows.length === 0){
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const user = result.rows[0];

        // compare password with hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        // invalid password
        if (!passwordMatch){
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // password correct, create token
        const token = jwt.sign(
            { id: user.id }, // payload encoded in token
            process.env.JWT_SECRET, // secret key from env
            { expiresIn: '24h' } // how long password is valid for b4 have to login again
        );

        // return token and user info
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// return statement (both methods)
module.exports = { register, login };

