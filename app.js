const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")

// ROUTER
const userRouter = require("./route/userRoute"); 

// JSON DATA CARRIER
app.use(express.json({extends: true}));
app.use(cookieParser());

// 
app.use("/api/v1/user", userRouter);

module.exports = app;