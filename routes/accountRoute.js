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

// Account management view (default) - requires login
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount));

// Deliver account update view (requires login)
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
);

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

// Process account info update
router.post(
  "/update-info",
  utilities.checkLogin,
  regValidate.updateInfoRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// Process password update
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updatePassword)
);

// Logout route
router.get("/logout", utilities.handleErrors(accountController.logoutAccount));

module.exports = router;