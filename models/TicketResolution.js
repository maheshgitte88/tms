const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Employee = require('./Employee');
// const Ticket = require('./Ticket');
// const Employee = require('./Employee');
// const Employee = require('./Employee');
// const Ticket = require('./Ticket');


const TicketResolution = sequelize.define('TicketResolution', {
  TicketResolutionID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // ResolutionStatus: {
  //   type: DataTypes.STRING(20),
  //   allowNull: false,
  // },
  ResolutionDescription: {
    type: DataTypes.TEXT,
  },

  // ResolutionFeedback: {
  //   type: DataTypes.INTEGER,
  //   validate: {
  //     min: 1,
  //     max: 5,
  //   },
  // },

  ResEmployeeID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // ResolutionTimestamp: {
  //   type: DataTypes.DATE,
  // },
});

// TicketResolution.belongsTo(Ticket, { foreignKey: 'TicketID' });
// TicketResolution.belongsTo(Employee, { foreignKey: 'EmployeeID' });
TicketResolution.belongsTo(Employee, { foreignKey: 'ResEmployeeID' });

module.exports = TicketResolution;
