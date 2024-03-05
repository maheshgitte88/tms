const express = require('express');
const { Server } = require('socket.io');

const cors = require('cors');
const http = require('http');
const sequelize = require('./config');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// const sharp = require('sharp');
// const cloudinary = require('cloudinary').v2;
const cloudinary = require('./cloudinaryConfig');
const Department = require('./models/Department')
const SubDepartment = require('./models/SubDepartment')
const Employee = require('./models/Employee')
const Student = require('./models/Student')
const Ticket = require('./models/Ticket');
const User = require('./models/User')
const UserTicket = require('./models/UserTicket')
const TicketResolution = require('./models/TicketResolution')
const TicketUpdate = require('./models/TicketUpdate');
const authRoutes = require('./AuthRoutes/Auth');
const OrgaRoutes = require('./Routes/Organization');
const QueryRoutes = require('./Routes/Query');
const EmployeeRoutes = require('./Routes/Employee')
const TicketRoute = require('./Routes/Ticket');
const QueryCategory = require('./models/QueryCategory');
const QuerySubcategory = require('./models/QuerySubcategory');

const app = express();
const server = http.createServer(app)
app.use(cors());
app.use(express.json());
const port = 2000;
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// cloudinary.config({
//     cloud_name: 'dtgpxvmpl',
//     api_key: '113933747541586',
//     api_secret: 'ubPVZqWAV1oOkGdwfuchq-l01i8',
// });


const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT"],
    },
});

// io.on("connection", (socket) => {
//     console.log(`User Connected: ${socket.id}`);
//     socket.on("ticketUpdate", (data ) => {
//         console.log(data, data.TicketIDasRoomId, 57)
//         socket.broadcast.emit("updatedTicketChat", data);
//     });
//     socket.on("disconnect", () => {
//         console.log("User Disconnected", socket.id);
//     });
// });


io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Join the appropriate room based on TicketID
    socket.on("joinTicketRoom", (ticketId) => {
        socket.join(ticketId);
        console.log(`User ${socket.id} joined room ${ticketId}`);
    });

    socket.on("ticketUpdate", (data) => {
        console.log(data, data.TicketIDasRoomId, 57);

        // Emit to the specific room using socket.to()
        io.to(data.TicketIDasRoomId).emit("updatedTicketChat", data);
    });

    // ... other code
});

// io.on("connection", (socket) => {
//     console.log(`User Connected: ${socket.id}`);

//     socket.on("ticketUpdate", (data) => {
//         console.log(data, data.TicketIDasRoomId);
//         // Emit to the room identified by TicketIDasRoomId
//         io.to(data.TicketIDasRoomId).emit("updatedTicketChat", data);
//     });

//     socket.on("disconnect", () => {
//         console.log("User Disconnected", socket.id);
//     });
// });
// Parse form data

app.use(express.urlencoded({ extended: true }));
app.use(upload.any());

app.use('/auth', authRoutes);
app.use('/Org', OrgaRoutes);
app.use('/Query', QueryRoutes);
app.use('/Employee', EmployeeRoutes);
app.use('/Ticket', TicketRoute);




app.get('/department/:departmentId', async (req, res) => {
    const departmentId = req.params.departmentId;
    try {
        // Fetch department details
        const department = await Department.findAll({
            where: { DepartmentID: departmentId },
            include: [
                {
                    model: SubDepartment,
                }
            ],
        });

        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        // Fetch sub-departments
        // const subDepartments = await SubDepartment.findAll({
        //     where: { DepartmentID: departmentId },
        // });

        // Fetch employees

        const employees = await Employee.findAll({
            where: { DepartmentID: departmentId },
            include: [
                {
                    model: Department,
                },
                {
                    model: SubDepartment,
                }
            ],
        });
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
                        },

                    ],
                },
                {
                    model: TicketUpdate,
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
            department,
            // subDepartments,
            employees,
            tickets,
            // ticketResolutions,
        };

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/department/:departmentId/:SubDepartmentId', async (req, res) => {
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

app.get('/Tickets/:EmployeeID', async (req, res) => {
    // const departmentId = req.params.departmentId;
    // const SubDepartmentId = req.params.departmentId;
    const EmployeeID = req.params.EmployeeID
    try {
        if (!EmployeeID) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        const tickets = await Ticket.findAll({
            where: { EmployeeID: EmployeeID },
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
                        },

                    ],
                },
                {
                    model: TicketUpdate,
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

                    ],
                },
                {
                    model: TicketResolution,
                },
            ],
        });

        const data = {
            tickets,
        };

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/get', async (req, res) => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        res.json({ response: "success", message: `Server running on port ${port}`, status: 200 });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
    }
});

app.post('/save-data', async (req, res) => {
    try {
        // Extract data from request body
        const data = req.body;

        // Loop through the provided data and save it into the database
        for (const item of data) {
            // Save Department
            const department = await Department.create({
                DepartmentName: item.DepartmentName,
            });

            // Save SubDepartment
            const subDepartment = await SubDepartment.create({
                SubDepartmentName: item.SubDepartmentName,
                DepartmentId: department.DepartmentID,
            });

            // Save QueryCategory
            const queryCategory = await QueryCategory.create({
                QueryCategoryName: item.QueryCategoryName,
                DepartmentId: department.DepartmentID,
                SubDepartmentID: subDepartment.SubDepartmentID,
            });

            // Save QuerySubcategory
            const querySubcategory = await QuerySubcategory.create({
                QuerySubcategoryName: item.QuerySubcategoryName,
                QueryCategoryId: queryCategory.QueryCategoryID,
            });
        }

        res.status(201).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new department
app.post('/departments', async (req, res) => {
    console.log(req.body, 36)

    const DepartmentName = req.body.DepartmentName;
    try {
        const department = await Department.create({ DepartmentName });
        res.status(201).json({ response: "success", data: department, status: 201 });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
    }
});

// Create a new sub-department
app.post('/subdepartments', async (req, res) => {
    const { SubDepartmentName, DepartmentID } = req.body;

    try {
        const subDepartment = await SubDepartment.create({ SubDepartmentName, DepartmentID });
        res.status(201).json({ response: "success", data: subDepartment, status: 201 });
    } catch (error) {
        console.error('Error creating sub-department:', error);
        res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
    }
});

// Create a new employee
app.post('/employees', async (req, res) => {
    const { EmployeeName, DepartmentID, SubDepartmentID, EmployeeEmail, EmployeePassword } = req.body;

    try {
        const employee = await Employee.create({ EmployeeName, DepartmentID, SubDepartmentID, EmployeeEmail, EmployeePassword });
        res.status(201).json({ response: "success", data: employee, status: 201 });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
    }
});

// Create a new student
app.post('/students', async (req, res) => {
    const { StudentName, Registration_No, StudentEmail } = req.body;

    try {
        const student = await Student.create({ StudentName, Registration_No, StudentEmail });
        res.status(201).json({ response: "success", data: student, status: 201 });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
    }
});

// Create a new ticket
app.post('/tickets', async (req, res) => {
    const { UserID, TicketType, LeadId, Status, Description, StudentId, EmployeeID, Feedback, AssignedToDepartmentID, AssignedToSubDepartmentID, TransferredToDepartmentID, TransferredToSubDepartmentID } = req.body;
    try {
        const ticket = await Ticket.create({ UserID, TicketType, Status, Description, StudentId, EmployeeID, Feedback, AssignedToDepartmentID, AssignedToSubDepartmentID, TransferredToDepartmentID, TransferredToSubDepartmentID });
        res.status(201).json({ response: "success", data: ticket, status: 201 });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
    }
});


// app.post('/api/ticket-updates', async (req, res) => {
//     const { TicketID, UpdateDescription, EmployeeID, StudentID, DepartmentID, SubDepartmentID } = req.body;
//     console.log(req.body)
//     try {
//         const ticket = await Ticket.findByPk(TicketID);

//         if (!ticket) {
//             return res.status(404).json({ error: 'Ticket not found' });
//         }

//         let updatedAttachmentUrl;

//         // Check if there is an uploaded file
//         if (req.files && req.files.length > 0) {
//             // Upload the file to Cloudinary
//             const result = await cloudinary.uploader.upload(req.files, {
//                 folder: 'ticket-updates', // Set the Cloudinary folder name
//             });
//             console.log(result, 208)
//             updatedAttachmentUrl = result.secure_url;

//             console.log(updatedAttachmentUrl, 211)
//         }

//         // Create a new TicketUpdate record
//         const ticketUpdate = await TicketUpdate.create({
//             TicketID,
//             UpdateDescription,
//             UpdatedAttachmentUrl: updatedAttachmentUrl,
//             EmployeeID,
//             StudentID,
//             DepartmentID,
//             SubDepartmentID,
//         });

//         res.json({ success: true, message: 'TicketUpdate created successfully', data: ticketUpdate });
//     } catch (error) {
//         console.error('Error creating TicketUpdate:', error);
//         res.status(500).json({ success: false, message: 'Error creating TicketUpdate', error: error.message });
//     }
// });


// app.post('/api/ticket-updates', async (req, res) => {
//     const { TicketID, UpdateDescription, UpdatedAttachmentUrl, EmployeeID, StudentID, DepartmentID, SubDepartmentID } = req.body;

//     try {
//         const ticket = await Ticket.findByPk(TicketID);

//         if (!ticket) {
//             return res.status(404).json({ error: 'Ticket not found' });
//         }

//         // Create a new TicketUpdate record
//         const ticketUpdate = await TicketUpdate.create({
//             TicketID,
//             UpdateDescription,
//             UpdatedAttachmentUrl,
//             EmployeeID,
//             StudentID,
//             DepartmentID,
//             SubDepartmentID
//         });

//         res.json({ success: true, message: 'TicketUpdate created successfully', data: ticketUpdate });
//     } catch (error) {
//         console.error('Error creating TicketUpdate:', error);
//         res.status(500).json({ success: false, message: 'Error creating TicketUpdate', error: error.message });
//     }
// });


//   cloudinary.config({ 
//     cloud_name: 'dtgpxvmpl', 
//     api_key: '113933747541586', 
//     api_secret: 'ubPVZqWAV1oOkGdwfuchq-l01i8' 
//   });

// API endpoint for creating ticket updates

// app.post('/api/ticket-updates', async (req, res) => {
//     const { TicketID, UpdateDescription, Feedback, UpdateStatus, EmployeeID, StudentID, DepartmentID, SubDepartmentID } = req.body;
//     console.log(req.body, 230);

//     try {
//         const ticket = await Ticket.findByPk(TicketID);
//         if (!ticket) {
//             return res.status(404).json({ error: 'Ticket not found' });
//         }

//         let updatedAttachmentUrls = [];
//         //   if (req.files && req.files.length > 0) {
//         //     // Compress and upload each file to Cloudinary
//         //     for (const file of req.files) {
//         //       const compressedImageBuffer = await sharp(file.path)
//         //         .resize({ fit: 'inside', width: 800, height: 800 })
//         //         .toBuffer();

//         //       const result = await cloudinary.uploader.upload_stream({
//         //         folder: 'ticket-updates', // Set the Cloudinary folder name
//         //       }, (error, result) => {
//         //         if (error) {
//         //           console.error('Error uploading file to Cloudinary:', error);
//         //           res.status(500).json({ success: false, message: 'Error uploading file to Cloudinary', error: error.message });
//         //         } else {
//         //           console.log('File uploaded to Cloudinary:', result);
//         //           updatedAttachmentUrls.push(result.secure_url);
//         //         }
//         //       }).end(compressedImageBuffer);
//         //     }
//         //   }

//         // Check if there are uploaded files
//         if (req.files && req.files.length > 0) {
//             // Upload each file to Cloudinary
//             for (const file of req.files) {
//                 const result = await cloudinary.uploader.upload(file.path, {
//                     folder: 'ticket-updates', // Set the Cloudinary folder name
//                 });
//                 console.log(result, 246);
//                 updatedAttachmentUrls.push(result.secure_url);
//             }
//         }

//         // Create a new TicketUpdate record
//         const ticketUpdate = await TicketUpdate.create({
//             TicketID,
//             UpdateDescription,
//             UpdatedAttachmentUrls: updatedAttachmentUrls,
//             EmployeeID,
//             StudentID,
//             UpdateStatus,
//             Feedback,
//             DepartmentID,
//             SubDepartmentID,
//         });
//         io.on("connection", (socket) => {
//             socket.on("ticketUpdate", (data) => {
//                 socket.broadcast.emit("updatedTicketChat", ticketUpdate);
//                 console.log(data,60)
//               });
//         });
//         console.log(updatedAttachmentUrls, 283)
//         res.json({ success: true, message: 'TicketUpdate created successfully', data: ticketUpdate });
//     } catch (error) {
//         console.error('Error creating TicketUpdate:', error);
//         res.status(500).json({ success: false, message: 'Error creating TicketUpdate', error: error.message });
//     }
// });

app.post('/api/img-save', async (req, res) => {
    console.log(req.body, 230);
    try {
        let updatedAttachmentUrls = [];
        if (req.files && req.files.length > 0) {
            // Upload each file to Cloudinary
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'ticket-updates', // Set the Cloudinary folder name
                });
                console.log(result, 246);
                updatedAttachmentUrls.push(result.secure_url);
            }
        }
        console.log(updatedAttachmentUrls, 283)
        res.json({ success: true, message: 'TicketUpdate created successfully', data: updatedAttachmentUrls });
    } catch (error) {

    }

})

app.post('/api/ticket-updates', async (req, res) => {
    const { TicketID, UpdateDescription, Feedback, UpdateStatus, EmployeeID, StudentID, DepartmentID, SubDepartmentID } = req.body;
    console.log(req.body, 230);

    try {
        const ticket = await Ticket.findByPk(TicketID);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        let updatedAttachmentUrls = [];
        if (req.files && req.files.length > 0) {
            // Upload each file to Cloudinary
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'ticket-updates', // Set the Cloudinary folder name
                });
                console.log(result, 246);
                updatedAttachmentUrls.push(result.secure_url);
            }
        }

        // Create a new TicketUpdate record
        const ticketUpdate = await TicketUpdate.create({
            TicketID,
            UpdateDescription,
            UpdatedAttachmentUrls: updatedAttachmentUrls,
            EmployeeID,
            StudentID,
            UpdateStatus,
            Feedback,
            DepartmentID,
            SubDepartmentID,
        });

        // Emit the updatedTicketChat event with the ticketUpdate data
        // io.emit("updatedTicketChat", ticketUpdate);
        // io.emit("updatedTicketChat", ticketUpdate);
        console.log(updatedAttachmentUrls, 283)
        res.json({ success: true, message: 'TicketUpdate created successfully', data: ticketUpdate });
    } catch (error) {
        console.error('Error creating TicketUpdate:', error);
        res.status(500).json({ success: false, message: 'Error creating TicketUpdate', error: error.message });
    }
});




// const uploadToCloudinary = async (files) => {
//     let updatedAttachmentUrls = [];

//     for (const file of files) {
//       const compressedImageBuffer = await sharp(file.path)
//         .resize({ fit: 'inside', width: 800, height: 800 })
//         .toBuffer();

//       try {
//         const result = await cloudinary.uploader.upload_stream({
//           folder: 'ticket-updates', // Set the Cloudinary folder name
//         }, (error, result) => {
//           if (error) {
//             console.error('Error uploading file to Cloudinary:', error);
//             throw error;
//           } else {
//             console.log('File uploaded to Cloudinary:', result);
//             updatedAttachmentUrls.push(result.secure_url);
//           }
//         }).end(compressedImageBuffer);
//       } catch (error) {
//         // Handle the error, e.g., return an empty array or rethrow the error
//         console.error('Error during Cloudinary upload:', error);
//         return [];
//       }
//     }

//     return updatedAttachmentUrls;
//   };


//   app.post('/api/ticket-updates', async (req, res) => {
//     const { TicketID, UpdateDescription, EmployeeID, StudentID, DepartmentID, SubDepartmentID } = req.body;

//     try {
//       const ticket = await Ticket.findByPk(TicketID);

//       if (!ticket) {
//         return res.status(404).json({ error: 'Ticket not found' });
//       }

//       // Use the separate function to upload files to Cloudinary
//       const updatedAttachmentUrls = await uploadToCloudinary(req.files);
//   console.log(updatedAttachmentUrls, 342)
//       // Create a new TicketUpdate record
//       const ticketUpdate = await TicketUpdate.create({
//         TicketID,
//         UpdateDescription,
//         UpdatedAttachmentUrls: updatedAttachmentUrls,
//         EmployeeID,
//         StudentID,
//         DepartmentID,
//         SubDepartmentID,
//       });

//       res.json({ success: true, message: 'TicketUpdate created successfully', data: ticketUpdate });
//     } catch (error) {
//       console.error('Error creating TicketUpdate:', error);
//       res.status(500).json({ success: false, message: 'Error creating TicketUpdate', error: error.message });
//     }
//   });






// app.put('/ticket-updates/:id', async (req, res) => {
//     const ticketUpdateId = req.params.id;

//     try {
//       const existingTicketUpdate = await TicketUpdate.findByPk(ticketUpdateId);

//       if (!existingTicketUpdate) {
//         return res.status(404).json({ error: 'TicketUpdate not found' });
//       }

//       // Update the ticket update properties based on the request body
//       existingTicketUpdate.UpdateDescription = req.body.UpdateDescription || existingTicketUpdate.UpdateDescription;
//       existingTicketUpdate.UpdatedAttachmentUrl = req.body.UpdatedAttachmentUrl || existingTicketUpdate.UpdatedAttachmentUrl;

//       // Save the updated ticket update
//       await existingTicketUpdate.save();

//       res.json({ success: true, message: 'TicketUpdate updated successfully' });
//     } catch (error) {
//       console.error('Error updating TicketUpdate:', error);
//       res.status(500).json({ success: false, message: 'Error updating TicketUpdate', error: error.message });
//     }
//   });


// Create a new user
app.post('/users', async (req, res) => {
    const { UserName, DepartmentID, SubDepartmentID } = req.body;

    try {
        const user = await User.create({ UserName, DepartmentID, SubDepartmentID });
        res.status(201).json({ response: "success", data: user, status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
    }
});

// Create a new user ticket association
app.post('/usertickets', async (req, res) => {
    const { UserID, TicketID } = req.body;

    try {
        const userTicket = await UserTicket.create({ UserID, TicketID });
        res.status(201).json({ response: "success", data: userTicket, status: 201 });
    } catch (error) {
        console.error('Error creating user ticket association:', error);
        res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
    }
});

// Create a new ticket resolution
app.post('/ticketresolutions', async (req, res) => {
    const { TicketID, ResolutionStatus, ResolutionDescription, EmployeeID, ResolutionFeedback, ResolutionTimestamp } = req.body;

    try {
        const ticketResolution = await TicketResolution.create({ TicketID, ResolutionStatus, EmployeeID, ResolutionDescription, ResolutionFeedback, ResolutionTimestamp });
        res.status(201).json({ response: "success", data: ticketResolution, status: 201 });
    } catch (error) {
        console.error('Error creating ticket resolution:', error);
        res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
    }
});






sequelize.sync({ force: false }) // Set force to true to drop and re-create tables on every server restart (use with caution in production)
    .then(() => {
        server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error syncing Sequelize models:', error);
    });
