const express = require("express");
const { Server } = require("socket.io");

const cors = require("cors");
const http = require("http");
const sequelize = require("./config");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
// const sharp = require('sharp');
// const cloudinary = require('cloudinary').v2;
const cloudinary = require("./cloudinaryConfig");
const Department = require("./models/Department");
const SubDepartment = require("./models/SubDepartment");
const Employee = require("./models/Employee");
const Student = require("./models/Student");
const Ticket = require("./models/Ticket");
const TicketResolution = require("./models/TicketResolution");
const TicketUpdate = require("./models/TicketUpdate");
const authRoutes = require("./AuthRoutes/Auth");
const OrgaRoutes = require("./Routes/Organization");
const QueryRoutes = require("./Routes/Query");
const EmployeeRoutes = require("./Routes/Employee");
const TicketRoute = require("./Routes/Ticket");
const QueryCategory = require("./models/QueryCategory");
const QuerySubcategory = require("./models/QuerySubcategory");

const app = express();
const server = http.createServer(app);
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

  // socket.emit('createTicket', { createTicket: formData, AssigDepId: formData.AssignedToSubDepartmentID })

  socket.on("ticketUpdate", (data) => {
    console.log(data, data.TicketIDasRoomId, 57);

    // Emit to the specific room using socket.to()
    io.to(data.TicketIDasRoomId).emit("updatedTicketChat", data);
  });

  socket.on("joinDepaTicketRoom", (DepartmentId) => {
    socket.join(DepartmentId);
    console.log(`User ${socket.id} joined room ${DepartmentId}`);
  });

  socket.on("createTicket", async (data) => {
    const TicketData = data.createTicket;
    try {
      const result = await createTicketAndNotify(TicketData);
      console.log(result.ticket, 86)
      io.to(data.AssigSubDepId).emit("updatedDeptTicketChat", result.ticket);
    } catch (error) {
      console.error(error);
    }
  });

  //   socket.on("createTicket", (data) => {
  //     console.log(data, 919191);
  //     io.to(data.AssigSubDepId).emit("updatedDeptTicketChat", data);
  //   });
});

app.use(express.urlencoded({ extended: true }));
app.use(upload.any());

app.use("/auth", authRoutes);
app.use("/Org", OrgaRoutes);
app.use("/Query", QueryRoutes);
app.use("/Employee", EmployeeRoutes);
app.use("/Ticket", TicketRoute);

async function createTicketAndNotify(ticketData) {
  try {
    const ticket = await Ticket.create(ticketData);
    const TRes = ticket.dataValues;
    const TicketId = TRes.TicketID;

    const SubDepartmentId = TRes.AssignedToSubDepartmentID;

    const tickets = await Ticket.findOne({
      where: { TicketID: TicketId },
      include: [
        {
          model: Employee,
          include: [
            {
              model: Department,
            },
            {
              model: SubDepartment,
            },
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
      ],
    });
console.log(tickets, 157)
    const ticketValues = {
      TicketID: tickets.TicketID,
      TicketType: tickets.TicketType,
      Status: tickets.Status,
      Description: tickets.Description,
      LeadId: tickets.LeadId,
      TicketResTimeInMinutes: tickets.TicketResTimeInMinutes,
      Querycategory: tickets.Querycategory,
      QuerySubcategory: tickets.QuerySubcategory,
      AttachmentUrl: tickets.AttachmentUrl,
      updatedAt: tickets.updatedAt,
      createdAt: tickets.createdAt,
      Employee: tickets.Employee.dataValues,
      // Department: tickets.Employee.Department.dataValues,
      SubDepartment: tickets.Employee.SubDepartment.dataValues,
      Department: tickets.Department.dataValues,
      TicketUpdate:tickets.TicketUpdate
    };
console.log(ticketValues,176)
    return {
      success: true,
      message: "Ticket created successfully",
      ticket: ticketValues,
    };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

app.post("/Ticket/create-ticket", async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    const TRes = ticket.dataValues;
    console.log(TRes, 113);
    // Emit a socket event with the created ticket data (optional)
    //   io.emit('createTicket', ticket); // Assuming you want to broadcast to all connected clients
    console.log(TRes.AssignedToSubDepartmentID, 117);
    io.emit("createTicket", {
      createTicket: TRes,
      AssigSubDepId: TRes.AssignedToSubDepartmentID,
    });
    res.status(201).json(ticket); // Respond with the created ticket data
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/Ticket-updates/:TicketId", async (req, res) => {
  const TicketId = req.params.TicketId;
  try {
    const TicketUpdates = await TicketUpdate.findAll({
      where: { TicketId: TicketId },
    });
    res.json(TicketUpdates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/department/:departmentId/:SubDepartmentId", async (req, res) => {
  const departmentId = req.params.departmentId;
  const SubDepartmentId = req.params.SubDepartmentId;
  try {
    if (!departmentId) {
      return res.status(404).json({ error: "Department not found" });
    }
    const tickets = await Ticket.findAll({
      where: {
        AssignedToSubDepartmentID: departmentId,
        AssignedToSubDepartmentID: SubDepartmentId,
      },
      include: [
        {
          model: Employee,
          include: [
            {
              model: Department,
            },
            {
              model: SubDepartment,
            },
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/Tickets/:EmployeeID", async (req, res) => {
  // const departmentId = req.params.departmentId;
  // const SubDepartmentId = req.params.departmentId;
  const EmployeeID = req.params.EmployeeID;
  try {
    if (!EmployeeID) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const tickets = await Ticket.findAll({
      where: { EmployeeID: EmployeeID },
      include: [
        {
          model: Employee,
          // include: [
          //   {
          //     model: Department,
          //   },
          //   {
          //     model: SubDepartment,
          //   },
          // ],
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
                },
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get", async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );

    res.json({
      response: "success",
      message: `Server running on port ${port}`,
      status: 200,
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    res.status(500).json({
      response: "error",
      message: "Internal Server Error",
      status: 500,
    });
  }
});

app.post("/save-data", async (req, res) => {
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

    res.status(201).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new employee
app.post("/employees", async (req, res) => {
  const {
    EmployeeName,
    DepartmentID,
    SubDepartmentID,
    EmployeeEmail,
    EmployeePassword,
  } = req.body;

  try {
    const employee = await Employee.create({
      EmployeeName,
      DepartmentID,
      SubDepartmentID,
      EmployeeEmail,
      EmployeePassword,
    });
    res.status(201).json({ response: "success", data: employee, status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({
      response: "error",
      message: "Internal Server Error",
      status: 500,
    });
  }
});

// Create a new student
app.post("/students", async (req, res) => {
  const { StudentName, Registration_No, StudentEmail } = req.body;

  try {
    const student = await Student.create({
      StudentName,
      Registration_No,
      StudentEmail,
    });
    res.status(201).json({ response: "success", data: student, status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({
      response: "error",
      message: "Internal Server Error",
      status: 500,
    });
  }
});

app.post("/api/img-save", async (req, res) => {
  console.log(req.body, 230);
  try {
    let updatedAttachmentUrls = [];
    if (req.files && req.files.length > 0) {
      // Upload each file to Cloudinary
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ticket-updates", // Set the Cloudinary folder name
        });
        console.log(result, 246);
        updatedAttachmentUrls.push(result.secure_url);
      }
    }
    console.log(updatedAttachmentUrls, 283);
    res.json({
      success: true,
      message: "TicketUpdate created successfully",
      data: updatedAttachmentUrls,
    });
  } catch (error) { }
});

app.post("/api/ticket-updates", async (req, res) => {
  const {
    TicketId,
    UpdateDescription,
    Feedback,
    UpdateStatus,
    EmployeeID,
    StudentID,
    DepartmentID,
    SubDepartmentID,
  } = req.body;
  console.log(req.body, 230);

  try {
    const ticket = await Ticket.findByPk(TicketId);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    let updatedAttachmentUrls = [];
    if (req.files && req.files.length > 0) {
      // Upload each file to Cloudinary
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ticket-updates", // Set the Cloudinary folder name
        });
        console.log(result, 246);
        updatedAttachmentUrls.push(result.secure_url);
      }
    }

    // Create a new TicketUpdate record
    const ticketUpdate = await TicketUpdate.create({
      TicketId,
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
    console.log(updatedAttachmentUrls, 283);
    res.json({
      success: true,
      message: "TicketUpdate created successfully",
      data: ticketUpdate,
    });
  } catch (error) {
    console.error("Error creating TicketUpdate:", error);
    res.status(500).json({
      success: false,
      message: "Error creating TicketUpdate",
      error: error.message,
    });
  }
});

// Create a new ticket resolution
app.post("/ticketresolutions", async (req, res) => {
  const {
    TicketID,
    ResolutionStatus,
    ResolutionDescription,
    EmployeeID,
    ResolutionFeedback,
    ResolutionTimestamp,
  } = req.body;

  try {
    const ticketResolution = await TicketResolution.create({
      TicketID,
      ResolutionStatus,
      EmployeeID,
      ResolutionDescription,
      ResolutionFeedback,
      ResolutionTimestamp,
    });
    res
      .status(201)
      .json({ response: "success", data: ticketResolution, status: 201 });
  } catch (error) {
    console.error("Error creating ticket resolution:", error);
    res.status(500).json({
      response: "error",
      message: "Internal Server Error",
      status: 500,
    });
  }
});

sequelize
  .sync({ force: false }) // Set force to true to drop and re-create tables on every server restart (use with caution in production)
  .then(() => {
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error syncing Sequelize models:", error);
  });
