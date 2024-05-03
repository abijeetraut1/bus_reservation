const {
    statusFunc
} = require("../utils/statusFunc");
const database = require("./../model/index");

const {
    QueryTypes,
    Sequelize
} = require('sequelize');
const { bookedSeat } = require("./admin_panel/admin_panel");
const stripe = require('stripe')('sk_test_51PCFKESCr9yQB7OIgWwuHwRQyvpBv5NDU0D6QrQtDvtoD99P3jHoo3bShnAjMiSjxPdwTzDKLTaEpVZaOVifJec000loBuXI73');


exports.home = (req, res) => {
    const user = res.locals.user;

    res.render("./user/home.pug", {
        title: "Home",
        user: user
    });
}


exports.logout = async(req, res) => {
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

    let arrangedSeatA;
    let arrangedSeatB;

    if(searchResult.length === 0) return;


    Promise.all(searchResult.map(async el => {
            el.stopLocation = JSON.parse(el.stopLocationJSON)

            // only select those field which contains those 2 locations
            if (el.stopLocation.includes(fromLocation) && el.stopLocation.includes(toLocation) === true) {
                try {
                    const checkSeat = await database.sequelize.query(`SELECT * FROM ${date.replaceAll("-", "_") + "_" + el.busNumber + "_" + el.busName.replaceAll(" ", "_") }`, {
                        type: QueryTypes.SELECT,
                    });

                    el.bookedSeats = checkSeat.length;
                    console.log(bookedSeats)

                    // 2024_12_12_2221_kankai_bus
                    console.log(date)
                    const seatArr = await database.sequelize.query(`SELECT seatNo FROM ${date.replaceAll("-", "_") + "_"  + el.slug.replaceAll("-", "_")}`, {
                        type: QueryTypes.SELECT
                    })
                
                    if(seatArr.length === 0) return res.send("hello world");
                    const seatA = [];
                    const seatB = [];

                    seatArr.filter((el, i) => el.seatNo.startsWith("A") ? seatA.push(el.seatNo.slice(1, el.seatNo.length)) : seatB.push(el.seatNo.slice(1, el.seatNo.length)));

                    arrangedSeatA = ArrangeSeat(seatA);
                    arrangedSeatB = ArrangeSeat(seatB);
                    console.log(arrangedSeatA, arrangedSeatB)
                } catch (err) {
                    // Handle error
                    el.bookedSeats = 0;
                }
                LocationsContains.push(el);
            }
        })).then(() => {

            // console.log(LocationsContains)
            // statusFuncLength(res, 200, LocationsContains);
            res.render("./user/Search_Result.pug", {
                buses: LocationsContains,
                ratings: sumRate,
                title: toLocation,
                seatA: arrangedSeatA,
                seatB: arrangedSeatB,
                from: fromLocation,
                to: toLocation
            })
        })
        .catch(err => {
            // Handle error if any of the promises fail
            console.error("Error:", err);
        });
}

exports.login = (req, res) => {
    res.render("./login.pug", {
        title: "Login",
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
    if(!busPrice) res.render("Not_Found.pug");
    
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
