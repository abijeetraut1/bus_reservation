const {
    statusFunc,
    statusFuncLength,
    statusFuncWithRender
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
        const user = res.locals.user.id;

        // Adding image name in array
        let image = [];
        req.files.forEach(el => {
            image.push(el.filename);
        });

        console.log(image)

        // Extracting request body variables
        const {
            busName,
            startLocation,
            endLocation,
            journeyStartTime,
            busNumber,
            ticketPrice,
            totalSeats,
            sunday,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
            ac,
            blanket,
            busTracking,
            cctv,
            chargingPoint,
            movie,
            noSmoking,
            sos,
            washroom,
            waterBottle,
            wifi,
        } = req.body;

        const daysOfWeek = [
            { day: 'Sunday', value: sunday },
            { day: 'Monday', value: monday },
            { day: 'Tuesday', value: tuesday },
            { day: 'Wednesday', value: wednesday },
            { day: 'Thursday', value: thursday },
            { day: 'Friday', value: friday },
            { day: 'Saturday', value: saturday }
        ];

        const facilitiesArr = [
            { name: 'ac', value: ac },
            { name: 'blanket', value: blanket },
            { name: 'busTracking', value: busTracking },
            { name: 'cctv', value: cctv },
            { name: 'chargingPoint', value: chargingPoint },
            { name: 'movie', value: movie },
            { name: 'noSmoking', value: noSmoking },
            { name: 'sos', value: sos },
            { name: 'washroom', value: washroom },
            { name: 'waterBottle', value: waterBottle },
            { name: 'wifi', value: wifi }
        ];

        const days = JSON.stringify(daysOfWeek); 
        const facilities = JSON.stringify(facilitiesArr);

        const createTable = "CREATE TABLE IF NOT EXISTS buses (id INT AUTO_INCREMENT PRIMARY KEY, user INT, busNumber INT, busName VARCHAR(100), ticketPrice INT, imageJSON JSON, startLocation VARCHAR(100), endLocation VARCHAR(100), stopLocationJSON JSON, journeyStartTime TIME, totalSeats INT, days JSON, facilities JSON, slug VARCHAR(100))";

        await database.sequelize.query(createTable, {
            type: Sequelize.QueryTypes.RAW
        })

        // Check if busNumber already exists
        const busNumberExists = await database.sequelize.query(`SELECT busNumber from buses WHERE busNumber = ${busNumber}`, {
            type: Sequelize.QueryTypes.RAW,
        });

        if (busNumberExists[0].length > 0) {
            return statusFunc(res, 401, "This bus number is already registered.");
        }

        // Create slug for the bus
        const busSlug = `${busNumber}-${busName.replaceAll(" ", "-")}`;

        // Convert stopLocation array to JSON string
        const stopLocation = []; // Define stopLocation
        let fromLocationIndex = extractLocationIndex(locations, startLocation);
        let toLocationIndex = extractLocationIndex(locations, endLocation);

        for (let index = fromLocationIndex; index < locations.length; index++) {
            stopLocation.push(locations[index]);
            if (index === toLocationIndex) break;
        }

        const stopLocationJSON = JSON.stringify(stopLocation);
        const imageJSON = JSON.stringify(image);

        // Prepare INSERT query
        const insertDataQuery = `INSERT INTO buses (user, busNumber, busName, ticketPrice, imageJSON, startLocation, endLocation, stopLocationJSON, journeyStartTime, totalSeats, days, facilities, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // Insert data
        await database.sequelize.query(insertDataQuery, {
            type: Sequelize.QueryTypes.INSERT,
            replacements: [
                user,
                busNumber,
                busName,
                ticketPrice,
                imageJSON,
                startLocation,
                endLocation,
                stopLocationJSON,
                journeyStartTime,
                totalSeats,
                days,
                facilities,
                busSlug
            ]
        });

        statusFunc(res, 200, "Bus registered successfully.");

    } catch (err) {
        console.error(err);
        return statusFunc(res, 500, "Internal server error.");
    }
}


exports.setTravellingDate = async (req, res) => {
    const {
        busId,
        travellingDate,
        time
    } = req.body;

    // converting the array data into string to insert into DB
    const stringTravellingDate = JSON.stringify(travellingDate);

    const createTable = `CREATE TABLE IF NOT EXISTS bus_travelling_day_record (id int AUTO_INCREMENT PRIMARY KEY, busId INT, month varchar(100), days JSON, time varchar(100), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await database.sequelize.query(createTable, {
        type: QueryTypes.RAW,
    })
    const insertData = `INSERT INTO bus_travelling_day_record (busId, month, days, time) VALUES (?, ?,?, ?) `;

    await database.sequelize.query(insertData, {
        type: QueryTypes.RAW,
        replacements: [busId, new Date().getMonth() + 1, stringTravellingDate, time]
    })

    statusFunc(res, 200, "created")
}

// searching the bus according to the bus location
exports.searchBus = async (req, res) => {

    const {
        fromLocation,
        toLocation,
        date
    } = req.params;

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
            LocationsContains.push(el);
        }
    })

    console.log(LocationsContains)

    statusFuncLength(res, 200, LocationsContains);
}

// reserve the seat according to the bus location
exports.reserveSeat = async (req, res) => {
    try {
        const {
            slug
        } = req.params;
        const {
            seatno,
            year,
            month,
            day,
            passengerCurrentLocation,
            passengerDestination
        } = req.body;

        // block the reservation on past dates
        // if(year < new Date().getFullYear() || month < new Date().getMonth() + 1 || day < new Date().getDate()){
        //     return statusFunc(res, 400, "cannot reserve seat on the past dates");
        // } 

        const userId = res.locals.user.id;

        const tableName = `${year}_${month}_${day}_${slug.replaceAll("-", "_")}`;

        const createTable = `CREATE TABLE IF NOT EXISTS ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, seatNo VARCHAR(3), userid INT, busid INT, isTicketChecked TINYINT(0) NOT NULL, passengerCurrentLocation varchar(100), passengerDestination varchar(100), createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

        // created table
        await database.sequelize.query(createTable, {
            type: QueryTypes.RAW,
        })

        const allBuses = await database.sequelize.query(`SELECT * FROM ${tableName}`, {
            type: QueryTypes.SELECT
        })

        // finding the seat no to check the bus total seats
        const busSeat = await database.sequelize.query(`SELECT buses.id, buses.noOfSeats FROM buses WHERE slug = ?`, {
            type: QueryTypes.SELECT,
            replacements: [slug]
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
        const ifSeatAvailable = await database.sequelize.query(`SELECT ${tableName}.seatNo FROM ${tableName} WHERE seatNo = '${seatno}'`, {
            type: QueryTypes.SELECT,
        })
        // SELECT ${tableName}.seatNo FROM ${tableName} WHERE seatNo = ${seatno}

        console.log(ifSeatAvailable)

        if (ifSeatAvailable.length === 1) {
            return statusFunc(res, 400, "seat is already booked");
        }


        // inserting the data
        await database.sequelize.query(`INSERT INTO ${tableName} (seatNo, userId, busid, isTicketChecked, passengerCurrentLocation, passengerDestination) values (?, ?, ?, ?, ?, ?)`, {
            type: QueryTypes.RAW,
            replacements: [seatno, userId, busSeat[0].id, 0, passengerCurrentLocation, passengerDestination]
        })

        statusFunc(res, 200, `seat no: ${seatno} by userid: ${userId}`)

    } catch (err) {
        return console.error(err);
    }
}



// 23-07-14-kankai-1234
// year-month-day-busName-busNumber
// gives the reserved seats based on that day driver perspective
exports.allReservedSeat = async (req, res) => {
    try {
        const user = 1;
        const {
            year,
            month,
            day
        } = req.body;
        const {
            slug
        } = req.params;

        const tableName = `${year}_${month}_${day}_${slug.replaceAll("-", "_")}`;

        // JOINED users table and buses table to extract who booked the ticket
        // used sql projection to extract the only wanted information
        const userReservationDetails = await database.sequelize.query(
            `SELECT users.email, users.phoneNo, users.firstName, users.lastName, ${tableName}.passengerCurrentLocation, ${tableName}.passengerDestination, buses.busNumber, buses.busName, buses.fromLocation, buses.toLocation, buses.stopLocation, buses.price FROM ${tableName} JOIN users ON users.id = ${tableName}.userid  JOIN buses ON buses.id = ${tableName}.busid`, {
                type: QueryTypes.SELECT,
            }
        )

        userReservationDetails.forEach((el, i) => {
            userReservationDetails[i].stopLocation = JSON.parse(el.stopLocation);
        })

        statusFunc(res, 200, userReservationDetails);
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

const socketIo = require('socket.io');
const app = require("express")();
const http = require("http");
const server = http.createServer(app);
const io = socketIo(server);

exports.currentBusLocations = async (req, res) => {
    // Handle socket connections
    io.on('connection', (socket) => {
        console.log('Driver is Sending Location');

        // Handle incoming messages
        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.emit('chat message', msg); // Broadcast message to all connected clients
        });

        // Handle disconnections
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    res.render("index.pug")
}

exports.getCurrentBusPosition = async (req, res) => {
    io.on('connection', (socket) => {
        console.log('users is reciving location');

        // Handle incoming messages
        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.emit('chat message', msg); // Broadcast message to all connected clients
        });

        // Handle disconnections
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}