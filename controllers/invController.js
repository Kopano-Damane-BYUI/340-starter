/* ***********************
 * Inventory Controller
 *************************/

const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***********************
 * Build inventory by classification view
 *************************/
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***********************
 * Build inventory detail view by invId
 *************************/
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const invId = req.params.invId; // get invId from URL
    const data = await invModel.getInventoryById(invId); // fetch vehicle

    if (!data) {
      return next({ status: 404, message: 'Vehicle not found.' });
    }

    const vehicle = data;
    const detailHTML = await utilities.buildVehicleDetailHTML(vehicle); // build HTML
    const nav = await utilities.getNav(); // get navigation

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      detailHTML,
    });
  } catch (error) {
    next(error); // pass errors to middleware
  }
};

module.exports = invCont
