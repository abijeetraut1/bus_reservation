const { statusFunc } = require("../../utils/statusFunc");
const database = require("./../../model/index");
const {
    sequelize,
    QueryTypes
} = require("sequelize");

exports.addBus = (req, res) => {
    res.render("./admin_pannel/add_bus.pug", {
        title: "Add Bus"
    })
}


exports.bookedSeat = async (req, res) => {
    const bus = {
        noOfSeats: 32
    }

    const seatA = ["1", "2", "3", "4", "17"];
    const seatB = ["1", "2", "3", "4", "15"];

    res.render("./admin_pannel/bookedSeat.pug", {
        title: "Booked Seats",
        bus: bus,
        seatA,
        seatB
    })
}



exports.assistants = async (req, res) => {
    const userId = res.locals.user.id;

    const queryExec = `SELECT users.id, users.name, users.phoneNo, buses.busName, buses.busNumber, buses.startLocation, buses.endLocation, buses.totalSeats FROM buses JOIN users ON users.busId = buses.id WHERE buses.user = '${userId}'`;

    const assistants = await database.sequelize.query(queryExec, {
        type: QueryTypes.SELECT,
    })

    console.log(assistants)

    res.render("./admin_pannel/assistants.pug", {
        title: "Assistants",
        assistants: assistants
    })
}

exports.income = async (req, res) => {
    res.render("./admin_pannel/income.pug", {
        title: "Income"
    })
}

exports.createWorkersAccount = async (req, res) => {
    const user = res.locals.user.id;
    const buses = await database.sequelize.query(`SELECT buses.id, buses.busName, buses.slug FROM buses WHERE buses.user = '${user}'`, {
        type: QueryTypes.SELECT,
    })

    res.render("./admin_pannel/createWorkersAccount.pug", {
        title: "Worker Account",
        buses: buses
    })
}


exports.update_bus = async (req, res) => {
    const user = res.locals.user.id;

    const buses = await database.sequelize.query(`SELECT buses.id, buses.busName, buses.slug FROM buses WHERE buses.user = '${user}'`, {
        type: QueryTypes.SELECT,
    })

    res.render("./admin_pannel/update_bus.pug", {
        title: "Update Bus",
        buses: buses
    })
}

exports.show_all_bus = async (req, res) => {
    const userId = res.locals.user.id;
    console.log(userId)

    const buses = await database.sequelize.query(`SELECT buses.busName, buses.busNumber, buses.id, buses.ticketPrice, buses.startLocation, buses.endLocation, buses.totalSeats, buses.facilities FROM buses WHERE buses.user = '${userId}' `, {
        type: QueryTypes.SELECT,
    })


    res.render("./admin_pannel/all_bus.pug", {
        title: "All Bus",
        buses: buses
    })

}
