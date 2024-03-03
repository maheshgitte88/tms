
const express = require('express');
const Employee = require('../models/Employee');
const router = express.Router();


router.post('/bulk', async (req, res) => {
    try {
        const employeesData = req.body;
console.log(employeesData, 10)
        // Create employees
        const employees = await Employee.bulkCreate(employeesData);

        return res.status(201).json({ message: 'Employees created successfully.', employees });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
