module.exports = (sequelize, Sequelize) => {
    const paymentModel = sequelize.define("payment", {
        token: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        amount: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        seatNo: {
            type: Sequelize.JSON,
            allowNull: false,
        }
    });

    return paymentModel;
}