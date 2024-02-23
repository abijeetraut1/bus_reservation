const DBconfig = require("../config/config");
const bcrypt = require("bcrypt")

const {
    Sequelize,
    DataTypes
} = require("sequelize");

const sequelize = new Sequelize(DBconfig.db, DBconfig.USER, DBconfig.PASS, {
    host: DBconfig.host,
    dialect: DBconfig.dialect,
    operatirAlias: false,
    loggin: false,
    port: DBconfig.POST,
    pool: {
        max: DBconfig.max,
        min: DBconfig.min,
        accurate: DBconfig.accurate,
        idle: DBconfig.idle
    }
})


sequelize.authenticate().then( () => {
    console.log("conected to database");
}).catch(err => {
    console.log("err"+ err);
})

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./model/userModel")(sequelize, DataTypes);
// db.bus = require("./model/busModel")(sequelize, DataTypes);

// relation
// db.users.hasMany(db.bus);
// db.bus.belongsTo(db.users);


db.sequelize.sync({
    force: false,
}).then(async () => {
    console.log("yes! sync done");
})

module.exports = db;