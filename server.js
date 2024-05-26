// const app = require("./app");
const port = 8000 || process.env.PORT;
const {
    QueryTypes,
    Sequelize
} = require("sequelize");
const server = require("./app");
require("dotenv").config();
const bcrypt = require("bcrypt");
const database = require("./model/index");
const cron = require("node-cron");


// cron.schedule('0 * * * *', async () => {
// })
(async () => {
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

                if (currentDateTimestamp >= expirationTimeStamp) {
                    await database.sequelize.query(`UPDATE ${el} set ticketExpirationStatus = ? WHERE ${el}.id = ?`, {
                        type: QueryTypes.UPDATE,
                        replacements: [1, col.id]
                    })
                }
            }
        }
    })

})();




(async () => {
    const phoneNo = process.env.phoneNo;
    const name = process.env.admin_name;
    const role = process.env.role;
    const password = await bcrypt.hash(process.env.password, 12);

    const user = await database.sequelize.query("SELECT * FROM users WHERE users.role = 'super-admin'", {
        type: QueryTypes.SELECT
    });


    if (user.length == 0) {

        await database.sequelize.query(`INSERT INTO users (phoneNo, name, role, password) VALUES (?, ?, ?, ?)`, {
            type: QueryTypes.INSERT,
            replacements: [phoneNo,
                name,
                role,
                password,
            ]
        }).then(() => {
            console.log("admin seeded successfully");
        }).catch((err) => {
            console.log(err)
            console.log("admin already seeded")
        })


    }
})();



server.listen(port, () => {
    console.log("server is running at port: " + port);
})