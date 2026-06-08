// Appliance screen methods

const pool = require('../db/pool');

// LIST ALL APPLIANCES OF USER
const getAll = async (req, res) => {
    try{
        const result = await pool.query(
            'SELECT * FROM appliances WHERE user_id = $1 ORDER BY id ASC', 
            [req.user.id]
        );
        // send array of appliances as JSON
        res.json(result.rows);
    } catch (error) {
        console.error('getAll error: ', error);
        res.status(500).json({ error: 'Failed to fetch appliances' });
    }
};

// ENTER NEW APPLIANCE
const addAppliance = async (req, res) => {

    // input
    const { model, brand, price } = req.body;

    // valid appliance models
    const validModels = ['Fridge', 'Air Conditioner', 'Washer', 'Dryer', 
        'Freezer', 'Stove', 'Dishwasher', 'Water Heater', 'Microwave'];
    
    // validate input
    if (!model || !brand || !price){
        return res.status(400).json({ error: 'Model, brand and price are required'});
    }
    if (!validModels.includes(model)){
        return res.status(400).json({ error: 'Invalid appliance model' });
    }
    if (price < 1){
        return res.status(400).json({ error: 'Price must be at least $1' });
    }

    // try catch
    try {
        // insert appliance into database
        const result = await pool.query(
            'INSERT INTO appliances (model, brand, price, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [model, brand, price, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('addAppliance error: ', error);
        res.status(500).json({ error: 'Failed to add appliance'});
    }
};

// EDIT APPLIANCE
const editAppliance = async (req, res) => {
    // search for appliance
    const { id } = req.params;
    const { model, brand, price } = req.body;
    const validModels = ['Fridge', 'Air Conditioner', 'Washer', 'Dryer',
        'Freezer', 'Stove', 'Dishwasher', 'Water Heater', 'Microwave'];
    
    // validate - rules for adding an appliance
    if (model && !validModels.includes(model)){
        return res.status(400).json({ error: 'Invalid appliance model' });
    }
    if (price && price < 1) {
        return res.status(400).json({ error: 'Price must be at least $1 '});
    }

    // try catch block 
    try {
        // check if exists and belongs to user
        const existing = await pool.query(
            'SELECT * FROM appliances WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (existing.rows.length === 0){
            return res.status(404).json({ error: 'Appliance not found' });
        }

        // update chosen field and keep the rest the same
        const updatedModel = model || existing.rows[0].model;
        const updatedBrand = brand || existing.rows[0].brand;
        const updatedPrice = price || existing.rows[0].price;

        // update appliance in db
        const result = await pool.query(
            'UPDATE appliances SET model = $1, brand = $2, price = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [updatedModel, updatedBrand, updatedPrice, id, req.user.id]
        );
        res.json(result.rows[0]);

    } catch (error) {
        console.error('error editing appliance: ', error);
        res.status(500).json({ error: 'Failed to edit appliance' });
    }
};

// SEARCH APPLIANCES (search by brand & filter by price)
const searchAppliances = async (req, res) => {
    console.log('searchAppliances called', req.query); // test
    // input
    const { brand, maxPrice } = req.query;

    // searches
    try{
        // Search by Brand
        if (brand) {
            const result = await pool.query(
                'SELECT * FROM appliances WHERE LOWER(brand) = LOWER($1) AND user_id = $2',
                [brand, req.user.id]
            );
            return res.json(result.rows);
        }

        // Filter by Max Price
        if (maxPrice) {
            const result = await pool.query(
                'SELECT * FROM appliances WHERE price <= $1 AND user_id = $2 ORDER BY price ASC',
                [maxPrice, req.user.id]
            );
            return res.json(result.rows);
        };
    } catch (error) {
        console.error('searchAppliances error: ', error);
        res.status(500).json({ error: 'Failed to search appliances' });
    }
};

// DELETE APPLIANCE
const deleteAppliance = async (req, res) => {
    const { id } = req.params;
    
    try {
        // check if exists and belongs to user
        const existing = await pool.query(
            'SELECT * FROM appliances WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        // if not found, return 404
        if (existing.rows.length === 0){
            return res.status(404).json({ error: 'Appliance not found' });
        }
        // otherwise delete appliance from db
        await pool.query(
            'DELETE FROM appliances WHERE id = $1 AND user_id = $2',    
            [id, req.user.id]
        );
        // return 204 no content if successful
        res.status(204).send();
    } catch (error) {
        console.error('deleteAppliance error: ', error);
        res.status(500).json({ error: 'Failed to delete appliance' });
    }
};

// return all methods
module.exports = { getAll, addAppliance, editAppliance, searchAppliances, deleteAppliance };