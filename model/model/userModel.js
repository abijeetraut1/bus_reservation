const database = require("../index");

module.exports = (sequelize, Sequelize) => {
    const userModel = sequelize.define("user", {
        phoneNo: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        profile: {
            type: Sequelize.STRING,
        },
        verificationCode:{
            type: Sequelize.INTEGER,
        },
        isVerified: {
            type: Sequelize.BOOLEAN
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        role:{
            type: Sequelize.ENUM("user", "owner", "driver", "conductor", "super-admin"),
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        }
    })

    return userModel;
}