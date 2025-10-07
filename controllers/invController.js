/* ***********************
 * Inventory Controller
 *************************/

const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***********************
 * Build management view (task 1 + AJAX dropdown)
 *************************/
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList() // dropdown for AJAX

    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect, // new dropdown
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
      let nav = await utilities.getNav()
      let classificationSelect = await utilities.buildClassificationList()
      res.render("inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationSelect,
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

    if (!inv_image || inv_image.trim() === "") {
      inv_image = "/images/no-image-available.png";
    }
    if (!inv_thumbnail || inv_thumbnail.trim() === "") {
      inv_thumbnail = "/images/no-image-available-tn.png";
    }

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
      let classificationSelect = await utilities.buildClassificationList()
      res.render("inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationSelect,
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
 * AJAX: Return inventory by classification as JSON
 *************************/
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  try {
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
      return res.json(invData)
    } else {
      return res.json({ message: "No data found" })
    }
  } catch (error) {
    next(error)
  }
}

/* ***********************
 * Build by classification view (existing)
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

/* ***********************
 * Build vehicle detail view (existing)
 *************************/
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const invId = req.params.invId
    const data = await invModel.getInventoryById(invId)
    if (!data) {
      return next({ status: 404, message: 'Vehicle not found.' })
    }

    const vehicle = data
    const detailHTML = await utilities.buildVehicleDetailHTML(vehicle)
    const nav = await utilities.getNav()

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      detailHTML,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id); // collect inventory ID
    let nav = await utilities.getNav();        // build navigation

    // Get the inventory item data from the model
    const itemData = await invModel.getInventoryById(inv_id);

    // Build classification select list, pre-select current classification
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);

    // Make & model for the title
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    // Render the edit-inventory view
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    // Default images if empty
    const imagePath = inv_image && inv_image.trim() !== "" ? inv_image : "/images/no-image-available.png";
    const thumbnailPath = inv_thumbnail && inv_thumbnail.trim() !== "" ? inv_thumbnail : "/images/no-image-available-tn.png";

    // Call model to update inventory
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      imagePath,
      thumbnailPath,
      parseFloat(inv_price),
      parseInt(inv_year, 10),
      parseInt(inv_miles, 10),
      inv_color,
      classification_id
    );

    if (updateResult) {
      const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
      req.flash("success", `The ${itemName} was successfully updated.`);
      res.redirect("/inv/");
    } else {
      // Build classification list again
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("error", "Sorry, the update failed.");
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: req.flash("error") || [],
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont