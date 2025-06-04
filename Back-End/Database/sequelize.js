const { Sequelize } = require('sequelize');
const mariadb = require('mariadb');


const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mariadb',
        dialectOptions: {
            connectTimeout: 10000,
        },
        dialectModule: mariadb,

        logging: false,
    }
);

module.exports = sequelize;
