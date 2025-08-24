module.exports = (sequelize, Sequelize) => {
    const ratingModel = sequelize.define("rating", {
        rate: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        review: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        agree: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        disagree: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });

    return ratingModel;
}