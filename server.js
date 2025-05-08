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





io.on('connection', async (socket) => {
    const cookies = socket.handshake.headers.cookie;
    const parserUserId = cookies.split("=")[1];

    const id = jwt.verify(parserUserId, process.env.JWT_SECRET);

    const findUser = await database.sequelize.query(`SELECT users.id, users.name, users.role FROM users WHERE id = '${id.id}'`, {
        type: QueryTypes.SELECT
    })

    
    socket.on('locationUpdate', (data) => {
        const LocaationData = {
            name: findUser[0].name,
            role: findUser[0].role,
            location: data
        }
        console.log(data);

        console.log('Received location:', LocaationData);
        io.emit('broadcastLocation', LocaationData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


(async () => {
    const phoneNo = process.env.phoneNo;
    const name = process.env.admin_name;
    const role = process.env.role;
    const plainPassword = process.env.password;

    // Check if super-admin already exists using ORM
    const existingUser = await userModel.findOne({ where: { role: "super-admin" } });

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash(plainPassword, 12);

        try {
            await userModel.create({
                phoneNo,
                name,
                role,
                password: hashedPassword,
                isActive: false,
            });

            console.log("admin seeded successfully");
        } catch (err) {
            console.log("Error seeding admin:", err);
        }
    } else {
        console.log("Super-admin already exists.");
    }
})();

// runs every minutes
cron.schedule('* * * * *', async () => {
    // SHOW TABLES IN bus_reservations WHERE Tables_in_bus_reservations NOT IN ('buses', 'users')
    const all_tables = await database.sequelize.query("SHOW TABLES IN bus_reservations WHERE Tables_in_bus_reservations NOT IN ('buses', 'users')", {
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