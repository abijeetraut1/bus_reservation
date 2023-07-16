const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

const {multer, storage} = require("../services/multer");

const upload = multer({
    storage: storage
})

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/profile-picture", authController.isLoggedIn, upload.single("profile"), authController.uploadProfilePicture)

router.patch("/update-password", authController.isLoggedIn, authController.updatePassword);
router.post("/useraccount/verify", authController.isLoggedIn, authController.numberVerification);

module.exports = router;