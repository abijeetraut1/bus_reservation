const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")

// ROUTER
const userRouter = require("./route/userRoute"); 
const busRouter = require("./route/busRouter"); 

// JSON DATA CARRIER
app.use(express.json({extends: true}));
app.use(cookieParser());

// router setup
app.use("/api/v1/user", userRouter);
app.use("/api/v1/bus", busRouter)

module.exports = app;