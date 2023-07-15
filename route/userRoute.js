const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.patch("/update-password", authController.isLoggedIn, authController.updateShowableData);
router.post("/userdata/verify", authController.isLoggedIn, authController.numberVerification);
module.exports = router;