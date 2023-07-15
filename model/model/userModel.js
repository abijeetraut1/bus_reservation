const database = require("../index");

module.exports = (sequelize, Sequelize) => {
    const userModel = sequelize.define("user", {
        phoneNo: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        email:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        lastName:{
            type: Sequelize.STRING,
            allowNull: false
        },
        verificationCode:{
            type: Sequelize.INTEGER,
        },
        isVerified: {
            type: Sequelize.BOOLEAN
        },
        role:{
            type: Sequelize.ENUM("user", "owner", "driver", "vender"),
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        }
    })

    return userModel;
}