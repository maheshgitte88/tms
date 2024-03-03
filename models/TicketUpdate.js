const { DataTypes } = require("sequelize");
const sequelize = require("../config");
// const Ticket = require("./Ticket");
const Employee = require("./Employee");
const Department = require("./Department");
const SubDepartment = require("./SubDepartment");
const Student = require("./Student");

const TicketUpdate = sequelize.define('TicketUpdate', {
    UpdateID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // TicketID: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    // },
    UpdateStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    UpdateDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    UpdatedAttachmentUrls: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    EmployeeID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    UpdateTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

});

// TicketUpdate.belongsTo(Ticket, { foreignKey: 'TicketID' });
TicketUpdate.belongsTo(Student, { foreignKey: 'StudentID' })
TicketUpdate.belongsTo(Employee, { foreignKey: 'EmployeeID' });
TicketUpdate.belongsTo(Department, { foreignKey: 'DepartmentID' });
TicketUpdate.belongsTo(SubDepartment, { foreignKey: 'SubDepartmentID' });

module.exports = TicketUpdate;
