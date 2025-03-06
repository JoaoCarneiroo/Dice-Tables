const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './Database/cafe.db',
    logging: false, 
});

module.exports = sequelize;
