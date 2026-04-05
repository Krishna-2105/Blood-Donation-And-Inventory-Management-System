const express = require("express");
const router = express.Router();

const authMiddleWare = require("../middleware/authMiddleWare");
const roleMiddleware = require("../middleware/roleMiddleWare");

const {
    searchBanksRoute,
    sendRequestRoute,
    getHospitalRequestsRoute,
    cancelRequestRoute,
    incomingRequestsRoute
} = require("../controllers/hospitalControllers");


// Dashboard (optional test route)
router.get(
    "/dashboard",
    authMiddleWare,
    roleMiddleware("HSP"),
    (req, res) => {
        res.json({
            message: "Hospital dashboard working",
            success: true
        });
    }
);


// Search Blood Banks
router.post(
    "/search-banks",
    authMiddleWare,
    roleMiddleware("HSP"),
    searchBanksRoute
);


// Send Blood Request
router.post(
    "/send-request",
    authMiddleWare,
    roleMiddleware("HSP"),
    sendRequestRoute
);


// View My Requests
router.get(
    "/my-requests",
    authMiddleWare,
    roleMiddleware("HSP"),
    getHospitalRequestsRoute
);

// Cancel Request
router.put(
    "/cancel/:request_id",
    authMiddleWare,
    roleMiddleware("HSP"),
    cancelRequestRoute
);


// Blood Bank Incoming Requests
router.get(
    "/incoming/:bank_id",
    authMiddleWare,
    roleMiddleware("BNK"),
    incomingRequestsRoute
);


module.exports = router;