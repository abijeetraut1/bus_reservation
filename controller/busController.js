const {
    statusFunc,
    statusFuncLength,
    statusFuncWithRender
} = require("../utils/statusFunc");
const db = require("./../model/index");
const Bus = db.buses;
const Payment = db.payments;
const Ticket = db.tickets;
const User = db.users;
const { Op } = require("sequelize");

const {
    QueryTypes,
    Sequelize
} = require('sequelize');

const locations = ['damak', 'urlabari', 'manglabare', 'pathri', 'bhaunne', 'laxmimarga', 'belbari', 'lalbhitti', 'khorsane', 'birathchowk', 'gothgaon', 'itahari'];

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

        // Extracting request body variables
        const {
            busName,
            startLocation,
            endLocation,
            journeyStartTime,
            busNumber,
            ticketPrice,
            totalSeats,
            stopCut,
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

        const daysOfWeek = [{
                day: 'Sunday',
                value: sunday
            },
            {
                day: 'Monday',
                value: monday
            },
            {
                day: 'Tuesday',
                value: tuesday
            },
            {
                day: 'Wednesday',
                value: wednesday
            },
            {
                day: 'Thursday',
                value: thursday
            },
            {
                day: 'Friday',
                value: friday
            },
            {
                day: 'Saturday',
                value: saturday
            }
        ];

        const facilitiesArr = [{
                name: 'ac',
                value: ac
            },
            {
                name: 'blanket',
                value: blanket
            },
            {
                name: 'busTracking',
                value: busTracking
            },
            {
                name: 'cctv',
                value: cctv
            },
            {
                name: 'chargingPoint',
                value: chargingPoint
            },
            {
                name: 'movie',
                value: movie
            },
            {
                name: 'noSmoking',
                value: noSmoking
            },
            {
                name: 'sos',
                value: sos
            },
            {
                name: 'washroom',
                value: washroom
            },
            {
                name: 'waterBottle',
                value: waterBottle
            },
            {
                name: 'wifi',
                value: wifi
            }
        ];

        const days = daysOfWeek;
        const facilities = facilitiesArr;

        // Check if busNumber already exists
        const busNumberExists = await Bus.findOne({
            where: {
                busNumber: busNumber
            }
        });

        if (busNumberExists) {
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

        const stopLocationJSON = stopLocation;
        const imageJSON = image;

        // Create new bus
        await Bus.create({
            userId: user,
            busNumber,
            busName,
            ticketPrice,
            stopCut,
            imageJSON,
            startLocation,
            endLocation,
            stopLocationJSON,
            journeyStartTime,
            totalSeats,
            days,
            facilities,
            slug: busSlug
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
            seatno,
            passengerCurrentLocation,
            passengerDestination,
            price,
            date,
            paymentId,
            busId,
            userId
        } = req.body;

        const [year, month, day] = date.split('-');
        const ticketExpirationDate = new Date(year, month - 1, day);

        // checking if the reserved seat is available or already reserved
        const existingTicket = await Ticket.findOne({
            where: {
                seatNo: {
                    [Op.in]: seatno
                },
                busId: busId,
                ticketExpirationDate: ticketExpirationDate
            }
        });

        if (existingTicket) {
            return statusFunc(res, 400, "One or more seats are already booked.");
        }

        const tickets = [];
        for (const seat of seatno) {
            tickets.push({
                seatNo: seat,
                passengerCurrentLocation,
                passengerDestination,
                price,
                ticketExpirationDate,
                paymentId,
                busId,
                userId
            });
        }

        await Ticket.bulkCreate(tickets);

        statusFunc(res, 200, `Seats ${seatno.join(', ')} reserved successfully.`)

    } catch (err) {
        console.error(err);
        return statusFunc(res, 500, "Internal server error");
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

exports.getOneBus = async (req, res) => {
    const busId = req.params.id;
    console.log(busId)

    const bus = await database.sequelize.query(`SELECT * FROM buses WHERE buses.id = '${busId}'`, {
        type: QueryTypes.SELECT
    })

    statusFunc(res, 200, bus[0]);
}

exports.updateBus = async (req, res) => {
    const busId = req.params.id;

    console.log(req.body);
    const {
        busName,
        busNumber,
        startLocation,
        endLocation,
        journeyStartTime,
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

    const daysOfWeek = [{
            day: 'Sunday',
            value: sunday
        },
        {
            day: 'Monday',
            value: monday
        },
        {
            day: 'Tuesday',
            value: tuesday
        },
        {
            day: 'Wednesday',
            value: wednesday
        },
        {
            day: 'Thursday',
            value: thursday
        },
        {
            day: 'Friday',
            value: friday
        },
        {
            day: 'Saturday',
            value: saturday
        }
    ];

    const facilitiesArr = [{
            name: 'ac',
            value: ac
        },
        {
            name: 'blanket',
            value: blanket
        },
        {
            name: 'busTracking',
            value: busTracking
        },
        {
            name: 'cctv',
            value: cctv
        },
        {
            name: 'chargingPoint',
            value: chargingPoint
        },
        {
            name: 'movie',
            value: movie
        },
        {
            name: 'noSmoking',
            value: noSmoking
        },
        {
            name: 'sos',
            value: sos
        },
        {
            name: 'washroom',
            value: washroom
        },
        {
            name: 'waterBottle',
            value: waterBottle
        },
        {
            name: 'wifi',
            value: wifi
        }
    ];

    const days = JSON.stringify(daysOfWeek);
    const facilities = JSON.stringify(facilitiesArr);

    await database.sequelize.query(`UPDATE buses SET busName = ?, busNumber = ?, startLocation = ?, endLocation = ?, journeyStartTime = ?, ticketPrice = ?, totalSeats = ?, days = ?, facilities = ? WHERE id = ?`, {
        type: QueryTypes.UPDATE,
        replacements: [busName, busNumber, startLocation, endLocation, journeyStartTime, ticketPrice, totalSeats, days, facilities, busId]
    })

    statusFunc(res, 200, "updated table");
}

exports.deleteBus = async (req, res) => {
    const userData = res.locals.user.id;
    const busToDelete = req.params.id;

    await database.sequelize.query(`DELETE FROM buses WHERE id = '${busToDelete}'`, {
        type: QueryTypes.DELETE
    })

    statusFunc(res, 200, "deleted");
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

const axios = require('axios');

exports.khaltiPaymentVerification = async (req, res) => {
    try {
        const {
            token,
            amount,
            seatno,
            passengerCurrentLocation,
            passengerDestination,
            date,
            price
        } = req.body;

        const response = await axios.post("https://khalti.com/api/v2/payment/verify/", {
            token: token,
            amount: amount
        }, {
            headers: {
                'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`
            }
        });

        if (response.data.state === "Completed") {
            const bus_slug = req.get('Referer').split('/')[4].split('?')[0];
            const bus = await Bus.findOne({
                where: {
                    slug: bus_slug
                }
            });

            if (!bus) {
                return statusFunc(res, 404, "Bus not found");
            }

            const payment = await Payment.create({
                token: token,
                amount: amount,
                status: response.data.state,
                seatNo: seatno,
                userId: req.locals.user.id,
                busId: bus.id
            });

            const reserveSeatReq = {
                body: {
                    seatno,
                    passengerCurrentLocation,
                    passengerDestination,
                    price,
                    date,
                    paymentId: payment.id,
                    busId: bus.id,
                    userId: req.locals.user.id
                },
            };

            await exports.reserveSeat(reserveSeatReq, res);
        } else {
            statusFunc(res, 400, "Payment verification failed.");
        }
    } catch (err) {
        console.error(err);
        return statusFunc(res, 500, "Internal server error.");
    }
}