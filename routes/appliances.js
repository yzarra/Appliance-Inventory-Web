// Appliances screen

// import express (driver) and instance of router and import appliance controller (methods) and method to verify password
const express = require('express');
const router = express.Router();
const applianceController = require('../controllers/applianceController');
const verifyToken = require('../middleware/verifyToken');

// GET means reading data, POST means sending data to be saved in db PUT means updating something that already exists
router.get('/',verifyToken, applianceController.getAll);
router.post('/', verifyToken, applianceController.addAppliance);
router.get('/search', verifyToken, applianceController.searchAppliances);
router.put('/:id', verifyToken, applianceController.editAppliance);
router.delete('/:id', verifyToken, applianceController.deleteAppliance);

// return statement
module.exports = router;