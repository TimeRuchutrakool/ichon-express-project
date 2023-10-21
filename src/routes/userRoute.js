const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const authenticated = require("../middlewares/authenticated");
const adminAuthenticated = require("../middlewares/adminAuthenticated");
const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post(
  "/signupAdmin",
  authenticated,
  adminAuthenticated,
  authController.signupForAdmin
);

router.get("/me", authenticated, userController.getMe);
router.route("/edit").put(authenticated, userController.editUser);

module.exports = router;
