module.exports = (sequelize, Sequelize) => {
    const ticketModel = sequelize.define("ticket", {
        seatNo: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        passengerCurrentLocation: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        passengerDestination: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        ticketExpirationStatus: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        ticketExpirationDate: {
            type: Sequelize.DATEONLY,
        },
        isTicketChecked: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        }
    });

    return ticketModel;
}