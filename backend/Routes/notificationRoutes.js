const express = require("express");
const router = express.Router();
const authMiddleWare = require("../middleware/authMiddleWare");
const {
  getNotifications,
  markAsReadRoute,
  markAllAsReadRoute,
  getUnreadCountRoute,
} = require("../controllers/notificationControllers");

router.get("/", authMiddleWare, getNotifications);
router.get("/unread-count", authMiddleWare, getUnreadCountRoute);
router.patch("/:id/read", authMiddleWare, markAsReadRoute);
router.patch("/read-all", authMiddleWare, markAllAsReadRoute);

module.exports = router;
