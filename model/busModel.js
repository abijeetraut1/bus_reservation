module.exports = (sequelize, Sequelize) => {
    const busModel = sequelize.define("bus", {
        busNumber: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        busName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        ticketPrice: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        stopCut: {
            type: Sequelize.INTEGER,
        },
        imageJSON: {
            type: Sequelize.JSON,
        },
        startLocation: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        endLocation: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        stopLocationJSON: {
            type: Sequelize.JSON,
        },
        journeyStartTime: {
            type: Sequelize.TIME,
        },
        totalSeats: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        days: {
            type: Sequelize.JSON,
        },
        facilities: {
            type: Sequelize.JSON,
        },
        slug: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        }
    });

    return busModel;
}