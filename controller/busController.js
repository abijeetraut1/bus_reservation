const {
    statusFunc,
    statusFuncLength
} = require("../utils/statusFunc");
const database = require("./../model/index");
const busModel = database.bus;

const {
    QueryTypes,
    Sequelize
} = require('sequelize');

const locations = ['damak', 'urlabari', 'manglabare', 'pathri', 'bhaunne', 'laxmimarga', 'belbari', 'lalbhitti', 'khorsane', 'birathchowk', 'gothgaon', 'itahari'];

// extract the index position of the location 
function extractLocationIndex(locations, checkLocation) {
    return locations.findIndex(el => el.toUpperCase() === checkLocation.toUpperCase());
}

exports.registerBus = async (req, res) => {
    try {
        const user = 1;

        // adding image name in array
        let image = [];
        req.files.forEach(el => {
            image.push(el.filename);
        });

        const {
            busNumber,
            busName,
            noOfStaff,
            fromLocation,
            toLocation,
            price,
            isAcAvailable,
            isWaterProvidable,
            isBlanketProvidable,
            isCharginPointAvailable,
            isCCTVavailable,
            acceptMobileTicket,
            noOfSheats,
            sunday,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday
        } = req.body;

        let fromLocationIndex = extractLocationIndex(locations, fromLocation);
        let toLocationIndex = extractLocationIndex(locations, toLocation);

        // adding sublist of the location
        const stopLocation = [];
        for (let index = fromLocationIndex; index < locations.length; index++) {
            stopLocation.push(locations[index]);
            if (index === toLocationIndex) break;
        }

        const busSlug = `${busNumber}-${busName.replaceAll(" ", "-")}`;

        const createTableQuery = `CREATE TABLE IF NOT EXISTS buses (id INT AUTO_INCREMENT PRIMARY KEY, busNumber INT,busName TEXT,noOfStaff INT,fromLocation TEXT,toLocation TEXT, stopLocation JSON, price INT,isAcAvailable TINYINT(1),isWaterProvidable TINYINT(1),isBlanketProvidable TINYINT(1),isCharginPointAvailable TINYINT(1),isCCTVavailable TINYINT(1),acceptMobileTicket TINYINT(1),noOfSeats TINYINT(1),sunday TINYINT(1),monday TINYINT(1),tuesday TINYINT(1),wednesday TINYINT(1),thursday TINYINT(1),friday TINYINT(1),saturday TINYINT(1), slug TEXT)`;

        const insertDataQuery = `INSERT INTO buses ( busNumber, busName, noOfStaff, fromLocation, toLocation, stopLocation, price, isAcAvailable, isWaterProvidable, isBlanketProvidable, isCharginPointAvailable, isCCTVavailable, acceptMobileTicket, noOfSeats, sunday, monday, tuesday, wednesday, thursday, friday, saturday, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // // validating the registration of bus if someone try to register the bus with the same number
        // const busNumberValidation = await database.sequelize.query(`SELECT busNumber from buses WHERE busNumber = ${busNumber}`, {
        //     type: Sequelize.QueryTypes.RAW,
        // })

        // if (busNumberValidation[0].length > 0) {
        //     return statusFunc(res, 401, "this bus number is already registered")
        // }

        // Create table
        await database.sequelize.query(createTableQuery, {
            type: Sequelize.QueryTypes.RAW
        });

        // Insert data
        await database.sequelize.query(insertDataQuery, {
            type: Sequelize.QueryTypes.INSERT,
            replacements: [
                busNumber,
                busName,
                noOfStaff,
                fromLocation,
                toLocation,
                JSON.stringify(stopLocation),
                price,
                isAcAvailable,
                isWaterProvidable,
                isBlanketProvidable,
                isCharginPointAvailable,
                isCCTVavailable,
                acceptMobileTicket,
                noOfSheats,
                sunday,
                monday,
                tuesday,
                wednesday,
                thursday,
                friday,
                saturday, busSlug
            ]
        });

        statusFunc(res, 200, "createdDB");

    } catch (err) {
        throw err;
    }
}


exports.searchBus = async (req, res) => {
    const {
        fromLocation,
        toLocation
    } = req.body;

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
    searchResult.forEach(el => {
        el.stopLocation = JSON.parse(el.stopLocation)

        // only select those field which contains those 2 locations
        if (el.stopLocation.includes(fromLocation) && el.stopLocation.includes(toLocation) === true) {
            LocationsContains.push(el)
        }
    })

    statusFuncLength(res, 200, LocationsContains);
}


exports.reserveSeat = async (req, res) => {
    try {
        const user = 1;
        const {
            slug
        } = req.params;
        const {
            seatno,
            year,
            month,
            day
        } = req.body;

        const bus = await busModel.findOne({
            where: {
                slug
            }
        });

        const schemaName = `${year}-${month}-${day}-${bus.slug}`;

        const createTable = `CREATE TABLE IF NOT EXISTS \`${schemaName}\` (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, seatno INT, isTicketChecked BOOL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

        await database.sequelize.query(createTable, {
            type: QueryTypes.RAW
        });

        // check if the seat is already booked or not
        const checkReservedSeat = await database.sequelize.query(`SELECT * FROM \`${schemaName}\` WHERE seatno = ?`, {
            type: QueryTypes.SELECT,
            replacements: [seatno * 1],
        })

        // blocks the reservation if the seats been already been booked
        if (checkReservedSeat.length != 0) {
            return statusFunc(res, 400, "seat is already reserved please check another one");
        }

        // booking stop when seat are full
        if (checkReservedSeat.length === bus.noOfSheats) {
            return statusFunc(res, 400, "All seats are full please choose another bus");
        }

        const reserveSeat = await database.sequelize.query(
            `INSERT INTO \`${schemaName}\` (userId, seatno, isTicketChecked,createdAt) VALUES (?, ?, ?, NOW())`, // Use backticks to escape table name
            {
                type: QueryTypes.INSERT,
                replacements: [user.id, seatno, false]
            }
        );

        // save the book data
        const userBookingRecordSchema = user.id + "-" + user.firstName + "-" + user.lastName + Date.now() + "-travel-record";
        const createUserBookingRecord = `CREATE TABLE IF NOT EXISTS \`${userBookingRecordSchema}\` (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, seatno INT, busId INT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        await database.sequelize.query(createUserBookingRecord, {
            type: QueryTypes.RAW
        });

        const resrveSeatRecord = await database.sequelize.query(
            `INSERT INTO \`${userBookingRecordSchema}\` (userId, seatno, busId, createdAt) VALUES (?, ?, ?, NOW())`, {
                type: QueryTypes.INSERT,
                replacements: [user.id, seatno * 1, bus.id]
            }
        );

        statusFunc(res, 200, {
            seat: reserveSeat,
            record: resrveSeatRecord
        });
    } catch (err) {
        return console.error(err);
    }
}


// 23-07-14-kankai-1234
// year-month-day-busName-busNumber

exports.allReservedSeat = async (req, res) => {
    try {
        const user = 1;

        const recordSchemaName = user.id + "-" + user.firstName + "-" + user.lastName + "-travel-record";
        const userReservationDetails = await database.sequelize.query(`
        SELECT * FROM \`${recordSchemaName}\` JOIN buses ON \`${recordSchemaName}\`.busId = buses.id`, {
            type: QueryTypes.SELECT
        });

        statusFunc(res, 200, userReservationDetails);
    } catch (err) {
        return statusFunc(res, 400, err);
    }
}

exports.reservedSeat = async (req, res) => {
    try {

        const user = 1;
        // const ticketName = 
    } catch (err) {
        return statusFunc(res, 400, err);
    }
}


// generate qrCode based on the ticket
exports.showAllTicket = async (req, res) => {
    try {
        const user = 1;
        const userSchema = `${user.id}-${user.firstName}-${user.lastName}-travel-record`;
        const storeAllTicket = await database.sequelize.query(`SELCT * FROM \`${userSchema}\``, {
            type: QueryTypes.SELECT
        })

        if (storeAllTicket.length === 0) {
            return statusFunc(res, 400, "you dont have any bookings yet");
        }

        statusFuncLength(res, 200, storeAllTicket);
    } catch (err) {
        return statusFunc(res, 400, err);
    }
}

exports.rateBus = async (req, res) => {
    try {
        const busSlug = req.params.slug;
        const user = 1;
        const {
            rate,
            review
        } = req.body;

        if (!rate || !review) {
            return statusFunc(res, 400, "rate or review is empty");
        }

        const bus = await busModel.findOne({
            where: {
                slug: busSlug
            }
        });
        // const createUserBookingRecord = `CREATE TABLE IF NOT EXISTS \`${userBookingRecordSchema}\` (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, seatno INT, busId INT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        // const resrveSeatRecord = await database.sequelize.query(
        //     `INSERT INTO \`${userBookingRecordSchema}\` (userId, seatno, busId, createdAt) VALUES (?, ?, ?, NOW())`, {
        //         type: QueryTypes.INSERT,
        //         replacements: [user.id, seatno * 1, bus.id]
        //     }
        // );
        await database.sequelize.query(`CREATE TABLE IF NOT EXISTS \`${busSlug}-${bus.id}\` (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, busId, rate INT, review STRING, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        const uploadBusRating = await database.sequelize.query(`INSERT INTO \`${busSlug}-${bus.id}\` (userid , busId, rate, review) VALUES (?, ?, ?, ?, NOW())`, {
            type: QueryTypes.INSERT,
            replacements: [user.id, bus.id, rate, review]
        })

        statusFunc(res, 201, uploadBusRating);

    } catch (err) {
        return statusFunc(res, 400, err)
    }
}