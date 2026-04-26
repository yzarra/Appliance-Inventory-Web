// Verifies User's Token

// Import jsonwebtoken 
const jwt = require('jsonwebtoken');

// method
const verifyToken = ( req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // if input empty
    if (!authHeader){
        return res.status(401).json({ error: 'No token provided. Please log in.'});
    }

    // grab token
    const token = authHeader.split(' ')[1];

    // not valid
    if (!token) {
        return res.stauts(401).json({ error: 'Malformed token. Please log in again.'});
    }

    // valid 
    try {
        // decode scrambled password, error if expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next()
    } catch (error) {
        console.error('Token verification failed', error.message);
        return res.status(403).json({ error: 'Invalid or expired token. Please log in again.'});
    }
};

// return statement
module.exports = verifyToken;