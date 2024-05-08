const database = require("../model/index");

const {
    Sequelize,
    QueryTypes
} = require("sequelize");


exports.checkTicket = async (req, res) => {
    const {
        bus,
        seat
    } = req.params;

    const tableName = "2024-04-10".replaceAll("-", "_") + "_" + bus.toLowerCase().replaceAll("-", "_");
    const selectData = await database.sequelize.query(`UPDATE ${tableName} SET isTicketChecked = 1 WHERE seatNo = '${seat}' `, {
        type: QueryTypes.UPDATE,
    })

    res.redirect("/");
}



exports.getCurrentBusPosition = async (req, res) => {
    io.emit('some-event', "data"); // Emit an event to all connected clients
    res.send('Response');
    
    // res.render("./Conductor/host_location.pug", {
    //     user: "hello"
    // })
}


// Express route handler
exports.host_location = async (req, res) => {
    
    res.render("./Conductor/host_location.pug", {
        user: "hello"
    });
};
