// const app = require("./app");
const port = 8000 || process.env.PORT;
const server = require("./app");
require("dotenv").config();




server.listen(port, () => {
    console.log("server is running at port: " + port);
})