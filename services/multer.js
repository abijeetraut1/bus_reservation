const multer = require("multer");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.route.path === "/register-bus") {
            cb(null, "./uploads/bus");
        } else {
            cb(null, "./uploads/profile");
        }
    },
    filename: function (req, file, cb) {
        let image;
        if (req.route.path === "/register-bus") {
            image = req.body.busName.replaceAll(" ", "-") + "-" + Date.now() + ".png";
        } else {
            image = "profile" + "-" + Date.now() + ".png";
        }
        cb(null, image);
    }
})

module.exports = {
    multer,
    storage
}