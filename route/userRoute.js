const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const userController = require("../controller/userController");

const {multer, storage} = require("../services/multer");

const upload = multer({
    storage: storage
})

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.patch("/change-number", authController.isLoggedIn, authController.changeNumber)
router.post("/profile-picture", authController.isLoggedIn, upload.single("profile"), authController.uploadProfilePicture)

router.post("/password-forget-code", authController.isLoggedIn, authController.generate_password_forget_code);
// router.post("/change-password", authController.isLoggedIn, authController.change_password);

router.patch("/update-password", authController.isLoggedIn, authController.updatePassword);
router.post("/useraccount/verify", authController.isLoggedIn, authController.numberVerification);



module.exports = router;