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
  upload.array("image"),
  productController.addProduct
);
router
  .route("/searchedTitle/:searchedTitle")
  .get(productController.searchProduct);
router.route("/productId/:productId").get(productController.getProduct);
router.route("/top-sales-product").get(productController.getTopSalesProducts);
router.route("/new-arrival").get(productController.getNewArrival);
router.route("/categories").get(productController.getCategories);
router
  .route("/admin")
  .get(authenticated, adminAuthenticated, productController.getAllProducts)
  .patch(
    authenticated,
    adminAuthenticated,
    upload.array("image"),
    productController.updateProduct
  );

module.exports = router;
