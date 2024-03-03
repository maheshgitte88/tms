const express = require('express');
const Student = require('../models/Student');
const Employee = require('../models/Employee');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if the user is a student or an employee based on email domain or other criteria
    const isEmployee = email.endsWith('@mitsde.com');

    try {
        let user;
        if (isEmployee) {
            user = await Employee.findOne({ where: { EmployeeEmail: email, EmployeePassword: password } });
        } else {
            user = await Student.findOne({ where: { StudentEmail: email, StudentPassword: password } });
        }

        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Signup route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const isEmployee = email.endsWith('@mitsde.com');

        if (isEmployee) {
            await Employee.create({ EmployeeName: name, EmployeeEmail: email, EmployeePassword: password });
        } else {
            await Student.create({ StudentName: name, StudentEmail: email, StudentPassword: password });
        }

        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
