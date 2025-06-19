// routes/divisionRoutes.js
const express = require("express");
const router = express.Router();
const divisionController = require("../controllers/divisionController");

router.get("/", divisionController.getDivisions);
router.post("/", divisionController.addDivision);

module.exports = router;
