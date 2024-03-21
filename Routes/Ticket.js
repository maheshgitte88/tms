

const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const Ticket = require('../models/Ticket');
const TicketResolution = require('../models/TicketResolution');
const Department = require('../models/Department');
const SubDepartment = require('../models/SubDepartment');
const TicketUpdate = require('../models/TicketUpdate');
const Employee = require('../models/Employee');

cloudinary.config({
  cloud_name: 'dtgpxvmpl',
  api_key: '113933747541586',
  api_secret: 'ubPVZqWAV1oOkGdwfuchq-l01i8',
});


// router.post('/tickets', async (req, res) => {
//   try {
//     const ticketData = req.body;

//     // Create ticket
//     const createdTicket = await Ticket.create(ticketData
//     );

//     return res.status(201).json({ message: 'Ticket created successfully.', ticket: createdTicket });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



router.post('/Create', async (req, res) => {
  const { TicketType, LeadId, Status, Description, StudentId,
    EmployeeID, AssignedToDepartmentID, AssignedToSubDepartmentID,
    // TransferredToDepartmentID, TransferredToSubDepartmentID
  } = req.body;
  try {
    let updatedAttachmentUrls = [];
    // const ticket = await Ticket.create({ TicketType, LeadId, Status, Description, StudentId, EmployeeID, Feedback, AssignedToDepartmentID, AssignedToSubDepartmentID, TransferredToDepartmentID, TransferredToSubDepartmentID });
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

    const ticket = await Ticket.create({
      TicketType,
      LeadId,
      Status,
      Description,
      StudentId,
      EmployeeID,
      AssignedToDepartmentID,
      AssignedToSubDepartmentID,
      AttachmentUrl: updatedAttachmentUrls,
    });
    console.log(updatedAttachmentUrls, 283)
    res.status(201).json({ response: "success", data: ticket, status: 201 });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ response: "error", message: "Internal Server Error", status: 500 });
  }
});



router.put('/resolution/:ticketId', async (req, res) => {
  const TicketId = req.params.ticketId;
  const UpdateStatus = req.query.resolved
  const { UpdateDescription, EmployeeID, Feedback } = req.body;
  console.log(req.body, 7474)

  console.log(TicketId, UpdateStatus, UpdateDescription, EmployeeID, Feedback, 7474)
  try {
    // Find the ticket by ID
    const ticket = await Ticket.findByPk(TicketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket fields
    await ticket.update({
      Status: UpdateStatus,
      ResolutionDescription: UpdateDescription,
      // ResEmployeeID,
      // ResolutionFeedback: Feedback
    });

    let ticketResolution = await TicketResolution.findOne({ where: { TicketId: TicketId } });

    if (!ticketResolution) {
      // If ticket resolution doesn't exist, create a new one
      ticketResolution = await TicketResolution.create({
        TicketId: TicketId,
        ResEmployeeID: EmployeeID,
        // ResolutionDescription: UpdateDescription
      });
    } else {
      // If ticket resolution exists, update its fields
      await ticketResolution.update({
        ResEmployeeID: EmployeeID,
        ResolutionDescription: UpdateDescription
      });
    }

    // Update Ticket with ResEmployeeID
    // const ticket = await Ticket.findByPk(ticketId);
    // if (ticket) {
    //   await ticket.update({ ResEmployeeID });
    // }

    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/Closed/:ticketId', async (req, res) => {
  const TicketId = req.params.ticketId;
  const UpdateStatus = req.query.Closed
  const { UpdateDescription, Feedback } = req.body;

  console.log(TicketId, UpdateStatus, UpdateDescription, Feedback, 7474)
  try {
    // Find the ticket by ID
    const ticket = await Ticket.findByPk(TicketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket fields
    await ticket.update({
      Status: UpdateStatus,
      CloseDescription: UpdateDescription,
      ResolutionFeedback: Feedback
    });

    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// router.post('/create-ticket', async (req, res) => {
//   try {
//     const ticket = await Ticket.create(req.body);
//     res.status(201).json(ticket);
//   } catch (error) {
//     console.error('Error creating ticket:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });




// router.get("/department/:departmentId/:SubDepartmentId/:EmployeeID", async (req, res) => {
//   const departmentId = req.params.departmentId;
//   const SubDepartmentId = req.params.SubDepartmentId;
//   const EmployeeID=req.params.EmployeeID
//   try {
//     if (!departmentId) {
//       return res.status(404).json({ error: "Department not found" });
//     }
//     const tickets = await Ticket.findAll({
//       where: {
//         // AssignedToSubDepartmentID: departmentId,
//         Status:"Closed",
//         AssignedToSubDepartmentID: SubDepartmentId,
//       },
//       include: [
//         {
//           model: Employee,
//           include: [
//             {
//               model: Department,
//             },
//             {
//               model: SubDepartment,
//             },
//           ],
//         },
//         {
//           model: Department,
//           include: [
//             {
//               model: SubDepartment,
//               where: { SubDepartmentId: SubDepartmentId },
//             },
//           ],
//         },
//         {
//           model: TicketUpdate,
//           include: [
//             {
//               model: Employee,
//             },
//           ],
//         },
//         {
//           model: TicketResolution,
//           where: { ResEmployeeID: EmployeeID },
//         },
//       ],
//     });

//     const data = {
//       tickets,
//     };

//     res.json(data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


router.get("/department/Closed/:departmentId/:SubDepartmentId/:EmployeeID", async (req, res) => {
  const departmentId = req.params.departmentId;
  const SubDepartmentId = req.params.SubDepartmentId;
  const EmployeeID = req.params.EmployeeID;

  try {
    if (!departmentId) {
      return res.status(404).json({ error: "Department not found" });
    }

    const tickets = await Ticket.findAll({
      where: {
        Status: "Closed",
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
            },
          ],
        },
        {
          model: TicketResolution,
          where: { ResEmployeeID: EmployeeID },
          required: true, // This ensures that only tickets with matching resolutions are returned
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


router.get("/department/Resolved/:departmentId/:SubDepartmentId/:EmployeeID", async (req, res) => {
  const departmentId = req.params.departmentId;
  const SubDepartmentId = req.params.SubDepartmentId;
  const EmployeeID = req.params.EmployeeID;

  try {
    if (!departmentId) {
      return res.status(404).json({ error: "Department not found" });
    }

    const tickets = await Ticket.findAll({
      where: {
        Status: "Resolved",
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
            },
          ],
        },
        {
          model: TicketResolution,
          where: { ResEmployeeID: EmployeeID },
          required: true, // This ensures that only tickets with matching resolutions are returned
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




router.get("/Closed/:EmployeeID", async (req, res) => {
  // const departmentId = req.params.departmentId;
  // const SubDepartmentId = req.params.departmentId;
  const EmployeeID = req.params.EmployeeID;
  try {
    if (!EmployeeID) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const tickets = await Ticket.findAll({
      where: { EmployeeID: EmployeeID,  Status:"Closed"},
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

router.get("/Resolved/:EmployeeID", async (req, res) => {
  // const departmentId = req.params.departmentId;
  // const SubDepartmentId = req.params.departmentId;
  const EmployeeID = req.params.EmployeeID;
  try {
    if (!EmployeeID) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const tickets = await Ticket.findAll({
      where: { EmployeeID: EmployeeID,  Status:"Resolved"},
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


module.exports = router;
