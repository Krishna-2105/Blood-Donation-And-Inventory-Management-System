const express = require("express");
const router = express.Router();

const authMiddleWare = require("../middleware/authMiddleWare");

const {
  registerDonor,
  registerBloodBank,
  registerHospital
} = require("../controllers/profileSetupControllers");

// Donor setup
router.post("/donor", authMiddleWare, registerDonor);

// Blood Bank setup
router.post("/bloodbank", authMiddleWare, registerBloodBank);

// Hospital setup
router.post("/hospital", authMiddleWare, registerHospital);

module.exports = router;