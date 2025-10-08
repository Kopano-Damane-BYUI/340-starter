const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/* **********************************
 * Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // First name: required
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    // Last name: required
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    // Email: required, must be valid and unique
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),

    // Password: required, strong
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password does not meet requirements.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();

    // Map to only the message strings
    const errorMessages = errors.array().map(e => e.msg);

    res.render("account/register", {
      errors: errorMessages, // now only strings
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next(); // no errors, proceed to controller
};

/* **********************************
 * Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const errorMessages = errors.array().map(e => e.msg);

    res.render("account/login", {
      errors: errorMessages,
      title: "Login",
      nav,
      account_email, // sticky email
    });
    return;
  }
  next();
};

/* **********************************
 * Update Account Info Validation Rules
 * ********************************* */
validate.updateInfoRules = () => {
  return [
    // First name required
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    // Last name required
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    // Email required and unique (if changed)
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const existing = await accountModel.getAccountByEmail(account_email);
        if (existing && existing.account_id !== parseInt(req.body.account_id)) {
          throw new Error("Email exists. Please use a different email.");
        }
      }),
  ];
};

/* **********************************
 * Update Password Validation Rules
 * ********************************* */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password does not meet requirements.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
    body("account_id")
      .trim()
      .notEmpty()
      .withMessage("Account id is required.")
  ];
};

/* ******************************
 * Check update data and return errors or continue
 * Used for both info update and password update.
 * Renders account/update if validation fails with sticky values.
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  let errors = validationResult(req);
  const accountId = req.body.account_id || req.params.account_id;
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const errorMessages = errors.array().map(e => e.msg);

    // Try to get account from DB to fill missing fields, then overwrite with incoming form values (sticky)
    let accountFromDb = null;
    if (accountId) {
      accountFromDb = await accountModel.getAccountById(parseInt(accountId));
    }

    const account = {
      account_id: accountFromDb ? accountFromDb.account_id : accountId,
      account_firstname: req.body.account_firstname || (accountFromDb ? accountFromDb.account_firstname : ""),
      account_lastname: req.body.account_lastname || (accountFromDb ? accountFromDb.account_lastname : ""),
      account_email: req.body.account_email || (accountFromDb ? accountFromDb.account_email : "")
    };

    res.render("account/update", {
      title: "Update Account",
      nav,
      account,
      messages: req.flash("success") || [],
      errors: errorMessages
    });
    return;
  }
  next();
};

module.exports = validate;