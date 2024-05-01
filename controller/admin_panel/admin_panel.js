const database = require("./../../model/index");
const {sequelize, QueryTypes} = require("sequelize");

exports.addBus = (req, res) => {
    res.render("./admin_pannel/add_bus.pug", {
        title: "Add Bus"
    })
}


exports.bookedSeat = async(req, res) => {
    const bus = {
        noOfSeats: 32
    }

    const seatA = ["1","2","3","4","17"];
    const seatB = ["1","2","3","4","15"];


    res.render("./admin_pannel/bookedSeat.pug", {
        title: "Booked Seats",
        bus: bus,
        seatA,
        seatB
    })
}
