/* ***********************
 * Inventory Routes
 *************************/

const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inv-validation")

/* ***********************
 * Management view (task 1)
 *************************/
router.get("/", utilities.handleErrors(invController.buildManagement));

/* ***********************
 * Add classification routes (task 2)
 *************************/
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

/* ***********************
 * Add inventory routes (task 3)
 *************************/
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

/* ***********************
 * Route to build inventory by classification view
 *************************/
router.get("/type/:classificationId", invController.buildByClassificationId);

/* ***********************
 * Route to build a specific vehicle detail view
 *************************/
router.get("/detail/:invId", invController.buildByInventoryId);

/* ***********************
 * Route to intentionally throw a 500 error
 *************************/
router.get("/error500", (req, res, next) => {
  const err = new Error("Intentional 500 Error");
  err.status = 500;
  next(err); // Pass to error handler middleware
});

module.exports = router;
