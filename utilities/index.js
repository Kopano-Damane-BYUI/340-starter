/* ***********************
 * Utilities
 *************************/

const invModel = require("../models/inventory-model")
const Util = {}

/* ***********************
 * Build the classification view HTML
 *************************/
Util.buildClassificationGrid = async function(data){
  let grid
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
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
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


Util.buildVehicleDetailHTML = buildVehicleDetailHTML

/* ***********************
 * Middleware for handling errors
 *************************/
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util