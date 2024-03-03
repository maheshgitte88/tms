const { DataTypes } = require('sequelize');
const sequelize = require('../config');
// const QueryCategory = require('./QueryCategory');

const QuerySubcategory = sequelize.define('QuerySubcategory', {
    QuerySubCategoryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    QuerySubcategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = QuerySubcategory;
