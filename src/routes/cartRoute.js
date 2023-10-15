const express = require('express')
const cartController = require('../controllers/cartController')
const authenticated = require('../middlewares/authenticated')
const router = express.Router()

router.route('/add/:productId').patch(authenticated,cartController.addProductToCart)
router.route('/remove/:productId').patch(authenticated,cartController.removeProductFromCart)

module.exports = router