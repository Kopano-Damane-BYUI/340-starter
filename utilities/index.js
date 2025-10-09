/* ***********************
* Utilities
*************************/

const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ***********************
 * Build the classification view HTML
 *************************/
Util.buildClassificationGrid = async function(data){
  let grid = ''; // initialize safely
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors"></a>'
      grid += '<div class="namePrice">'
      grid += '<hr >'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ***********************
 * Construct the navigation HTML
 *************************/
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ***********************
 * Build classification select list
 *************************/
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ***********************
 * Build vehicle detail HTML
 *************************/
function buildVehicleDetailHTML(vehicle) {
  if (!vehicle) return "<p>No vehicle data available.</p>";

  return `
    <h1 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
    <div class="vehicle-content">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-info">
        <h2 class="vehicle-heading">${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
        <p class="vehicle-price"><strong>Price:</strong> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price)}</p>
        <p class="vehicle-description"><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p class="vehicle-color"><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p class="vehicle-meta"><strong>Mileage:</strong> ${vehicle.inv_miles.toLocaleString()} miles</p>
        <p class="vehicle-year"><strong>Year:</strong> ${vehicle.inv_year}</p>
      </div>
    </div>
  `;
}

/* ****************************************
* Middleware to check JWT token
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, function(err, accountData) {
      if (err) {
        req.flash("notice", "Please log in.");
        res.clearCookie("jwt");
        return res.redirect("/account/login");
      }
      res.locals.accountData = accountData;
      res.locals.loggedin = 1;
      next();
    });
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Check Account Type (Employee or Admin)
 **************************************** */
Util.checkAccountType = (req, res, next) => {
  if (!res.locals.loggedin || !res.locals.accountData) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }

  const acctType = res.locals.accountData.account_type;
  if (acctType === "Employee" || acctType === "Admin") {
    return next();
  }

  req.flash("notice", "You do not have permission to access that page.");
  return res.redirect("/account/login");
};

Util.buildVehicleDetailHTML = buildVehicleDetailHTML

/* ***********************
 * Middleware for handling errors
 *************************/
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
