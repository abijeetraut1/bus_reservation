const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path")

// setting up the view engine
app.set('views engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "./public"), { "Content-Type": "text/javascript" }));


// ROUTER
const userRouter = require("./route/userRoute");
const busRouter = require("./route/busRouter");
const driverRouter = require("./route/driverRouter");

// JSON DATA CARRIER
app.use(express.json({
    extends: true
}));
app.use(cookieParser());


// router setup
app.use("/api/v1/user", userRouter);
app.use("/api/v1/bus", busRouter)
app.use("/api/v1/driverProspective", driverRouter);

module.exports = app;