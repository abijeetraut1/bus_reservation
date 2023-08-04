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
router.get("/:slug/:seatno/:year/:month/:day", authController.isLoggedIn, busController.reserveSeat);


module.exports = router;