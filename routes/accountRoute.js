/* ***********************
 * Account Routes
 *************************/
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Deliver registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Account management view (default)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(), // apply validation rules
  regValidate.checkRegData,        // run the checks
  utilities.handleErrors(accountController.registerAccount) // proceed if no errors
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),      // apply login validation rules
  regValidate.checkLoginData,    // run login checks
  utilities.handleErrors(accountController.accountLogin) // handle login
);

module.exports = router;