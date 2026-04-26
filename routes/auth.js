// routes are like screens w no methods, method classes r controllers, routes just call on them
// Password screen

// Import express (driver) and create instance of router and import auth controller (method implementation/logic class)
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// selection 1 = register, selection 2 = login
router.post('/register', authController.register); // if login pressed, do login method etc
router.post('/login', authController.login); // post means send the data to the server

// return statement
module.exports = router;