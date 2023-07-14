console.log("running on development");
module.exports = {
    HOST: "localhost",
    USER: "root",
    PASS: "",
    POST: 3306,

    // database identification
    db: "bus_reservations",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        accurate: 30000,
        idle: 10000
    }
}