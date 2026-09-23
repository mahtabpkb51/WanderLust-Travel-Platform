const express = require("express");
const router = express.Router();
const passport = require("passport");
const WrapAsync = require("../utils/WrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

// SIGNUP
router
.route("/signup")
.get(userController.renderSignupForm)
.post(WrapAsync(userController.signup));

// LOGIN
router.route("/login")
.get(userController.renderLoginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);


// LOGOUT
router.get("/logout", userController.logout);

module.exports = router;
