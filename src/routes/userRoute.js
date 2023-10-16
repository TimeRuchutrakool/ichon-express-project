const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const authenticated = require("../middlewares/authenticated");
const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);

router.get("/me", authenticated, userController.getMe);
router
  .route("/edit")
  .patch(authenticated, userController.editUser);

module.exports = router;
