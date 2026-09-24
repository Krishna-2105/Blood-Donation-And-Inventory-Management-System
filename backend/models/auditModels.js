const db = require("../config/db");

// Ensure table exists and insert audit record
const ensureTable = async () => {
  const sql = `
  CREATE TABLE IF NOT EXISTS audit_logs (
    audit_log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(128),
    previous_values TEXT,
    new_values TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;
  await db.promise().query(sql);
};

const createAuditLog = async ({ admin_user_id, action_type, entity_type, entity_id, previous_values, new_values }) => {
  await ensureTable();
  const sql = `INSERT INTO audit_logs (admin_user_id, action_type, entity_type, entity_id, previous_values, new_values) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [admin_user_id, action_type, entity_type, entity_id || null, previous_values ? JSON.stringify(previous_values) : null, new_values ? JSON.stringify(new_values) : null];
  const [result] = await db.promise().query(sql, params);
  return result.insertId;
};

const getAuditLogs = async ({ page = 1, limit = 20, action_type, entity_type, admin_user_id, search }) => {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];
  if (action_type) { where.push("action_type = ?"); params.push(action_type); }
  if (entity_type) { where.push("entity_type = ?"); params.push(entity_type); }
  if (admin_user_id) { where.push("admin_user_id = ?"); params.push(admin_user_id); }
  if (search) { where.push("(action_type LIKE ? OR entity_type LIKE ? OR entity_id LIKE ? OR previous_values LIKE ? OR new_values LIKE ?)"); const s = `%${search}%`; params.push(s, s, s, s, s); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `SELECT audit_log_id, admin_user_id, action_type, entity_type, entity_id, created_at FROM audit_logs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  const [rows] = await db.promise().query(sql, params);
  return rows;
};

const getAuditLogById = async (id) => {
  const [rows] = await db.promise().query(`SELECT * FROM audit_logs WHERE audit_log_id = ? LIMIT 1`, [id]);
  if (!rows.length) return null;
  const row = rows[0];
  try { row.previous_values = row.previous_values ? JSON.parse(row.previous_values) : null; } catch (e) { /* ignore */ }
  try { row.new_values = row.new_values ? JSON.parse(row.new_values) : null; } catch (e) { /* ignore */ }
  return row;
};

module.exports = { createAuditLog, getAuditLogs, getAuditLogById };
