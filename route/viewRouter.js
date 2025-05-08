const express = require("express");
const router = express.Router();

const viewController = require("./../controller/viewController")
const adminPanel = require("./../controller/admin_panel/admin_panel")
const authController = require("./../controller/authController")
const driverController = require("./../controller/driverController")
const catchAsync = require("./../utils/catchAsync")

router.use(authController.isLoggedIn);

router.get("/", catchAsync(viewController.home));
router.get("/search", catchAsync(viewController.search));
router.get("/login", viewController.login);
router.get("/register", viewController.register);
router.get("/signup-as-company", viewController.signup_as_company);
router.get("/logout", catchAsync(viewController.logout));
router.get("/tickets", viewController.tickets);
router.get("/track", viewController.track);


// admin panel 
// router.use(authController.isOwnerLoggedIn);

router.get("/admin/dashboard", authController.isSuperAdminLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.dashboard);
router.get("/admin/listed-company", authController.isSuperAdminLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.listed_company);
router.get("/admin/all-users", authController.isSuperAdminLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.all_users);
router.get("/admin/ticket-records", authController.isSuperAdminLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.ticket_records);
router.get("/admin/upload-ads", adminPanel.upload_ads);

router.get("/owner/dashboard", authController.isOwnerLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.companydashboard);
router.get("/owner/show-all-bus", authController.isOwnerLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.show_all_bus);
router.get("/owner/add-bus", authController.isOwnerLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.addBus);
router.get("/owner/records", authController.isOwnerLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.bookedSeat);
router.get("/owner/income", authController.isOwnerLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.income);
router.get("/owner/worker-account", authController.isOwnerLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.createWorkersAccount);
router.get("/owner/assistants", authController.isOwnerLoggedIn, authController.Authenticate_to_only_logged_user, adminPanel.assistants);


router.get("/check-tickets", authController.isDriverLoggedIn, driverController.checkTicketPage);
router.get("/checkTicket/:bus/:seat", authController.isDriverLoggedIn, driverController.checkTicket);
// router.get("/host-location", driverController.host_location);
// router.get("/get-location", driverController.getCurrentBusPosition);


module.exports = router;