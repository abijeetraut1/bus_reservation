const express = require("express");
const router = express.Router();

const viewController = require("./../controller/viewController")

router.get("/", viewController.home);
router.get("/search", viewController.search);

module.exports = router;