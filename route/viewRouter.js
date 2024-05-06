const express = require("express");
const router = express.Router();

const viewController = require("./../controller/viewController")
const adminPanel = require("./../controller/admin_panel/admin_panel")
const authController = require("./../controller/authController")
const driverController = require("./../controller/driverController")

router.use(authController.isLoggedIn);

router.get("/", viewController.home);
router.get("/search", viewController.search);
router.get("/login", viewController.login);
router.get("/register", viewController.register);
router.get("/logout", viewController.logout);
router.get("/tickets", viewController.tickets);


router.post('/create-checkout-session/:slug', viewController.checkout_session);

// admin panel 
router.use(authController.isOwnerLoggedIn);

router.get("/admin/dashboard", adminPanel.dashboard);
router.get("/admin/listed-company", adminPanel.listed_company);
router.get("/admin/all-users", adminPanel.all_users);
router.get("/admin/ticket-records", adminPanel.ticket_records);

router.get("/owner/show-all-bus", adminPanel.show_all_bus);
router.get("/owner/add-bus", adminPanel.addBus);
router.get("/owner/bookedseat", adminPanel.bookedSeat);
router.get("/owner/income", adminPanel.income);
router.get("/owner/worker-account", adminPanel.createWorkersAccount);
router.get("/owner/assistants", adminPanel.assistants);
router.get("/checkTicket/:bus/:seat", driverController.checkTicket);


module.exports = router;