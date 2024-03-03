const { DataTypes } = require('sequelize');
const sequelize = require('../config');
// const Ticket = require('./Ticket');

const Student = sequelize.define('Student', {
  StudentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  StudentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  StudentEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Registration_No : {
    type: DataTypes.STRING,
    allowNull: false,
  },
  StudentPassword: {
    type: DataTypes.STRING, 
    allowNull: false,
  },

});

// Student.hasMany(Ticket, { foreignKey: 'StudentId' });

module.exports = Student;
