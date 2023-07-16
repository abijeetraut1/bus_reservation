const multer = require("multer");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        image = Date.now() + "-" + "profile" + ".png",
            cb(null, image);
    }
})

module.exports = {
    multer,
    storage
}