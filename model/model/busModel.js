const database = require("./../index");

module.exports = (sequelize, Sequelize) => {
    const busModel = sequelize.define("bus", {
        busNumber: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        busName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        isAcAvailable: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        isWaterProvidable: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        isBlankeProvidable: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        noOfStaff:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        busImages: {
            type: Sequelize.JSON,
            allowNull: false,
        },
        isCharginPointAvailable: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        isCCTVavailable:{
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        acceptMobileTicket:{
            type: Sequelize.BOOLEAN,
            allowNull: false
        }
    })

    return busModel;
}