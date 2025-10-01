/* ***********************
 * Account Controller
 *************************/

const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs"); // <-- bcryptjs required

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    messages: req.flash("success") || [], // success messages
    errors: req.flash("error") || [],     // always define errors
  });
}

/* ****************************************
* Deliver registration view
**************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null, // no errors initially
  });
}

/* ****************************************
*  Process Registration
* **************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();

  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // hashSync with saltRounds = 10
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
    return; // exit the function if hashing fails
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword // <-- use hashed password here
  );

  if (regResult) {
    req.flash("success", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    // redirect instead of render to show flash message
    res.redirect("/account/login");
  } else {
    req.flash("error", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: req.flash("error") || [],
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
};
