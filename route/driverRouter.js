const express = require("express");
const router = express.Router();

const authController = require("./../controller/authController");
const driveController = require("./../controller/driverController") 

router.get("/checkTicket", driveController.checkTicket);


module.exports = router;