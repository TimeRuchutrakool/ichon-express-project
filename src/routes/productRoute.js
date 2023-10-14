const express = require("express");
const productController = require("../controllers/productController");
const authenticated = require("../middlewares/authenticated");
const adminAuthenticated = require("../middlewares/adminAuthenticated");
const upload = require("../middlewares/upload");
const router = express.Router();

router.post(
  "/",
  authenticated,
  adminAuthenticated,
  upload.array('image'),
  productController.addProduct,
  
);
router.route('/:searchedTitle')
router.route("/top-sales-product").get(productController.getTopSalesProducts);

module.exports = router;
