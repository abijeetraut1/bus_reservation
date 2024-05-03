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

    console.log(buses)

    res.render("./admin_pannel/createWorkersAccount.pug", {
        title: "Worker Account",
        buses: buses
    })
}


exports.update_bus = async (req, res) => {
    res.render("./admin_pannel/update_bus.pug", {
        title: "Update Bus",
    })
}

exports.show_all_bus = async (req, res) => {
    const userId = res.locals.user.id;

    const buses = await database.sequelize.query(`SELECT * FROM buses WHERE buses.user = '${userId}'`, {
        type: QueryTypes.SELECT,
    })

    res.render("./admin_pannel/all_bus.pug", {
        title: "All Bus",
        buses: buses
    })

}