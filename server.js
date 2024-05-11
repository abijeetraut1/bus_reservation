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