const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const User = require('./User');
const Ticket = require('./Ticket');
const Employee = require('./Employee');

const UserTicket = sequelize.define('UserTicket', {
  UserTicketID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

UserTicket.belongsTo(User, { foreignKey: 'UserID' });
UserTicket.belongsTo(Employee, { foreignKey: 'EmployeeID' });
UserTicket.belongsTo(Ticket, { foreignKey: 'TicketID' });

module.exports = UserTicket;
