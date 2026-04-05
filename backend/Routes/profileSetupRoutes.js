const express = require("express");
const router = express.Router();

const authMiddleWare = require("../middleware/authMiddleWare");
const roleMiddleWare=require("../middleware/roleMiddleWare")
const {
  registerDonor,
  registerBloodBank,
  registerHospital
} = require("../controllers/profileSetupControllers");

// Donor setup
router.post("/donor", authMiddleWare,roleMiddleWare("DNR"), registerDonor);

// Blood Bank setup
router.post("/bloodbank", authMiddleWare,roleMiddleWare("BNK"), registerBloodBank);

// Hospital setup
router.post("/hospital", authMiddleWare,roleMiddleWare("HSP"), registerHospital);

module.exports = router;