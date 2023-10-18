const express = require("express");
const authenticated = require("../middlewares/authenticated");
const orderController = require("../controllers/orderController");
const upload = require("../middlewares/upload");
const adminAuthenticated = require("../middlewares/adminAuthenticated");
const router = express.Router();

router.get("/", authenticated, orderController.getOrders);
router
  .route("/create")
  .post(authenticated, upload.single("slipImage"), orderController.createOrder);

  router.route('/admin').get(authenticated,adminAuthenticated,orderController.getOrdersForAdmin)
  router.route('/admin').patch(authenticated,adminAuthenticated,orderController.updateStatusOrder)

module.exports = router;
