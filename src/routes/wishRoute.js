const express = require("express");
const authenticated = require("../middlewares/authenticated");
const wishController = require("../controllers/wishController");
const router = express.Router();

router.get("/", authenticated, wishController.getWishlist);
router.post("/add", authenticated, wishController.addWishItem);
router.delete("/remove", authenticated, wishController.removeWishItem);

module.exports = router;
