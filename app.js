const express = require("express");
const app = express();

// ROUTER
const userRouter = require("./route/userRoute"); 

// JSON DATA CARRIER
app.use(express.json({extends: true}));

// 
app.use("/api/v1/user", userRouter);

module.exports = app;