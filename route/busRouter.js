const express = require("express");
const router = express.Router();
const busController = require("../controller/busController");
const authController = require("../controller/authController");
const busReviewAndRatings = require("../controller/busReviewAndRatings");

const {
    multer,
    storage
} = require("../services/multer");

const upload = multer({
    storage
});

router.use(authController.isLoggedIn);

router.post("/register-bus", /*authController.isLoggedIn,*/ upload.array("busImage"), busController.registerBus);
router.post("/setdate", busController.setTravellingDate);
router.post("/:slug/reserve-seat", authController.isLoggedIn, authController.Authenticate_to_only_logged_user, busController.reserveSeat);
router.post("/:slug/rate-bus", authController.isLoggedIn, busReviewAndRatings.rateBus);
router.get("/get-one-bus/:id", busController.getOneBus);
router.post("/update-bus/:id", upload.array("busImage"), busController.updateBus);
router.delete("/delete-bus/:id", upload.array("busImage"), busController.deleteBus);

// router.get("/search/:fromLocation/:toLocation/:date", busController.searchBus);
router.get("/:slug/allReservedSeats", authController.isLoggedIn, busController.allReservedSeat);
router.get("/showAllTicket", authController.isLoggedIn, busController.showAllTicket);

// router.get("/showTicket/:date", authController.isLoggedIn, busController.showTicket);

// user page controlls route
router.get("/:slug/accessCurrentBusLocation", busController.currentBusLocations);
router.get("/:slug/hostCurrentBusLocation", busController.currentBusLocations);

module.exports = router;