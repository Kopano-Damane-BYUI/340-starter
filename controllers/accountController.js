/* ***********************
 * Account Controller
 *************************/

const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();

  // Make sure messages are always arrays
  let successMessages = req.flash("success");
  if (!Array.isArray(successMessages)) successMessages = [successMessages].flat().filter(Boolean);

  let errorMessages = req.flash("error");
  if (!Array.isArray(errorMessages)) errorMessages = [errorMessages].flat().filter(Boolean);

  res.render("account/login", {
    title: "Login",
    nav,
    messages: successMessages,
    errors: errorMessages,
    account_email: ''
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
    errors: null,
  });
}

/* ****************************************
* Deliver account management view
**************************************** */
async function buildAccount(req, res) {
  let nav = await utilities.getNav();
  res.render("account/account", {
    title: "Account Management",
    nav,
    messages: req.flash("success") || [],
    errors: req.flash("error") || [],
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
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/register", { title: "Registration", nav, errors: null });
    return;
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("success", `Congratulations, you're registered ${account_firstname}. Please log in.`);
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

/* ****************************************
*  Process Login Request
*  - Checks credentials
*  - Sets JWT cookie
**************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email });
    return;
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;

      // Create JWT
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

      // Set JWT cookie
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }

      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
 * Deliver account update view (Task 4 & 5)
 **************************************** */
async function buildUpdate(req, res) {
  try {
    const account_id = parseInt(req.params.account_id);
    let nav = await utilities.getNav();
    const account = await accountModel.getAccountById(account_id);

    if (!account) {
      req.flash("error", "Account not found.");
      return res.redirect("/account/");
    }

    res.render("account/update", {
      title: "Update Account",
      nav,
      account,
      messages: req.flash("success") || [],
      errors: req.flash("error") || []
    });
  } catch (error) {
    throw error;
  }
}

/* ****************************************
 * Process account info update (Task 5)
 **************************************** */
async function updateAccountInfo(req, res) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    const accountId = parseInt(account_id);

    const updateResult = await accountModel.updateAccountInfo(
      accountId,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      // Get updated account (including account_type)
      const updated = await accountModel.getAccountById(accountId);
      if (updated) {
        // build new token payload (do not include password)
        const payload = {
          account_id: updated.account_id,
          account_firstname: updated.account_firstname,
          account_lastname: updated.account_lastname,
          account_email: updated.account_email,
          account_type: updated.account_type
        };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

        if (process.env.NODE_ENV === 'development') {
          res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
        } else {
          res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
        }

        req.flash("success", "Account information updated.");
        return res.redirect("/account/");
      } else {
        req.flash("error", "Account updated but could not load updated data.");
        return res.redirect("/account/");
      }
    } else {
      req.flash("error", "Sorry, the update failed.");
      // reload update view with sticky data
      let nav = await utilities.getNav();
      const account = {
        account_id: accountId,
        account_firstname,
        account_lastname,
        account_email
      };
      res.status(500).render("account/update", {
        title: "Update Account",
        nav,
        account,
        messages: [],
        errors: req.flash("error") || []
      });
    }
  } catch (error) {
    throw error;
  }
}

/* ****************************************
 * Process password update (Task 5)
 **************************************** */
async function updatePassword(req, res) {
  try {
    const { account_id, account_password } = req.body;
    const accountId = parseInt(account_id);

    // Hash the new password
    const hashedPassword = await bcrypt.hashSync(account_password, 10);

    const result = await accountModel.updateAccountPassword(accountId, hashedPassword);

    if (result > 0) {
      req.flash("success", "Password updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("error", "Password update failed.");
      let nav = await utilities.getNav();
      const account = await accountModel.getAccountById(accountId);
      res.status(500).render("account/update", {
        title: "Update Account",
        nav,
        account,
        messages: [],
        errors: req.flash("error") || []
      });
    }
  } catch (error) {
    throw error;
  }
}

/* ****************************************
 * Logout - delete JWT cookie and redirect home (Task 6)
 **************************************** */
async function logoutAccount(req, res) {
  try {
    res.clearCookie("jwt");
    req.flash("success", "You have been logged out.");
    return res.redirect("/");
  } catch (error) {
    throw error;
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount,
  buildUpdate,
  updateAccountInfo,
  updatePassword,
  logoutAccount
};