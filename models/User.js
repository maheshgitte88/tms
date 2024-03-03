const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Department = require('./Department');
const SubDepartment = require('./SubDepartment');

const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  UserName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

User.belongsTo(Department, { foreignKey: 'DepartmentID' });
User.belongsTo(SubDepartment, { foreignKey: 'SubDepartmentID' });

module.exports = User;
