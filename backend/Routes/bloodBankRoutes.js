const express = require("express");
const router = express.Router();

const authMiddleWare = require("../middleware/authMiddleWare");
const roleMiddleware = require("../middleware/roleMiddleWare");

const { addDonationRoute } = require("../controllers/bloodBankControllers");

router.post(
  "/add-donation",
  authMiddleWare,
  roleMiddleware("BNK"),
  addDonationRoute
);

module.exports = router;