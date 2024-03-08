

const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const Ticket = require('../models/Ticket');

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

// router.post('/create-ticket', async (req, res) => {
//   try {
//     const ticket = await Ticket.create(req.body);
//     res.status(201).json(ticket);
//   } catch (error) {
//     console.error('Error creating ticket:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

module.exports = router;
