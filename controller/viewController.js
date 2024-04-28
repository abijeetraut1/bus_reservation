const {
    statusFunc
} = require("../utils/statusFunc");
const database = require("./../model/index");

const {
    QueryTypes,
    Sequelize
} = require('sequelize');

exports.home = (req, res) => {
    res.render("./user/home.pug", {
        title: "Home"
    });
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
        'SELECT  buses.id,  buses.busName, buses.stopLocation, buses.price, buses.busNumber, buses.isAcAvailable, buses.isWaterProvidable, buses.isBlanketProvidable, buses.isCharginPointAvailable, buses.isCCTVavailable, buses.acceptMobileTicket, buses.noOfSeats, buses.slug FROM buses ', {
            type: QueryTypes.SELECT,
        });

    // extract the id where the locations contains
    const LocationsContains = [];
    const sumRate = {
        totalRate: 0,
        count: 0
    };

    Promise.all(searchResult.map(async el => {
            el.stopLocation = JSON.parse(el.stopLocation)

            // only select those field which contains those 2 locations
            if (el.stopLocation.includes(fromLocation) && el.stopLocation.includes(toLocation) === true) {
                try {
                    const checkSeat = await database.sequelize.query(`SELECT * FROM ${date.replaceAll("-", "_") + "_" + el.busNumber + "_" + el.busName.replaceAll(" ", "_") }`, {
                        type: QueryTypes.SELECT,
                    });

                    el.bookedSeats = checkSeat.length;

                    const checkRatings = await database.sequelize.query(`SELECT * FROM ${el.busNumber + "_" + el.busName.replaceAll(" ", "_") + "_ratings" }`, {
                        type: QueryTypes.SELECT,
                    });

                } catch (err) {
                    // Handle error
                    el.bookedSeats = 0;
                }
                LocationsContains.push(el);
            }
        })).then(() => {

            console.log(LocationsContains)
            // statusFuncLength(res, 200, LocationsContains);
            res.render("./user/Search_Result.pug", {
                buses: LocationsContains,
                ratings: sumRate,
                title: toLocation
            })
        })
        .catch(err => {
            // Handle error if any of the promises fail
            console.error("Error:", err);
        });



}