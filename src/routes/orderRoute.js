const express = require("express");
const authenticated = require("../middlewares/authenticated");
const orderController = require("../controllers/orderController");
const upload = require("../middlewares/upload");
const router = express.Router();

router
  .route("/create")
  .post(authenticated, upload.single("slipImage"), orderController.createOrder);

module.exports = router;
