const express = require("express");
const seedController = require('../controllers/seedController')
const router = express.Router();

router.route("/products").get(seedController.products);
router.route("/categories").get(seedController.categories);
router.route("/brands").get(seedController.brands);
router.route("/users").get(seedController.users);


module.exports = router;
