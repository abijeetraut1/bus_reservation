const express = require("express");
const router = express.Router();

const viewController = require("./../controller/viewController")
const adminPanel = require("./../controller/admin_panel/admin_panel")
const authController = require("./../controller/authController")
const driverController = require("./../controller/driverController")

// router.use(authController.isLoggedIn);

router.get("/", viewController.home);
router.get("/search", viewController.search);
// router.get("/login", viewController.login);
router.get("/register", viewController.register);
router.get("/logout", viewController.logout);
router.get("/tickets", viewController.tickets);


// admin panel 
// router.use(authController.isOwnerLoggedIn);

router.get("/admin/dashboard", authController.isSuperAdminLoggedIn, adminPanel.dashboard);
router.get("/admin/listed-company", authController.isSuperAdminLoggedIn, adminPanel.listed_company);
router.get("/admin/all-users", authController.isSuperAdminLoggedIn, adminPanel.all_users);
router.get("/admin/ticket-records", authController.isSuperAdminLoggedIn, adminPanel.ticket_records);

router.get("/owner/show-all-bus", authController.isOwnerLoggedIn, adminPanel.show_all_bus);
router.get("/owner/add-bus", authController.isOwnerLoggedIn, adminPanel.addBus);
router.get("/owner/records", authController.isOwnerLoggedIn, adminPanel.bookedSeat);
router.get("/owner/income", authController.isOwnerLoggedIn, adminPanel.income);
router.get("/owner/worker-account", authController.isOwnerLoggedIn, adminPanel.createWorkersAccount);
router.get("/owner/assistants", authController.isOwnerLoggedIn, adminPanel.assistants);


router.get("/checkTicket/:bus/:seat", authController.isDriverLoggedIn, driverController.checkTicket);
// router.get("/host-location", authController.isDriverLoggedIn, driverController.currentBusLocations);
// router.get("/get-location", driverController.getCurrentBusPosition);


module.exports = router;