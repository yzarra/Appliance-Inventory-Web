// Like the Driver of the application

// Import Express (like a library - handles incoming http req.s) and Import cors (allows frontend to send requests to backend) and Import .env variables 
const express = require('express');
const cors = require('cors');

// Load environment variables from .env file
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// create instance of application
const app = express();

// Scanner
app.use(express.json());

app.use(cors());

// import route files (like importing classes)
const authRoutes = require('./routes/auth');
const applianceRoutes = require('./routes/appliances');

// register routes w url prefix
app.use('/api/auth', authRoutes);
app.use('/api/appliances', applianceRoutes);

// read port from env (OR default to 3000)
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // print for test
});