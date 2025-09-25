/* ***********************
 * Inventory Routes
 *************************/

const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

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
