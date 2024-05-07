const {
    statusFunc
} = require("../../utils/statusFunc");
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



exports.dashboard = async (req, res) => {
    const userId = res.locals.user.id;

    const busesCompany = await database.sequelize.query("SELECT * FROM users WHERE users.role = 'owner'", {
        type: QueryTypes.SELECT
    })

    const buses = await database.sequelize.query("SELECT id FROM buses", {
        type: QueryTypes.SELECT
    })

    const busesLength = buses.length;
    const totalCompany = busesCompany.length;
    const tables = await database.sequelize.query(`SHOW TABLES IN bus_reservations WHERE Tables_in_bus_reservations NOT IN ('buses', 'users')`, {
        type: QueryTypes.SHOWTABLES
    });

    var totalBookedSeat = 0;
    var totalIncome = 0;


    for (const table of tables) {
        const buses = await database.sequelize.query(`SELECT price FROM ${table}`, {
            type: QueryTypes.SHOWTABLES
        });
        totalBookedSeat += buses.length;

        for (const ticket of buses) {
            totalIncome += ticket.price;
        }
    }

    var bookedSeats = []; // Changed variable name to bookedSeats

    for (const table of tables) {

        // Use a different variable name here
        const seats = await database.sequelize.query(`SELECT ${table}.id, ${table}.busid, ${table}.price, ${table}.passengerCurrentLocation, ${table}.passengerDestination, ${table}.seatNo, users.name FROM ${table} JOIN users ON users.id = ${table}.userid WHERE ${table}.userid = users.id`, {
            type: QueryTypes.SELECT
        });

        for (const seat of seats) {
            const busName = await database.sequelize.query(`SELECT buses.busName FROM buses WHERE buses.id = '${seat.busid}'`, {
                type: QueryTypes.SELECT
            });

            seat.busName = busName[0].busName;
            bookedSeats.push(seat);
        }
    }

    res.render("./admin_pannel/Dashboard.pug", {
        title: "Dashboard",
        totalCompany: totalCompany,
        busesLength: busesLength,
        totalBookedSeat: totalBookedSeat,
        totalIncomeGenerated: totalIncome,
        userBookedSeat: bookedSeats
    })
}

exports.listed_company = async (req, res) => {
    const busesCompany = await database.sequelize.query("SELECT * FROM users WHERE users.role = 'owner'", {
        type: QueryTypes.SELECT
    })

    // JOIN buses ON buses.user = users.id WHERE users.role = 'owner'
    const busesCompanyList = await database.sequelize.query("SELECT users.name, users.phoneNo, buses.busNumber, buses.busName, buses.startLocation, buses.ticketPrice, buses.endLocation, buses.totalSeats FROM buses JOIN users ON buses.user = users.id", {
        type: QueryTypes.SELECT
    })

    console.log(busesCompanyList)

    const totalCompany = busesCompany.length;

    res.render("./admin_pannel/all_company.pug", {
        title: "Companys",
        totalCompany: totalCompany,
        companys: busesCompanyList
    })
};

exports.all_users = async (req, res) => {
    const users = await database.sequelize.query("SELECT users.name, users.phoneNo, users.role FROM users", {
        type: QueryTypes.SELECT
    })

    res.render("./admin_pannel/all_users.pug", {
        title: "users",
        users: users
    })
};

function ArrangeSeat(seatArr) {
    for (let i = 0; i < seatArr.length - 1; i++) {
        for (let j = 0; j < seatArr.length - i - 1; j++) {
            if (seatArr[j] > seatArr[j + 1]) {
                const temp = seatArr[j];
                seatArr[j] = seatArr[j + 1];
                seatArr[j + 1] = temp;
            }
        }
    }
    return seatArr;
}


exports.ticket_records = async (req, res) => {
    const tables = await database.sequelize.query(`SHOW TABLES IN bus_reservations WHERE Tables_in_bus_reservations NOT IN ('buses', 'users')`, {
        type: QueryTypes.SHOWTABLES
    });

    const dataArr = [];
    for (const table of tables) {
        const tableData = await database.sequelize.query(`SELECT seatNo, busid FROM ${table}`, {
            type: QueryTypes.SELECT
        })

        const userData = await database.sequelize.query(`SELECT users.name, ${table}.seatNo, ${table}.busId, ${table}.passengerCurrentLocation, ${table}.passengerDestination, ${table}.isTicketChecked FROM ${table} JOIN users ON users.id = ${table}.userid`, {
            type: QueryTypes.SELECT
        })


        const seatNo = await database.sequelize.query(`SELECT totalSeats FROM buses WHERE buses.id = ${tableData[0].busid}`,{
            type: QueryTypes.SELECT,
        })

        const seatA = [];
        const seatB = [];

        tableData.filter((el, i) => el.seatNo.startsWith("A") ? seatA.push(el.seatNo.slice(1, el.seatNo.length)) : seatB.push(el.seatNo.slice(1, el.seatNo.length)));

        table.seatA = ArrangeSeat(seatA);
        table.seatB = ArrangeSeat(seatB);
        
        dataArr.push({
            tableName: table,
            totalSeat: seatNo[0].totalSeats,
            seatA: seatA,
            seatB: seatB,
            ticketer: userData
        })
    }

    console.log(dataArr)
    res.render("./admin_pannel/Ticket_Records.pug", {
        title: "Records",
        tables: dataArr
    })
}