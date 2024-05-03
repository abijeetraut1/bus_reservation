const express = require("express");
const router = express.Router();

const viewController = require("./../controller/viewController")
const adminPanel = require("./../controller/admin_panel/admin_panel")
const authController = require("./../controller/authController")

router.use(authController.isLoggedIn);

router.get("/", viewController.home);
router.get("/search", viewController.search);
router.get("/login", viewController.login);
router.get("/register", viewController.register);
router.get("/logout", viewController.logout);


router.post('/create-checkout-session/:slug', viewController.checkout_session);

// admin panel 
router.use(authController.isOwnerLoggedIn);

router.get("/admin/dashboard", adminPanel.addBus);
router.get("/admin/show-all-bus", adminPanel.show_all_bus);
router.get("/admin/add-bus", adminPanel.addBus);
router.get("/admin/bookedseat", adminPanel.bookedSeat);
router.get("/admin/income", adminPanel.income);
router.get("/admin/worker-account", adminPanel.createWorkersAccount);
router.get("/admin/update-bus", adminPanel.update_bus);

module.exports = router;