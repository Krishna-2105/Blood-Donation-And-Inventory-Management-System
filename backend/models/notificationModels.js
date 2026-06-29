const db = require("../config/db");

const createNotification = async ({ user_id, title, message, type }) => {
  const [result] = await db.promise().query(
    `INSERT INTO Notification (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
    [user_id, title, message, type]
  );
  return result.insertId;
};

const createNotificationWithConn = async (conn, { user_id, title, message, type }) => {
  const [result] = await conn.query(
    `INSERT INTO Notification (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
    [user_id, title, message, type]
  );
  return result.insertId;
};

const getNotificationsByUser = async (user_id, limit = 50, offset = 0) => {
  const [rows] = await db.promise().query(
    `SELECT * FROM Notification WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [user_id, limit, offset]
  );
  return rows;
};

const getUnreadCount = async (user_id) => {
  const [[row]] = await db.promise().query(
    `SELECT COUNT(*) AS count FROM Notification WHERE user_id = ? AND is_read = FALSE`,
    [user_id]
  );
  return row.count;
};

const markAsRead = async (notification_id, user_id) => {
  const [result] = await db.promise().query(
    `UPDATE Notification SET is_read = TRUE WHERE notification_id = ? AND user_id = ?`,
    [notification_id, user_id]
  );
  return result.affectedRows > 0;
};

const markAllAsRead = async (user_id) => {
  const [result] = await db.promise().query(
    `UPDATE Notification SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
    [user_id]
  );
  return result.affectedRows;
};

module.exports = {
  createNotification,
  createNotificationWithConn,
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
