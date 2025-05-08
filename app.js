const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path")
var cors = require('cors')

// setting up the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// ROUTER
const userRouter = require("./route/userRoute");
const busRouter = require("./route/busRouter");
const driverRouter = require("./route/driverRouter");
const viewRouter = require("./route/viewRouter");

// JSON DATA CARRIER
app.use(express.json({
    extends: true
}));

app.use(cors())
app.use(cookieParser());




// router setup
app.use("/", viewRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/bus", busRouter)
app.use("/api/v1/driverProspective", driverRouter);

app.use("*", (req, res) => {
    res.render("not_found.pug", {
        title: "Not Found"
    });
})
    

module.exports = app;