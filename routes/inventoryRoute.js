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
router.get("/", utilities.handleErrors(invController.buildManagement))

/* ***********************
 * Add classification routes (task 2) - ADMIN ONLY
 *************************/
router.get("/add-classification",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification))

router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

/* ***********************
 * Add inventory routes (task 3) - ADMIN ONLY
 *************************/
router.get("/add-inventory",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory))

router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
)

/* ***********************
 * Route to build inventory by classification view
 * (public - NO auth required)
 *************************/
router.get("/type/:classificationId", invController.buildByClassificationId)

/* ***********************
 * Route to build a specific vehicle detail view
 * (public - NO auth required)
 *************************/
router.get("/detail/:invId", invController.buildByInventoryId)

/* ***********************
 * Route to intentionally throw a 500 error
 *************************/
router.get("/error500", (req, res, next) => {
  const err = new Error("Intentional 500 Error")
  err.status = 500
  next(err)
})

/* ***********************
 * Return Inventory by Classification ID as JSON (AJAX)
 *************************/
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

/* ***********************
 * Build edit inventory view (Step 1 of updating inventory) - ADMIN ONLY
 *************************/
router.get(
  "/edit/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.editInventoryView)
)

/* ***********************
 * Update inventory (Step 2) - ADMIN ONLY
 *************************/
router.post(
  "/update",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.updateInventory)
)

/* ***********************
 * Build delete confirmation view - ADMIN ONLY
 *************************/
router.get(
  "/delete/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteView)
)

/* ***********************
 * Delete inventory item (final delete step) - ADMIN ONLY
 *************************/
router.post(
  "/delete",
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventoryItem)
)

module.exports = router