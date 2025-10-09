/* ***********************
 * Account Model
 *************************/

const pool = require("../database");

/* Register new account */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result.rows[0]; // safe return
  } catch (error) {
    console.error("registerAccount error: ", error);
    return false;
  }
}

/* Check existing email */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    console.error("checkExistingEmail error: ", error);
    return error.message;
  }
}

/* Get account by email for login */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountByEmail error: ", error);
    return new Error("No matching email found");
  }
}

/* Get account by id */
async function getAccountById(account_id) {
  try {
    const sql = 'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1';
    const result = await pool.query(sql, [account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error: ", error);
    return null;
  }
}

/* Update account info */
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `UPDATE account
                 SET account_firstname = $1,
                     account_lastname = $2,
                     account_email = $3
                 WHERE account_id = $4
                 RETURNING account_id, account_firstname, account_lastname, account_email, account_type`;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("updateAccountInfo error: ", error);
    return null;
  }
}

/* Update account password */
async function updateAccountPassword(account_id, hashedPassword) {
  try {
    const sql = `UPDATE account
                 SET account_password = $1
                 WHERE account_id = $2`;
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rowCount;
  } catch (error) {
    console.error("updateAccountPassword error: ", error);
    return 0;
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updateAccountPassword
};
