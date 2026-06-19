const db = require("../config/db");
const {
  getUsers,
  getUserById,
  updateUserById,
  setUserStatus,
  deleteUserById,
} = require("../models/userModels");
const { createAuditLog, getAuditLogs, getAuditLogById } = require("../models/auditModels");

const getAdminDashboard = async (req, res) => {
  try {
    const [[users]] = await db.promise().query(
      `SELECT COUNT(*) AS users_count FROM \`User\``
    );
    const [[donors]] = await db.promise().query(
      `SELECT COUNT(*) AS donors_count FROM Donor`
    );
    const [[hospitals]] = await db.promise().query(
      `SELECT COUNT(*) AS hospitals_count FROM Hospital`
    );
    const [[banks]] = await db.promise().query(
      `SELECT COUNT(*) AS banks_count FROM Blood_Bank`
    );
    const [[donations]] = await db.promise().query(
      `SELECT COUNT(*) AS donations_count FROM Donation`
    );
    const [[requests]] = await db.promise().query(
      `SELECT COUNT(*) AS requests_count FROM Blood_Request_from_hospital`
    );

    return res.json({
      success: true,
      data: {
        users: users.users_count || 0,
        donors: donors.donors_count || 0,
        hospitals: hospitals.hospitals_count || 0,
        banks: banks.banks_count || 0,
        donations: donations.donations_count || 0,
        requests: requests.requests_count || 0,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/users?role=&page=&limit=
const getAdminUsers = async (req, res) => {
  try {
    const role = typeof req.query.role === "string" ? req.query.role.trim() : "";
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const users = await getUsers({ role, limit, offset });
    return res.json({ success: true, data: users, meta: { page, limit } });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/admin/users  (create admin user)
const createAdminUser = async (req, res) => {
  try {
    const { name, email, phone_no, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing required fields' });
    // reuse model createUser
    const { createUser } = require('../models/userModels');
    // ensure admin role
    const created = await createUser({ name, email, phone_no, password, user_type: 'admin' });
    if (!created || !created.user_id) return res.status(500).json({ success: false, message: 'Failed to create admin' });
    // audit
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'user_create', entity_type: 'user', entity_id: created.user_id, previous_values: null, new_values: { name, email, phone_no, user_type: 'admin' } }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.status(201).json({ success: true, message: 'Admin user created', data: { user_id: created.user_id } });
  } catch (err) {
    console.log(err);
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Email already exists' });
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/users/:id
const getAdminUserById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing user id" });
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/admin/users/:id
const updateAdminUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phone_no, user_type } = req.body || {};
    if (!id) return res.status(400).json({ success: false, message: "Missing user id" });
    if (!name && !email && !phone_no && !user_type) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    const before = await getUserById(id);
    const updated = await updateUserById(id, { name, email, phone_no, user_type });
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    // audit
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'user_update', entity_type: 'user', entity_id: id, previous_values: before, new_values: { name, email, phone_no, user_type } }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.log(err);
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/users/:id/status
const patchAdminUserStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { is_active } = req.body || {};
    if (!id) return res.status(400).json({ success: false, message: "Missing user id" });
    if (typeof is_active !== "boolean") return res.status(400).json({ success: false, message: "is_active must be boolean" });

    const before = await getUserById(id);
    const ok = await setUserStatus(id, is_active);
    if (!ok) return res.status(404).json({ success: false, message: "User not found" });
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: is_active ? 'user_enable' : 'user_disable', entity_type: 'user', entity_id: id, previous_values: { is_active: before.is_active }, new_values: { is_active } }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ success: true, message: "User status updated" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/users/:id
const deleteAdminUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing user id" });
    const before = await getUserById(id);
    const ok = await deleteUserById(id);
    if (!ok) return res.status(404).json({ success: false, message: "User not found" });
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'user_delete', entity_type: 'user', entity_id: id, previous_values: before, new_values: null }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Audit logs endpoints
const getAdminAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const { action_type, entity_type, admin_user_id, search } = req.query || {};
    const rows = await getAuditLogs({ page, limit, action_type, entity_type, admin_user_id, search });
    return res.json({ success: true, data: rows, meta: { page, limit } });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAdminAuditLogById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing id" });
    const row = await getAuditLogById(id);
    if (!row) return res.status(404).json({ success: false, message: "Audit log not found" });
    return res.json({ success: true, data: row });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAdminDonations = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
        d.donation_id,
        d.donor_id,
        du.name AS donor_name,
        d.units_donated AS units,
        d.donation_date AS date,
        d.bank_id,
        bu.name AS bank_name
       FROM Donation d
       JOIN \`User\` du ON d.donor_id = du.user_id
       JOIN \`User\` bu ON d.bank_id = bu.user_id
       ORDER BY d.donation_date DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAdminRequests = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
        r.request_id,
        r.hospital_id,
        hu.name AS hospital_name,
        r.blood_grp,
        r.units_required,
        r.final_status,
        r.requested_date,
        rs.bank_id,
        bu.name AS bank_name,
        rs.request_status
       FROM Blood_Request_from_hospital r
       JOIN \`User\` hu ON r.hospital_id = hu.user_id
       LEFT JOIN Requests_sent_to_BloodBanks rs ON rs.request_id = r.request_id
       LEFT JOIN \`User\` bu ON rs.bank_id = bu.user_id
       ORDER BY r.requested_date DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAdminStock = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
        bs.bank_id,
        bu.name AS bank_name,
        bs.blood_grp,
        SUM(bs.units_available) AS units
       FROM Blood_Stock bs
       JOIN \`User\` bu ON bs.bank_id = bu.user_id
       WHERE bs.expiry_date >= CURDATE()
       GROUP BY bs.bank_id, bu.name, bs.blood_grp
       ORDER BY bu.name ASC, bs.blood_grp ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- Admin Request Management ---
const { getRequestById, sendRequestToBank, cancelBankRequest } = require("../models/hospitalModels");
const { fulfillRequest, rejectRequest } = require("../models/bloodBankModels");

// GET /api/admin/requests/:id
const getAdminRequestById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing id" });
    const conn = await db.promise().getConnection();
    try {
      const request = await getRequestById(conn, id);
      conn.release();
      if (!request) return res.status(404).json({ success: false, message: "Request not found" });
      // Also fetch bank-level statuses
      const [rows] = await db.promise().query(
        `SELECT rs.bank_id, rs.request_status, u.name AS bank_name
         FROM Requests_sent_to_BloodBanks rs
         LEFT JOIN \`User\` u ON rs.bank_id = u.user_id
         WHERE rs.request_id = ?`,
        [id]
      );
      return res.json({ success: true, data: { ...request, banks: rows } });
    } catch (e) { conn.release(); throw e; }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin approve: use fulfillRequest model inside a transaction
const approveAdminRequest = async (req, res) => {
  const conn = await db.promise().getConnection();
  try {
    const { bank_id } = req.body || {};
    const request_id = req.params.id;
    if (!bank_id) return res.status(400).json({ success: false, message: "Missing bank_id in body" });
    await conn.beginTransaction();
    const result = await fulfillRequest(conn, { request_id, bank_id });
    if (!result.success) { await conn.rollback(); return res.status(400).json(result); }
    await conn.commit();
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'request_approve', entity_type: 'request', entity_id: request_id, previous_values: null, new_values: { approved_by_bank: bank_id } }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ ...result, notification: { type: 'success', text: 'Request approved by admin' } });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

// Admin reject: use rejectRequest model
const rejectAdminRequest = async (req, res) => {
  const conn = await db.promise().getConnection();
  try {
    const { bank_id } = req.body || {};
    const request_id = req.params.id;
    if (!bank_id) return res.status(400).json({ success: false, message: "Missing bank_id in body" });
    await conn.beginTransaction();
    const result = await rejectRequest(conn, { request_id, bank_id });
    if (!result.success) { await conn.rollback(); return res.status(400).json(result); }
    await conn.commit();
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'request_reject', entity_type: 'request', entity_id: request_id, previous_values: null, new_values: { rejected_by_bank: bank_id } }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ ...result, notification: { type: 'warning', text: 'Request rejected by admin' } });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

// Admin reassign: cancel from_bank (optional) then sendRequestToBank to to_bank_id
const reassignAdminRequest = async (req, res) => {
  const conn = await db.promise().getConnection();
  try {
    const { to_bank_id, from_bank_id } = req.body || {};
    const request_id = req.params.id;
    if (!to_bank_id) return res.status(400).json({ success: false, message: "Missing to_bank_id in body" });
    // validate bank exists and is blood_bank
    const [bankRows] = await db.promise().query(`SELECT user_id FROM \`User\` WHERE user_id = ? AND user_type = 'blood_bank'`, [to_bank_id]);
    if (!bankRows.length) return res.status(404).json({ success: false, message: 'Target bank not found' });

    await conn.beginTransaction();
    if (from_bank_id) {
      const cancelRes = await cancelBankRequest(conn, request_id, from_bank_id);
      if (!cancelRes.success) { await conn.rollback(); return res.status(400).json(cancelRes); }
    }
    // send to new bank
    await sendRequestToBank(conn, request_id, to_bank_id);
    await conn.commit();
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'request_reassign', entity_type: 'request', entity_id: request_id, previous_values: { from_bank_id }, new_values: { to_bank_id } }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ success: true, message: 'Request reassigned' });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

// --- Admin Blood Stock Management ---
// GET /api/admin/blood-stock?blood_grp=&bank_id=&page=&limit=
const getAdminBloodStock = async (req, res) => {
  try {
    const blood_grp = typeof req.query.blood_grp === "string" ? req.query.blood_grp.trim() : "";
    const bank_id = typeof req.query.bank_id === "string" ? req.query.bank_id.trim() : "";
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const params = [];
    let where = "WHERE 1=1";
    if (blood_grp) {
      where += " AND bs.blood_grp = ?";
      params.push(blood_grp);
    }
    if (bank_id) {
      where += " AND bs.bank_id = ?";
      params.push(bank_id);
    }

    const sql = `SELECT bs.stock_id, bs.bank_id, bu.name AS bank_name, bs.blood_grp, bs.units_available, bs.donation_id
      FROM Blood_Stock bs
      JOIN \`User\` bu ON bs.bank_id = bu.user_id
      ${where}
      ORDER BY bu.name ASC, bs.blood_grp ASC
      LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const [rows] = await db.promise().query(sql, params);
    return res.json({ success: true, data: rows, meta: { page, limit } });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/blood-stock/:id
const getAdminBloodStockById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing stock id" });
    const [rows] = await db.promise().query(
      `SELECT bs.stock_id, bs.bank_id, bu.name AS bank_name, bs.blood_grp, bs.units_available, bs.donation_id
       FROM Blood_Stock bs
       JOIN \`User\` bu ON bs.bank_id = bu.user_id
       WHERE bs.stock_id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Stock not found" });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/admin/blood-stock/:id
const updateAdminBloodStock = async (req, res) => {
  try {
    const id = req.params.id;
    const { units_available } = req.body || {};
    if (!id) return res.status(400).json({ success: false, message: "Missing stock id" });
    if (units_available === undefined) return res.status(400).json({ success: false, message: "Missing units_available" });
    const next = Math.max(0, Number(units_available));
    const [beforeRows] = await db.promise().query(`SELECT * FROM Blood_Stock WHERE stock_id = ?`, [id]);
    const before = beforeRows[0] || null;
    const [result] = await db.promise().query(`UPDATE Blood_Stock SET units_available = ? WHERE stock_id = ?`, [next, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Stock not found" });
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'stock_update', entity_type: 'blood_stock', entity_id: String(id), previous_values: before, new_values: { units_available: next } }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ success: true, message: "Stock updated" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/blood-stock/:id/adjust
const adjustAdminBloodStock = async (req, res) => {
  try {
    const id = req.params.id;
    const { adjustment, reason } = req.body || {};
    if (!id) return res.status(400).json({ success: false, message: "Missing stock id" });
    if (adjustment === undefined) return res.status(400).json({ success: false, message: "Missing adjustment value" });
    const [rows] = await db.promise().query(`SELECT units_available FROM Blood_Stock WHERE stock_id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Stock not found" });
    const current = Number(rows[0].units_available);
    const next = Math.max(0, current + Number(adjustment));
    await db.promise().query(`UPDATE Blood_Stock SET units_available = ? WHERE stock_id = ?`, [next, id]);
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'stock_adjust', entity_type: 'blood_stock', entity_id: String(id), previous_values: { units_available: current }, new_values: { units_available: next, adjustment: Number(adjustment), reason: reason || null } }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ success: true, message: "Stock adjusted", data: { stock_id: id, units_available: next, reason: reason || null } });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/blood-stock/:id/expire
const expireAdminBloodStock = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing stock id" });
    // If schema has expiry flag/column use it; otherwise set units_available=0 as mark expired
    // Check if expiry column exists
    try {
      const [cols] = await db.promise().query(`SHOW COLUMNS FROM \`Blood_Stock\` LIKE 'is_expired'`);
    if (cols && cols.length) {
        const [beforeRows] = await db.promise().query(`SELECT * FROM Blood_Stock WHERE stock_id = ?`, [id]);
        const before = beforeRows[0] || null;
        const [result] = await db.promise().query(`UPDATE Blood_Stock SET is_expired = 1 WHERE stock_id = ?`, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Stock not found" });
        try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'stock_expire', entity_type: 'blood_stock', entity_id: String(id), previous_values: before, new_values: { is_expired: 1 } }); } catch (e) { console.log('AUDIT ERR', e); }
        return res.json({ success: true, message: "Stock marked expired" });
      }
    } catch (e) {
      // ignore
    }
    // fallback: write off units
    const [beforeRows2] = await db.promise().query(`SELECT * FROM Blood_Stock WHERE stock_id = ?`, [id]);
    const before2 = beforeRows2[0] || null;
    const [result2] = await db.promise().query(`UPDATE Blood_Stock SET units_available = 0 WHERE stock_id = ?`, [id]);
    if (result2.affectedRows === 0) return res.status(404).json({ success: false, message: "Stock not found" });
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'stock_expire', entity_type: 'blood_stock', entity_id: String(id), previous_values: before2, new_values: { units_available: 0 } }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ success: true, message: "Stock marked expired (units zeroed)" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/blood-stock/:id
const deleteAdminBloodStock = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing stock id" });
    const [beforeRows] = await db.promise().query(`SELECT * FROM Blood_Stock WHERE stock_id = ?`, [id]);
    const before = beforeRows[0] || null;
    const [result] = await db.promise().query(`DELETE FROM Blood_Stock WHERE stock_id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Stock not found or cannot be deleted" });
    try { await createAuditLog({ admin_user_id: req.user.user_id, action_type: 'stock_delete', entity_type: 'blood_stock', entity_id: String(id), previous_values: before, new_values: null }); } catch (e) { console.log('AUDIT ERR', e); }
    return res.json({ success: true, message: "Stock record deleted" });
  } catch (err) {
    console.log(err);
    // If foreign key prevents deletion, return a 400 with the DB message
    if (err && err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ success: false, message: "Cannot delete stock: referenced by other records" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAdminIssued = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
        i.issued_id,
        i.request_id,
        i.bank_id,
        COALESCE(bu.name, '') AS bank_name,
        r.hospital_id,
        COALESCE(hu.name, '') AS hospital_name,
        i.blood_grp,
        i.units_issued AS units,
        i.issued_date AS issued_date
       FROM Blood_issued_to_hospital i
       LEFT JOIN Blood_Request_from_hospital r ON i.request_id = r.request_id
       LEFT JOIN \`User\` bu ON i.bank_id = bu.user_id
       LEFT JOIN \`User\` hu ON r.hospital_id = hu.user_id
       ORDER BY i.issued_date DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAdminDashboard,
  getAdminUsers,
  createAdminUser,
  getAdminDonations,
  getAdminRequests,
  getAdminStock,
  getAdminIssued,
  getAdminUserById,
  updateAdminUser,
  patchAdminUserStatus,
  deleteAdminUser,
  // blood stock management
  getAdminBloodStock,
  getAdminBloodStockById,
  updateAdminBloodStock,
  adjustAdminBloodStock,
  expireAdminBloodStock,
  deleteAdminBloodStock,
  // audit logs
  getAdminAuditLogs,
  getAdminAuditLogById,
  // request management
  getAdminRequestById,
  approveAdminRequest,
  rejectAdminRequest,
  reassignAdminRequest,
};
