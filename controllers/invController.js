/* ***********************
 * Inventory Controller
 *************************/

const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***********************
 * Build management view (task 1)
 *************************/
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      messages: req.flash("success") || []
    })
  } catch (error) {
    next(error)
  }
}

/* ***********************
 * Deliver add-classification view (task 2)
 *************************/
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: null
    })
  } catch (error) {
    next(error)
  }
}

/* ***********************
 * Process add-classification (task 2)
 *************************/
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const regResult = await invModel.addClassification(classification_name)

    if (regResult && regResult.rowCount > 0) {
      req.flash("success", `Classification "${classification_name}" added.`)
      // Build new nav and render management view with success
      let nav = await utilities.getNav()
      res.render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        messages: req.flash("success") || []
      })
    } else {
      req.flash("error", "Sorry, the classification could not be added.")
      let nav = await utilities.getNav()
      res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: req.flash("error") || [],
        classification_name
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***********************
 * Deliver add-inventory view (task 3)
 *************************/
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
      inv_make: null,
      inv_model: null,
      inv_description: null,
      inv_image: null,
      inv_thumbnail: null,
      inv_price: null,
      inv_year: null,
      inv_miles: null,
      inv_color: null,
      classification_id: null
    })
  } catch (error) {
    next(error)
  }
}

/* ***********************
 * Process add-inventory (task 3)
 *************************/
invCont.addInventory = async function (req, res, next) {
  try {
    // Collect incoming data (names match DB fields per the "data trail" approach)
    let {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    } = req.body;

    // Provide default image paths if empty (optional)
    if (!inv_image || inv_image.trim() === "") {
      inv_image = "/images/no-image-available.png";
    }
    if (!inv_thumbnail || inv_thumbnail.trim() === "") {
      inv_thumbnail = "/images/no-image-available-tn.png";
    }

    // convert numeric strings to numbers
    inv_price = parseFloat(inv_price);
    inv_year = parseInt(inv_year, 10);
    inv_miles = parseInt(inv_miles, 10);

    const regResult = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    if (regResult && regResult.rowCount > 0) {
      req.flash("success", `Vehicle ${inv_make} ${inv_model} added.`)
      let nav = await utilities.getNav()
      res.render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        messages: req.flash("success") || []
      })
    } else {
      req.flash("error", "Sorry, the vehicle could not be added.")
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(classification_id)
      res.status(500).render("inventory/add-inventory", {
        title: "Add Vehicle",
        nav,
        classificationList,
        errors: req.flash("error") || [],
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***********************
 * Existing functions that you already had (classification and detail)
 * Keep these so the rest of your app works
 *************************/
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0] ? data[0].classification_name : 'Vehicles'
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

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
