const express = require("express");
const router = express.Router();
const authMiddleWare = require("../middleware/authMiddleWare");
const roleMiddleware = require("../middleware/roleMiddleWare");
const {
  getAdminDashboard,
  getAdminUsers,
  getAdminDonations,
  getAdminRequests,
  getAdminStock,
  getAdminIssued,
} = require("../controllers/adminControllers");

router.get("/dashboard", authMiddleWare, roleMiddleware("ADM"), getAdminDashboard);
router.get("/users", authMiddleWare, roleMiddleware("ADM"), getAdminUsers);
router.post("/users", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").createAdminUser);
router.get("/users/:id", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").getAdminUserById);
router.put("/users/:id", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").updateAdminUser);
router.patch("/users/:id/status", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").patchAdminUserStatus);
router.delete("/users/:id", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").deleteAdminUser);
router.get("/donations", authMiddleWare, roleMiddleware("ADM"), getAdminDonations);
router.get("/requests", authMiddleWare, roleMiddleware("ADM"), getAdminRequests);
router.get("/requests/:id", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").getAdminRequestById);
router.patch("/requests/:id/approve", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").approveAdminRequest);
router.patch("/requests/:id/reject", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").rejectAdminRequest);
router.patch("/requests/:id/reassign", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").reassignAdminRequest);
router.get("/stock", authMiddleWare, roleMiddleware("ADM"), getAdminStock);
router.get("/issued", authMiddleWare, roleMiddleware("ADM"), getAdminIssued);

// Admin blood stock management
router.get("/blood-stock", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").getAdminBloodStock);
router.get("/blood-stock/:id", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").getAdminBloodStockById);
router.put("/blood-stock/:id", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").updateAdminBloodStock);
router.patch("/blood-stock/:id/adjust", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").adjustAdminBloodStock);
router.patch("/blood-stock/:id/expire", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").expireAdminBloodStock);
router.delete("/blood-stock/:id", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").deleteAdminBloodStock);

// Audit logs
router.get("/audit-logs", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").getAdminAuditLogs);
router.get("/audit-logs/:id", authMiddleWare, roleMiddleware("ADM"), require("../controllers/adminControllers").getAdminAuditLogById);

module.exports = router;
