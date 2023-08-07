const express = require("express");
const router = express.Router();

const authController = require("./../controller/authController");
const driveController = require("./../controller/driverController") 

router.patch("/checkTicket", authController.isLoggedIn, driveController.checkTicket)


module.exports = router;