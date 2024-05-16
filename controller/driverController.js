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

exports.checkTicketPage = async (req, res) => {
    const userid = res.locals.user.id;
    
    
    
    const new_Date = new Date();
    const Current_Date = new_Date.getFullYear() + "_" + (new_Date.getMonth() + 1) + "_" + new_Date.getDate();
    console.log(Current_Date);

    res.render("./Conductor/Tickets.pug", {
        title: `Check Ticket ${Current_Date.replaceAll("_", "-")}`
    })
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