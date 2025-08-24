const port = 8000 || process.env.PORT;
const server = require("./app");
require("dotenv").config();
const cron = require("node-cron");
const http = require("http");
const socketIO = require('socket.io');
const database = require("./model/index");
const {
    QueryTypes,
} = require("sequelize");


const httpServer = http.createServer(server);
const io = socketIO(httpServer);


// Store bus locations in memory
const busLocations = {}; // { busId: { lat, lng, accuracy, timestamp } }
const userTrackingLocations = {}; // { busId: { userId: { lat, lng, timestamp }, ... } }

// Socket.io connection handler
io.on('connection', async (socket) => {
    console.log("socket connected ");

    socket.on('driverConnect', (busId) => {
        console.log(`Driver connected for bus: ${busId}`);
        socket.join(`driver-${busId}`);

        // Send existing user locations to this newly connected driver
        if (userTrackingLocations[busId]) {
            console.log(`Server: Sending ${Object.keys(userTrackingLocations[busId]).length} existing user locations to new driver for busId: ${busId}`);
            for (const userId in userTrackingLocations[busId]) {
                socket.emit('userLocationUpdate', { userId, location: userTrackingLocations[busId][userId] });
            }
        }
    });

    // User sends location updates
    socket.on('userLocationUpdate', (data) => {
        const { busId, location } = data;
        console.log(`Server: Received userLocationUpdate from user ${socket.id} for busId: ${busId}, location:`, location);
        if (busId && location) {
            if (!userTrackingLocations[busId]) {
                userTrackingLocations[busId] = {};
            }
            userTrackingLocations[busId][socket.id] = { ...location, timestamp: Date.now() };
            // Broadcast to the driver of this bus
            io.to(`driver-${busId}`).emit('userLocationUpdate', { userId: socket.id, location });
            console.log(`Server: Emitted userLocationUpdate to driver for busId: ${busId}, userId: ${socket.id}`);
        }
    });

    // Conductor/Driver sends location updates
    socket.on('locationUpdate', (data) => {
        const { location, busId } = data;
        console.log(`Server: Received locationUpdate from driver for busId: ${busId}, location:`, location);
        if (busId && location) {
            busLocations[busId] = { ...location, timestamp: Date.now() };
            console.log(`Server: Bus ${busId} location updated to:`, busLocations[busId]);

            // Broadcast to users tracking this bus
            io.to(`bus-${busId}`).emit('busLocationUpdate', { busId, location });
            console.log(`Server: Emitted busLocationUpdate for busId: ${busId} to room bus-${busId}`);
        }
    });

    // User requests to track a specific bus
    socket.on('trackBus', (busId) => {
        console.log(`Server: Received trackBus from user ${socket.id} for bus: ${busId}`);
        socket.join(`bus-${busId}`); // Join a room specific to the bus

        // Send current bus location if available
        if (busLocations[busId]) {
            socket.emit('busLocationUpdate', { busId, location: busLocations[busId] });
            console.log(`Server: Sent current bus location to user ${socket.id} for bus: ${busId}`);
        } else {
            console.log(`Server: Bus location not available for bus: ${busId}`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('socket disconnected');
        // Remove user from tracking locations and notify driver
        for (const busId in userTrackingLocations) {
            if (userTrackingLocations[busId][socket.id]) {
                delete userTrackingLocations[busId][socket.id];
                io.to(`driver-${busId}`).emit('userDisconnected', { userId: socket.id });
                // Clean up empty bus entries
                if (Object.keys(userTrackingLocations[busId]).length === 0) {
                    delete userTrackingLocations[busId];
                }
                break;
            }
        }
    });
});



// runs every minutes
cron.schedule('* * * * *', async () => {
    // SHOW TABLES IN bus_reservation WHERE Tables_in_bus_reservation NOT IN ('buses', 'users')
    const all_tables = await database.sequelize.query("SHOW TABLES IN bus_reservation WHERE Tables_in_bus_reservation NOT IN ('buses', 'payments', 'users', 'price' , 'ratings')", {
        type: QueryTypes.SHOWTABLES
    })

    console.log(all_tables)

    all_tables.forEach(async (el) => {
        
        const booked_seats = await database.sequelize.query(`SELECT * FROM ${el}`, {
            type: QueryTypes.SELECT,
        })

        if (booked_seats.length === 0) {
            console.log("NO DATA INTO TABLE")
        } else {
            for (const col of booked_seats) {
                const date = new Date(col.ticketExpirationDate);
                const expirationTimeStamp = date.getTime();

                const currentDate = new Date();
                const currentDateTimestamp = currentDate.getTime();

                console.log(el)
                
                const check_ticket_status = await database.sequelize.query(`SELECT id FROM ${el} WHERE ticketExpirationStatus = 0`, {
                    type: QueryTypes.SELECT
                })

                console.log(check_ticket_status)

                if (check_ticket_status.length > 0) {

                    if (currentDateTimestamp > expirationTimeStamp) {

                        for (const id in check_ticket_status) {
                            await database.sequelize.query(`UPDATE ${el} set ticketExpirationStatus = ? WHERE ${el}.id = ? & ticketExpirationStatus = ?`, {
                                type: QueryTypes.UPDATE,
                                replacements: [1, id, 0]
                            })
                        }
                    }
                }

            }
        }
    })
})



httpServer.listen(port, () => {
    console.log("server is running at port: " + port);
})