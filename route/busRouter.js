const express = require("express");
const router = express.Router();
const busController = require("../controller/busController");

router.post("/register-bus", busController.registerBus);

module.exports = router;