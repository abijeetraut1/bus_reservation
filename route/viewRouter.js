const express = require("express");
const router = express.Router();

const viewController = require("./../controller/viewController")
const adminPanel = require("./../controller/admin_panel/admin_panel")

router.get("/", viewController.home);
router.get("/search", viewController.search);


// admin panel 
router.get("/admin/addBus", adminPanel.addBus);
router.get("/admin/addBus", adminPanel.addBus);
router.get("/admin/bookedseat", adminPanel.bookedSeat);

module.exports = router;