const express = require("express");
const router = express.Router();

const authMiddleWare = require("../middleware/authMiddleWare");
const roleMiddleware = require("../middleware/roleMiddleWare");

const {getDetails, getHistory,getLastDonation} = require("../models/donorModels");

const {donorProfileRoute,historyRoute,lastDonationRoute}=require("../controllers/donorControllers")


// Base route (optional test)
router.get(
    '/',
    authMiddleWare,
    roleMiddleware("DNR"),
    (req, res) => {
        res.json({ message: "Donor route working", success: true });
    }
);

// Profile route
router.get('/profile',authMiddleWare,roleMiddleware("DNR"),donorProfileRoute);

router.get('/history',authMiddleWare,roleMiddleware("DNR"),historyRoute);

router.get('/lastdt',authMiddleWare,roleMiddleware("DNR"),lastDonationRoute);

module.exports = router;