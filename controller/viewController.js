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
const stripe = require('stripe')('sk_test_51PCFKESCr9yQB7OIgWwuHwRQyvpBv5NDU0D6QrQtDvtoD99P3jHoo3bShnAjMiSjxPdwTzDKLTaEpVZaOVifJec000loBuXI73');


exports.home = (req, res) => {
    const user = res.locals.user;

    res.render("./user/home.pug", {
        title: "Home",
        user: user
    });
}


exports.logout = async (req, res) => {
    res.clearCookie('jwt');

    res.redirect("/");
}

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
exports.search = async (req, res) => {
    console.log(req.query)
    const {
        from: fromLocation,
        to: toLocation,
        date
    } = req.query;

    if (!fromLocation || !toLocation) {
        return statusFunc(res, 200, "please enter appropriate location");
    }

    // search all the buses
    const searchResult = await database.sequelize.query(
        'SELECT  buses.id, buses.busName, buses.stopLocationJSON, buses.ticketPrice, buses.busNumber, buses.facilities, buses.totalSeats, buses.slug FROM buses ', {
            type: QueryTypes.SELECT,
        });


    // extract the id where the locations contains
    const LocationsContains = [];
    const sumRate = {
        totalRate: 0,
        count: 0
    };

    if (searchResult.length === 0) return;


    Promise.all(searchResult.map(async el => {
        el.stopLocation = JSON.parse(el.stopLocationJSON)

        // only select those field which contains those 2 locations
        if (el.stopLocation.includes(fromLocation) && el.stopLocation.includes(toLocation) === true) {

            LocationsContains.push(el);
        }
    })).then(async () => {
        for(const el of LocationsContains){
            try{

                const checkSeat = await database.sequelize.query(`SELECT seatNo FROM ${date.replaceAll("-", "_") + "_" + el.busNumber + "_" + el.busName.replaceAll(" ", "_") }`, {
                    type: QueryTypes.SELECT,
                });
                
                el.bookedSeats = checkSeat.length;
                // if(checkSeat.length === 0) return;
                const seatA = [];
                const seatB = [];
                
                checkSeat.filter((el, i) => el.seatNo.startsWith("A") ? seatA.push(el.seatNo.slice(1, el.seatNo.length)) : seatB.push(el.seatNo.slice(1, el.seatNo.length)));
                el.seatA = ArrangeSeat(seatA);
                el.seatB = ArrangeSeat(seatB);
            } catch(err) {
                el.bookedSeat = 0;
            }
                
            const stop_per_price = el.ticketPrice / el.stopLocation.length;
            const stop_raw_calc = Math.abs(el.stopLocation.indexOf(fromLocation) - el.stopLocation.indexOf(toLocation));
            el.bus_fare = stop_raw_calc * stop_per_price;
        }


        res.render("./user/Search_Result.pug", {
            buses: LocationsContains,
            ratings: sumRate,
            title: toLocation,
            from: fromLocation,
            to: toLocation,
            date: date
        })
    }).catch(err => {
        // Handle error if any of the promises fail
        console.error("Error:", err);
    });
}

exports.login = (req, res) => {
    res.render("./login.pug", {
        title: "Login",
    })
}

exports.tickets = async(req, res) => {
    const user_id = res.locals.user.id;

    // SHOW TABLES In mystudentdb WHERE Tables_in_mystudentdb= "employees";  
    const tables = await database.sequelize.query(`SHOW TABLES IN bus_reservations WHERE Tables_in_bus_reservations NOT IN ('buses', 'users')`);
    
    console.log(tables[0])
    const tickets = [];

    for(const table of tables[0]){
        const tableName = table.Tables_in_bus_reservations;
        console.log(tableName)
        const datas = await database.sequelize.query(`SELECT seatNo, passengerCurrentLocation, passengerDestination, createAt, buses.slug, buses.busName, buses.busNumber FROM ${table.Tables_in_bus_reservations} JOIN buses ON buses.id = ${table.Tables_in_bus_reservations}.busId WHERE userid = '${user_id}'`, {
            type: QueryTypes.SELECT,
        })
        
        for(const ticket of datas){
            tickets.push(ticket);
        }
    };

    console.log(tickets)

    res.render("./user/tickets.pug", {
        title: "Tickets",
        tickets: tickets
    })
}

exports.register = (req, res) => {
    res.render("./register.pug", {
        title: "Register",
    })
}

// payment section not working
const YOUR_DOMAIN = 'http://localhost:8000';

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
        }, ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}`,
        cancel_url: `${YOUR_DOMAIN}`,
    });

    res.redirect(303, session.url);
}