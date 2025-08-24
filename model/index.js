const DBconfig = require("../config/config");

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


sequelize.authenticate().then(() => {
    console.log("conected to database");
}).catch(err => {
    console.log("err" + err);
})

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./model/userModel")(sequelize, DataTypes);
db.buses = require("./busModel")(sequelize, DataTypes);
db.ratings = require("./ratingModel")(sequelize, DataTypes);
db.payments = require("./paymentModel")(sequelize, DataTypes);
db.tickets = require("./ticketModel")(sequelize, DataTypes);

// relations
db.users.hasMany(db.buses);
db.buses.belongsTo(db.users);

db.users.hasMany(db.ratings);
db.ratings.belongsTo(db.users);

db.buses.hasMany(db.ratings);
db.ratings.belongsTo(db.buses);

db.users.hasMany(db.payments);
db.payments.belongsTo(db.users);

db.buses.hasMany(db.payments);
db.payments.belongsTo(db.buses);

db.users.hasMany(db.tickets);
db.tickets.belongsTo(db.users);

db.buses.hasMany(db.tickets);
db.tickets.belongsTo(db.buses);

db.payments.hasOne(db.tickets);
db.tickets.belongsTo(db.payments);



db.sequelize.sync({
    force: false,
}).then(async () => {
    console.log("yes! sync done");
})

module.exports = db;