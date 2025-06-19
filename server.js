// const app = require("./app");
const port = 8000 || process.env.PORT;
const server = require("./app");
require("dotenv").config();
const bcrypt = require("bcrypt");
const cron = require("node-cron");
const http = require("http");
const socketIO = require('socket.io');
const database = require("./model/index");
const userModel = database.users;
const {
    Sequelize,
    QueryTypes,
    where
} = require("sequelize");
const jwt = require("jsonwebtoken");


const httpServer = http.createServer(server);
const io = socketIO(httpServer);





// Store active connections
const activeConnections = new Map();

// Socket.io connection handler
io.on('connection', async (socket) => {
    try {
        // 1. Authentication
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
            console.log('No cookies found - disconnecting');
            return socket.disconnect(true);
        }

        // Parse JWT token from cookies
        const token = cookies.split(';').find(c => c.trim().startsWith('jwt='));
        if (!token) {
            console.log('No JWT token found - disconnecting');
            return socket.disconnect(true);
        }

        const jwtToken = token.split('=')[1];
        if (!jwtToken) {
            console.log('Invalid JWT format - disconnecting');
            return socket.disconnect(true);
        }

        // Verify JWT
        let decoded;
        try {
            decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
        } catch (err) {
            console.log('JWT verification failed:', err.message);
            return socket.disconnect(true);
        }

        // Fetch user from database
        const findUser = await database.sequelize.query(
            `SELECT id, name, role FROM users WHERE id = ?`,
            {
                replacements: [decoded.id],
                type: QueryTypes.SELECT
            }
        );

        if (!findUser.length) {
            console.log('User not found in database - disconnecting');
            return socket.disconnect(true);
        }

        const user = findUser[0];
        console.log(`User connected: ${user.name} (${user.role})`);

        // Store connection
        activeConnections.set(user.id, {
            socket,
            user,
            location: null
        });

        // Join role-specific rooms
        socket.join(user.role);
        if (['driver', 'conductor'].includes(user.role)) {
            socket.join('transport-staff');
        }

        // 2. Send existing transport locations to new users
        if (user.role === 'user') {
            const transportLocations = [];
            activeConnections.forEach(conn => {
                if (['driver', 'conductor'].includes(conn.user.role) && conn.location) {
                    transportLocations.push({
                        userId: conn.user.id,
                        name: conn.user.name,
                        role: conn.user.role,
                        location: conn.location
                    });
                }
            });
            if (transportLocations.length > 0) {
                socket.emit('initialTransportLocations', transportLocations);
            }
        }

        // 3. Location Update Handler
        socket.on('locationUpdate', (data) => {
            if (!data?.location?.lat || !data?.location?.lng) {
                return console.error('Invalid location data received');
            }

            // Update stored location
            const conn = activeConnections.get(user.id);
            if (conn) {
                conn.location = {
                    ...data.location,
                    timestamp: new Date()
                };
            }

            const locationData = {
                userId: user.id,
                name: user.name,
                role: user.role,
                location: data.location
            };

            // Different broadcast strategies based on role
            if (user.role === 'user') {
                // Users broadcast to all transport staff
                socket.to('transport-staff').emit('userLocationUpdate', locationData);
            } else if (['driver', 'conductor'].includes(user.role)) {
                // Transport broadcasts to all users and other transport staff
                io.emit('transportLocationUpdate', locationData);
                socket.to('transport-staff').emit('transportLocationUpdate', locationData);
            }
        });

        // 4. Route Request Handler
        socket.on('requestRoute', ({ userId }) => {
            if (user.role !== 'user') return;

            const transportConn = activeConnections.get(userId);
            if (!transportConn?.location) return;

            const userLocation = activeConnections.get(user.id)?.location;
            if (!userLocation) return;

            // Calculate route (in a real app, you might use a routing service here)
            socket.emit('routeData', {
                from: userLocation,
                to: transportConn.location,
                transportId: userId,
                distance: calculateDistance(
                    userLocation.lat, userLocation.lng,
                    transportConn.location.lat, transportConn.location.lng
                ),
                duration: calculateDuration(
                    userLocation.lat, userLocation.lng,
                    transportConn.location.lat, transportConn.location.lng
                )
            });
        });

        // 5. Disconnection Handler
        socket.on('disconnect', () => {
            activeConnections.delete(user.id);
            console.log(`User disconnected: ${user.name} (${user.role})`);

            if (['driver', 'conductor'].includes(user.role)) {
                socket.broadcast.emit('transportDisconnected', { userId: user.id });
            }
        });

    } catch (error) {
        console.error('Socket connection error:', error);
        socket.disconnect(true);
    }
});

// Helper functions for route calculation (simplified)
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // Distance in km
}

function calculateDuration(lat1, lon1, lat2, lon2) {
    // Simple estimation (1 minute per km)
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return Math.round(distance * 1.5); // Minutes
}



// runs every minutes
cron.schedule('* * * * *', async () => {
    // SHOW TABLES IN bus_reservation WHERE Tables_in_bus_reservation NOT IN ('buses', 'users')
    const all_tables = await database.sequelize.query("SHOW TABLES IN bus_reservation WHERE Tables_in_bus_reservation NOT IN ('buses', 'users')", {
        type: QueryTypes.SHOWTABLES
    })

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

                const check_ticket_status = await database.sequelize.query(`SELECT id FROM ${el} WHERE ticketExpirationStatus = 0`, {
                    type: QueryTypes.SELECT
                })

                console.log(check_ticket_status)

                if (check_ticket_status.length > 0) {

                    if (currentDateTimestamp >= expirationTimeStamp) {

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