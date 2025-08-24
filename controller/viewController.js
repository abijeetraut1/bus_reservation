const {
    statusFunc
} = require("../utils/statusFunc");

const database = require("./../model/index");

const {
    QueryTypes,
    Sequelize
} = require('sequelize');
const {
    bookedSeat
} = require("./admin_panel/admin_panel");
const { SELECT } = require("sequelize/lib/query-types");
const stripe = require('stripe')('sk_test_51PCFKESCr9yQB7OIgWwuHwRQyvpBv5NDU0D6QrQtDvtoD99P3jHoo3bShnAjMiSjxPdwTzDKLTaEpVZaOVifJec000loBuXI73');


exports.home = async (req, res) => {
    const user = res.locals.user;
    let bus_slug;

    // console.log(user.busId)
    if (user && user.busId) {
        const [bus_details] = await database.sequelize.query(
            'SELECT slug FROM buses WHERE id = :busId',
            {
                replacements: { busId: user.busId },
                type: QueryTypes.SELECT,
            }
        );

        bus_slug = bus_details.slug;
    }

    console.log(user)

    res.render("./user/home.pug", {
        title: "Home",
        user: user,
        bus: bus_slug,
    });
}

exports.logout = async (req, res) => {
    res.clearCookie('jwt');

    if (req.path === "/") {
        res.redirect(req.originalUrl);
    } else {
        res.redirect("/");
    }
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


// searching the bus according to the bus location
exports.search = async (req, res, next) => {
    try {
        const { from: fromLocation, to: toLocation, date } = req.query;
        if (!fromLocation || !toLocation) {
            return statusFunc(res, 200, "Please enter appropriate location");
        }

        const searchResult = await database.sequelize.query(
            'SELECT buses.id, buses.busName, buses.stopLocationJSON, buses.ticketPrice, buses.busNumber, buses.facilities, buses.totalSeats, buses.slug FROM buses',
            { type: QueryTypes.SELECT }
        );

        const LocationsContains = [];
        const sumRate = { totalRate: 0, count: 0 };

        for (const el of searchResult) {
            el.stopLocation = el.stopLocationJSON;

            if (el.stopLocation.includes(fromLocation) && el.stopLocation.includes(toLocation)) {
                try {
                    const tableName = `${date.replaceAll("-", "_")}_${el.busNumber}_${el.busName.replaceAll(" ", "_")}`;
                    const checkSeat = await database.sequelize.query(
                        `SELECT seatNo FROM ${tableName}`,
                        { type: QueryTypes.SELECT }
                    );

                    el.bookedSeats = checkSeat.length;

                    const seatA = [], seatB = [];
                    checkSeat.forEach(seat => {
                        seat.seatNo.startsWith("A") ? seatA.push(seat.seatNo.slice(1)) : seatB.push(seat.seatNo.slice(1));
                    });

                    el.seatA = ArrangeSeat(seatA);
                    el.seatB = ArrangeSeat(seatB);
                } catch (err) {
                    el.bookedSeats = 0;
                }

                const stop_per_price = el.ticketPrice / el.stopLocation.length;
                const stop_raw_calc = Math.abs(el.stopLocation.indexOf(fromLocation) - el.stopLocation.indexOf(toLocation));
                el.bus_fare = Math.floor(stop_raw_calc * stop_per_price);

                LocationsContains.push(el);
            }
        }

        res.render("./user/Search_Result.pug", {
            buses: LocationsContains,
            ratings: sumRate,
            title: toLocation,
            from: fromLocation,
            to: toLocation,
            date
        });
    } catch (err) {
        console.error(err);
        next(err); // ✅ properly forward error to Express
    }
};


exports.login = (req, res) => {
    res.render("./login.pug", {
        title: "Login",
    })
}

exports.track = (req, res) => {
    const { slug } = req.params;
    res.render("./user/Tracker.pug", {
        title: "Track",
        bus: slug
    })
}

exports.tickets = async (req, res) => {
    console.log(res.locals.user)
    const user_id = res.locals.user.id;
    console.log(user_id)

    // SHOW TABLES In mystudentdb WHERE Tables_in_mystudentdb= "employees";  
    const tables = await database.sequelize.query(
        `SHOW TABLES IN bus_reservation WHERE Tables_in_bus_reservation NOT IN ('buses', 'users', 'payments', 'price', 'ratings')`,
        { type: QueryTypes.SHOWTABLES }
    );

    const tickets = [];

    if (user_id) {
        for (const table of tables) {
            console.log(table)
            const datas = await database.sequelize.query(`SELECT seatNo, passengerCurrentLocation, passengerDestination, ticketExpirationStatus, createdAt, buses.slug, buses.busName, buses.busNumber FROM ${table} JOIN buses ON buses.id = ${table}.busId WHERE userid = '${user_id}'`, {
                type: QueryTypes.SELECT,
            })

            for (const ticket of datas) {
                tickets.push(ticket);
            }
        };
    }


    console.log(tickets)

    res.render("./user/tickets.pug", {
        title: "Tickets",
        tickets: tickets,

    })
}

exports.register = (req, res) => {
    res.render("./register.pug", {
        title: "Register",
    })
}


exports.signup_as_company = (req, res) => {
    res.render("./Sign_as_company.pug", {
        title: "Register Company",
    })
}

// payment section not working
const YOUR_DOMAIN = 'http://localhost:8003';

exports.checkout_session = async (req, res) => {
    const busSlug = req.params.slug;

    const busPrice = await database.sequelize.query(`SELECT buses.ticketPrice FROM buses WHERE slug = '${busSlug}'`, {
        type: QueryTypes.SELECT
    });

    console.log(busPrice)
    if (!busPrice) res.render("Not_Found.pug");

    const session = await stripe.checkout.sessions.create({
        line_items: [{
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: busPrice.map(el => el.ticketPrice),
            quantity: 1,
        },],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}`,
        cancel_url: `${YOUR_DOMAIN}`,
    });

    res.redirect(303, session.url);
}

exports.about = (req, res) => {
    res.render("about.pug", {
        title: "About Us",
    })
}

exports.payment_success = async (req, res) => {
    console.log(req.query)
    const {
        pidx,
        transaction_id,
        tidx,
        txnId,
        amount,
        total_amount,
        mobile,
        status,
        purchase_order_id,
        purchase_order_name
    } = req.query;

    console.log(req.query)

    // Log or process the payment info
    await database.sequelize.query(`
  CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(255),
    amount DECIMAL(10,2),
    status VARCHAR(50),
    bus_id VARCHAR(255),
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

    // Store payment
    const busId = purchase_order_name.split("--")[0];
    const userId = purchase_order_name.split("--")[1];
    const from = purchase_order_name.split("--")[2];
    const to = purchase_order_name.split("--")[3];
    // const to = purchase_order_name.split("--")[4];

    const seatsArray = purchase_order_name.split("--")[4].split(",");
    console.log(seatsArray)


    await database.sequelize.query(`
  INSERT INTO payments (transaction_id, amount, status, bus_id, user_id)
  VALUES (?, ?, ?, ?, ?)
`, {
        replacements: [transaction_id, amount, status, busId, userId]
    });

    const [bus_details] = await database.sequelize.query(
        'SELECT slug FROM buses WHERE id = :busId',
        {
            replacements: { busId: busId },
            type: QueryTypes.SELECT,
        }
    );

    console.log(bus_details)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');


    const tableName = `${year}_${month}_${day}_${bus_details.slug.replaceAll("-", "_")}`;
    const expirationDate = `${year}-${month}-${day}`;

    const createTable = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            seatNo VARCHAR(3),
            userid INT,
            busid INT,
            isTicketChecked TINYINT(1) NOT NULL,
            passengerCurrentLocation VARCHAR(100),
            passengerDestination VARCHAR(100),
            price INT,
            ticketExpirationStatus TINYINT(1) DEFAULT 0,
            ticketExpirationDate DATE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userid) REFERENCES Users(id),
            FOREIGN KEY (busid) REFERENCES Buses(id)
        );`;

    // created table
    await database.sequelize.query(createTable, {
        type: QueryTypes.RAW,
    })

    const allBuses = await database.sequelize.query(`SELECT * FROM ${tableName}`, {
        type: QueryTypes.SELECT
    })

    // finding the seat no to check the bus total seats
    const busSeat = await database.sequelize.query(`SELECT buses.id, buses.totalSeats FROM buses WHERE slug = ?`, {
        type: QueryTypes.SELECT,
        replacements: [bus_details.slug]
    })

    // checking if all seats are reserved
    if (allBuses.length === busSeat[0].noOfSeats) {
        return statusFunc(res, 200, "all seats are reserved");
    }

    // checking if the bus is available
    if (busSeat.length === 0) {
        return statusFunc(res, 400, "bus not found");
    }

    // checking if the reserved seat is available or already reserved
    // const ifSeatAvailable = await database.sequelize.query(`SELECT ${tableName}.seatNo FROM ${tableName} WHERE seatNo = '${seatno}'`, {
    //     type: QueryTypes.SELECT,
    // })

    // console.log(ifSeatAvailable)

    // if (ifSeatAvailable.length === 1) {
    //     return statusFunc(res, 400, "seat is already booked");
    // }


    seatsArray.forEach(async el => {
        await database.sequelize.query(`INSERT INTO ${tableName} (seatNo, userId, busid, isTicketChecked, passengerCurrentLocation, passengerDestination, price, ticketExpirationStatus, ticketExpirationDate) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`, {
            type: QueryTypes.INSERT,
            replacements: [el, userId, busId, 0, from, to, amount, 0, expirationDate]
        });
    })

    res.render('./user/payment_successfull.pug', {
        title: "Payment Successful",
        transaction: {
            pidx,
            transaction_id,
            amount,
            status,
            mobile,
            purchase_order_id,
            purchase_order_name
        }
    });
}
