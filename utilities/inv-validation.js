const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const invModel = require("../models/inventory-model");

/* ******************************
 * Classification validation rules
 * - no spaces or special characters (only letters and numbers)
 * ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification must contain only letters and numbers (no spaces or special characters)."),
  ];
};

validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const errorMessages = errors.array().map((e) => e.msg);
    res.render("inventory/add-classification", {
      errors: errorMessages,
      title: "Add Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

/* ******************************
 * Inventory validation rules
 * ***************************** */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please choose a classification."),

    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Please provide a make.")
      .isLength({ min: 2 })
      .withMessage("Make must be at least 2 characters."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Please provide a model.")
      .isLength({ min: 1 })
      .withMessage("Model must be at least 1 character."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description.")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),

    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Please provide a price.")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be a valid number."),

    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Please provide a year.")
      .isInt({ min: 1886, max: 2100 })
      .withMessage("Please provide a valid 4-digit year."),

    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Please provide mileage.")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a number."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Please provide a color."),
  ];
};

validate.checkInvData = async (req, res, next) => {
  const {
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

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    // rebuild classification select with the chosen classification selected
    let classificationList = await utilities.buildClassificationList(classification_id);
    const errorMessages = errors.array().map((e) => e.msg);

    res.render("inventory/add-inventory", {
      errors: errorMessages,
      title: "Add Vehicle",
      nav,
      classificationList,
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
    });
    return;
  }
  next();
};

module.exports = validate;