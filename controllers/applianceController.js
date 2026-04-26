// Appliance screen methods

const pool = require('../db/pool');

// LIST ALL APPLIANCES OF USER
const getAll = async (req, res) => {
    try{
        const result = await pool.query(
            'SELECT * FROM appliances WHERE user_id = $1 ORDER BY serial ASC', 
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
    const { type, brand, price } = req.body;

    // valid appliance types
    const validTypes = ['Fridge', 'Air Conditioner', 'Washer', 'Dryer', 
        'Freezer', 'Stove', 'Dishwasher', 'Water Heater', 'Microwave'];
    
    // validate input
    if (!type || !brand || !price){
        return res.status(400).json({ error: 'Type, brand and price are required'});
    }
    if (!validTypes.includes(type)){
        return res.status(400).json({ error: 'Invalid appliance type' });
    }
    if (price < 1){
        return res.status(400).json({ error: 'Price must be at least $1' });
    }

    // try catch
    try {
        // insert appliance into database
        const result = await pool.query(
            'INSERT INTO appliances (type, brand, price, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [type, brand, price, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch {
        console.error('addAppliance error: ', error);
        res.status(500).json({ error: 'Failed to add appliance'});
    }
};

// EDIT APPLIANCE
const editAppliance = async (req, res) => {
    // search for appliance
    const { id } = req.params;
    const { type, brand, price } = req.body;
    const validTypes = ['Fridge', 'Air Conditioner', 'Washer', 'Dryer',
        'Freezer', 'Stove', 'Dishwasher', 'Water Heater', 'Microwave'];
    
    // validate - rules for adding an appliance
    if (type && !validTypes.includes(type)){
        return res.status(400).json({ error: 'Invalid appliance type' });
    }
    if (price && price < 1) {
        return res.status(400).json({ error: 'Price must be at least $1 '});
    }

    // try catch block 
    try {
        // check if exists and belongs to user
        const existing = await pool.query(
            'SELECT * FROM appliances WHERE serial = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (existing.rows.length === 0){
            return res.status(404).json({ error: 'Appliance not found' });
        }

        // update chosen field and keep the rest the same
        const updatedType = type || existing.rows[0].type;
        const updatedBrand = brand || existing.rows[0].brand;
        const updatedPrice = price || existing.rows[0].price;

        // update appliance in db
        const result = await pool.query(
            'UPDATE appliances SET type = $1, brand = $2, price = $3 WHERE serial = $4 AND user_id = $5 RETURNING *',
            [updatedType, updatedBrand, updatedPrice, id, req.user.id]
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
            'SELECT * FROM appliances WHERE serial = $1 AND user_id = $2',
            [id, req.user.id]
        );
        // if not found, return 404
        if (existing.rows.length === 0){
            return res.status(404).json({ error: 'Appliance not found' });
        }
        // otherwise delete appliance from db
        await pool.query(
            'DELETE FROM appliances WHERE serial = $1 AND user_id = $2',    
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