const express = require('express');
const Student = require('../models/Student');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const SubDepartment = require('../models/SubDepartment');
const Ticket = require('../models/Ticket');
const TicketUpdate = require('../models/TicketUpdate');
const TicketResolution = require('../models/TicketResolution');
const router = express.Router();

router.post('/departments', async (req, res) => {
    try {
        const { DepartmentName, SubDepartments } = req.body;

        // Create Department
        const department = await Department.create({ DepartmentName });

        // Create associated SubDepartments
        if (SubDepartments && SubDepartments.length > 0) {
            await SubDepartment.bulkCreate(
                SubDepartments.map((subDept) => ({ ...subDept, DepartmentId: department.DepartmentID }))
            );
        }

        return res.status(201).json({ message: 'Department and SubDepartments created successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/department/:departmentId/:SubDepartmentId', async (req, res) => {
    const departmentId = req.params.departmentId;
    const SubDepartmentId = req.params.departmentId;
    try {
        // Fetch department details
        // const department = await Department.findAll({
        //     where: { DepartmentID: departmentId},
        //     include: [
        //         {
        //             model: SubDepartment,
        //             where: { id: SubDepartmentId},
        //         }
        //     ],
        // });

        if (!departmentId) {
            return res.status(404).json({ error: 'Department not found' });
        }

        // const employees = await Employee.findAll({
        //     where: { DepartmentID: departmentId, SubDepartmentID: SubDepartmentId},
        //     include: [
        //         {
        //             model: Department,
        //         },
        //         {
        //             model: SubDepartment,
        //         }
        //     ],
        // });


        const tickets = await Ticket.findAll({
            where: { AssignedToDepartmentID: departmentId },
            include: [
                {
                    model: Employee,
                    include: [
                        {
                            model: Department,
                        },
                        {
                            model: SubDepartment,
                        }
                    ],
                },
                {
                    model: Department,
                    include: [
                        {
                            model: SubDepartment,
                            where: { SubDepartmentId: SubDepartmentId },
                        },

                    ],
                },
                {
                    model: TicketUpdate,
                    include: [
                        {
                            model: Employee,
                            // include: [
                            //     {
                            //         model: Department,
                            //     },
                            //     {
                            //         model: SubDepartment,
                            //     }
                            // ],
                        },

                    ],
                },
                {
                    model: TicketResolution,
                },
            ],
        });

        // Fetch ticket resolutions
        // const ticketResolutions = await TicketResolution.findAll({

        // });

        const data = {
            // employees,
            tickets,
        };

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




module.exports = router;
