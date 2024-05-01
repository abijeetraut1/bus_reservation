const express = require("express");
const router = express.Router();

const viewController = require("./../controller/viewController")
const adminPanel = require("./../controller/admin_panel/admin_panel")

router.get("/", viewController.home);
router.get("/search", viewController.search);


// admin panel 
router.get("/admin/dashboard", adminPanel.addBus);
router.get("/admin/addBus", adminPanel.addBus);
router.get("/admin/bookedseat", adminPanel.bookedSeat);
router.get("/admin/income", adminPanel.income);
router.get("/admin/worker-account", adminPanel.createWorkersAccount);

module.exports = router;