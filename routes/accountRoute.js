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
  (req, res) => {
    res.status(200).send('login process')
  }
);

module.exports = router;
