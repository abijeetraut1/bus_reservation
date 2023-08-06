const express = require("express");
const router = express.Router();
const busController = require("../controller/busController");
const authController = require("../controller/authController");
const {multer, storage} = require("../services/multer");

const upload = multer({
    storage
});

router.post("/register-bus", authController.isLoggedIn, upload.array("busImage"), busController.registerBus);
router.get("/search", busController.searchBus);
router.post("/:slug/reserve-seat", authController.isLoggedIn, busController.reserveSeat);
router.get("/getReservedDetails", authController.isLoggedIn, busController.allReservedSeat);

module.exports = router;