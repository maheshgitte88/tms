const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Student = require('./Student');
const Department = require('./Department');
const SubDepartment = require('./SubDepartment');
const Employee = require('./Employee');
const TicketUpdate = require('./TicketUpdate');
const TicketResolution = require('./TicketResolution');
// const QueryCategory = require('./QueryCategory');
// const QuerySubcategory = require('./QuerySubcategory');

const Ticket = sequelize.define('Ticket', {
  TicketID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TicketType:{
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Status: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,

  },
  Querycategory:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  QuerySubcategory:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  TicketResTimeInMinutes:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  LeadId: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // ClaimEmployeeID: { // Include EmployeeID field
  //   type: DataTypes.INTEGER,
  //   allowNull: true, // Make it nullable if you want to allow tickets without a specific employee
  // },

  ResolutionDescription: {
    type: DataTypes.TEXT,
  },

  CloseDescription: {
    type: DataTypes.TEXT,
  },
  ResolutionFeedback: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5,
    },
  },
  AssignedToDepartmentID: {
    type: DataTypes.INTEGER,
  },
  AssignedToSubDepartmentID: {
    type: DataTypes.INTEGER,
  },
  TransferredToDepartmentID: {
    type: DataTypes.INTEGER,
  },
  TransferredToSubDepartmentID: {
    type: DataTypes.INTEGER,
  },
  AttachmentUrl: {
    type: DataTypes.JSON, // Store the URL or path to the uploaded file
    allowNull: true,
  },
});

Ticket.belongsTo(Student, { foreignKey: 'StudentId' });
Ticket.belongsTo(Employee, { foreignKey: 'EmployeeID' });
Ticket.belongsTo(Department, { foreignKey: 'AssignedToDepartmentID' });
Ticket.belongsTo(SubDepartment, { foreignKey: 'AssignedToSubDepartmentID' });
// Ticket.belongsTo(QueryCategory, { foreignKey: 'QuerycategoryID' });
// Ticket.belongsTo(QuerySubcategory, { foreignKey: 'QuerySubcategoryID' });
Ticket.belongsTo(Department, { foreignKey: 'TransferredToDepartmentID', as: 'TransferredToDepartment' });
Ticket.belongsTo(SubDepartment, { foreignKey: 'TransferredToSubDepartmentID', as: 'TransferredToSubDepartment' });
// Ticket.belongsTo(Employee, { foreignKey: 'ClaimEmployeeID'});
// Ticket.belongsTo(Employee, { foreignKey: 'TransferredClaimEmployeeID', as: 'TransferredClaimToEmployee' });


Ticket.hasMany(TicketUpdate, { foreignKey: 'TicketId' });
Ticket.hasOne(TicketResolution, { foreignKey: 'TicketId' });

module.exports = Ticket;
