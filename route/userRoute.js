const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const userController = require("../controller/userController");

const {
    multer,
    storage
} = require("../services/multer");

const upload = multer({
    storage: storage
})


router.use(authController.isLoggedIn);

router.post("/signup", authController.signup);
// router.post("/login", authController.login);
router.delete("/delete-user/:id", authController.delete_user);

router.patch("/change-number", authController.changeNumber)
router.post("/profile-picture", upload.single("profile"), authController.uploadProfilePicture)

router.post("/password-forget-code", authController.generate_password_forget_code);
// router.post("/change-password",  authController.change_password);

router.patch("/update-password", authController.updatePassword);
router.post("/useraccount/verify", authController.numberVerification);



module.exports = router;