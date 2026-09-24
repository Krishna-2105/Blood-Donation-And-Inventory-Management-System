const {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../models/notificationModels");

const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;

    const notifications = await getNotificationsByUser(user_id, limit, offset);
    const unreadCount = await getUnreadCount(user_id);

    return res.json({
      success: true,
      data: notifications,
      unread_count: unreadCount,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const markAsReadRoute = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    const ok = await markAsRead(id, user_id);
    if (!ok) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const markAllAsReadRoute = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const count = await markAllAsRead(user_id);

    return res.json({ success: true, message: "All notifications marked as read", count });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUnreadCountRoute = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const count = await getUnreadCount(user_id);

    return res.json({ success: true, unread_count: count });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  markAsReadRoute,
  markAllAsReadRoute,
  getUnreadCountRoute,
};
