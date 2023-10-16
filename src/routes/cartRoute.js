const express = require("express");
const cartController = require("../controllers/cartController");
const authenticated = require("../middlewares/authenticated");
const router = express.Router();

router
  .route("/add/:productId/:quantity")
  .patch(authenticated, cartController.addProductToCart);

router
  .route("/remove/:productId/:quantity")
  .patch(authenticated, cartController.removeProductFromCart);
router
  .route("/delete/:productId")
  .delete(authenticated, cartController.deleteProductFromCart);

router.get("/", authenticated, cartController.fetchCart);

module.exports = router;
