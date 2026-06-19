const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// 🔍 CHECK DONOR EXISTS
const checkDonorExists = async (conn, donor_id) => {
  const [rows] = await conn.query(
    "SELECT donor_id FROM Donor WHERE donor_id = ?",
    [donor_id]
  );
  console.log(rows);
  return rows.length > 0;
};

const checkDonorExistsWithBloodGrp = async (conn, {donor_id, blood_grp}) => {
  const [rows] = await conn.query(
    "SELECT donor_id FROM Donor WHERE donor_id = ? AND blood_grp = ?",
    [donor_id, blood_grp]
  );
  console.log(rows);
  return rows.length > 0;
};


// 🔍 CHECK ELIGIBILITY
const checkDonorEligibility = async (conn, donor_id) => {
  const [rows] = await conn.query(
    `
    SELECT donation_date 
    FROM Donation
    WHERE donor_id = ?
    ORDER BY donation_date DESC
    LIMIT 1
    `,
    [donor_id]
  );

  if (rows.length === 0) {
    return { eligible: true };
  }

  const lastDate = new Date(rows[0].donation_date);
  const today = new Date();

  const diffDays = (today - lastDate) / (1000 * 60 * 60 * 24);

  if (diffDays < 90) {
    return {
      eligible: false,
      days_left: Math.ceil(90 - diffDays)
    };
  }

  return { eligible: true };
};

// ➕ INSERT DONATION
const insertDonation = async (conn, { donor_id, units_donated, bank_id }) => {
  const [result] = await conn.query(
    `INSERT INTO Donation 
     (donor_id, units_donated, donation_date, bank_id)
     VALUES (?, ?, CURDATE(), ?)`,
    [donor_id, units_donated, bank_id]
  );

  return result.insertId;
};

// 🔒 STOCK INSERT (SAFE)
const insertBloodStockWithLock = async (
  conn,
  { bank_id, blood_grp, units_available, donation_id }
) => {
  const [rows] = await conn.query(
    `
    SELECT COALESCE(MAX(stock_id), 0) AS max_id
    FROM Blood_Stock
    WHERE bank_id = ?
    FOR UPDATE
    `,
    [bank_id]
  );

  const nextStockId = rows[0].max_id + 1;

  await conn.query(
    `
    INSERT INTO Blood_Stock
    (stock_id, bank_id, blood_grp, units_available, donation_id)
    VALUES (?, ?, ?, ?, ?)
    `,
    [nextStockId, bank_id, blood_grp, units_available, donation_id]
  );
};
const getDashboardData = async (bank_id) => {
  const conn = db.promise();

  // bank identity
  const [bankInfo] = await conn.query(
    `SELECT u.user_id AS bank_id, u.name AS bank_name, u.email AS bank_email
     , u.created_dt AS created_dt
     FROM \`User\` u
     WHERE u.user_id = ?`,
    [bank_id]
  );

  // total units
  const [total] = await conn.query(
    `SELECT SUM(units_available) AS total_units
     FROM Blood_Stock
     WHERE bank_id = ?`,
    [bank_id]
  );

  // pending requests
  const [pending] = await conn.query(
    `SELECT COUNT(*) AS pending_requests
     FROM Requests_sent_to_BloodBanks
     WHERE bank_id = ? AND request_status = 'Processing'`,
    [bank_id]
  );

  // donations this month
  const [donations] = await conn.query(
    `SELECT COUNT(*) AS donations_this_month
     FROM Donation
     WHERE bank_id = ?
     AND MONTH(donation_date) = MONTH(CURRENT_DATE())`,
    [bank_id]
  );

  // low stock
  const [low] = await conn.query(
    `SELECT blood_grp, SUM(units_available) AS units
     FROM Blood_Stock
     WHERE bank_id = ?
     GROUP BY blood_grp
     HAVING units <= 5`,
    [bank_id]
  );

  return {
    bank_id: bankInfo[0]?.bank_id || bank_id,
    bank_name: bankInfo[0]?.bank_name || "",
    bank_email: bankInfo[0]?.bank_email || "",
    created_dt: bankInfo[0]?.created_dt || null,
    total_units: total[0].total_units || 0,
    pending_requests: pending[0].pending_requests,
    donations_this_month: donations[0].donations_this_month,
    low_stock: low
  };
};
const getInventoryData = async (bank_id) => {
  const conn = db.promise();

  const [summary] = await conn.query(
    `SELECT blood_grp, SUM(units_available) AS units
     FROM Blood_Stock
     WHERE bank_id = ?
     GROUP BY blood_grp
     ORDER BY blood_grp`,
    [bank_id]
  );
  const [entries] = await conn.query(
    `SELECT bs.stock_id,
            bs.bank_id,
            bs.blood_grp,
            bs.units_available,
            d.donation_date AS collection_dt,
            d.donor_id
     FROM Blood_Stock bs
     LEFT JOIN Donation d ON d.donation_id = bs.donation_id
     WHERE bs.bank_id = ?
     ORDER BY d.donation_date ASC, bs.stock_id ASC`,
    [bank_id]
  );

  return { summary, entries };
};
const getRequestData = async (bank_id) => {
  const conn = db.promise();

  const [rows] = await conn.query(
    `
    SELECT 
      r.request_id,
      r.blood_grp,
      r.units_required AS units,
      rs.request_status AS status,
      u.name AS hospital_name,
      i.issued_id
    FROM Requests_sent_to_BloodBanks rs
    JOIN Blood_Request_from_hospital r 
      ON rs.request_id = r.request_id
    JOIN User u 
      ON r.hospital_id = u.user_id
    LEFT JOIN Blood_issued_to_hospital i 
      ON i.request_id = r.request_id AND i.bank_id = rs.bank_id
    WHERE rs.bank_id = ?
    ORDER BY r.requested_date DESC
    `,
    [bank_id]
  );

  return rows;
};
const getDonationHistory = async (bank_id) => {
  const conn = db.promise();

  const [rows] = await conn.query(
    `
    SELECT 
      d.donation_id,
      u.name AS donor_name,
      d.units_donated AS units,
      d.donation_date AS date
    FROM Donation d
    JOIN User u ON d.donor_id = u.user_id
    WHERE d.bank_id = ?
    ORDER BY d.donation_date DESC
    `,
    [bank_id]
  );

  return rows;
};

const fulfillRequest = async (conn, {request_id, bank_id}) => {
  const [requestRows] = await conn.query(
    `SELECT r.request_id, r.hospital_id, r.blood_grp, r.units_required, r.final_status
     FROM Blood_Request_from_hospital r
     JOIN Requests_sent_to_BloodBanks rs ON rs.request_id = r.request_id
     WHERE r.request_id = ? AND rs.bank_id = ? AND rs.request_status = 'Processing'
     FOR UPDATE`,
    [request_id, bank_id]
  );

  if (!requestRows.length) {
    return { success: false, message: "Request not found or already processed." };
  }

  const request = requestRows[0];
  if (request.final_status !== "Processing") {
    return { success: false, message: "Request is no longer processing." };
  }

  const [stockRows] = await conn.query(
    `SELECT bs.stock_id, bs.bank_id, bs.units_available
     FROM Blood_Stock bs
     LEFT JOIN Donation d ON d.donation_id = bs.donation_id
     WHERE bs.bank_id = ? AND bs.blood_grp = ? AND bs.units_available > 0
     ORDER BY d.donation_date ASC, bs.stock_id ASC
     FOR UPDATE`,
    [bank_id, request.blood_grp]
  );

  let needed = Number(request.units_required);
  let total = 0;
  const deductions = [];
  for (const stock of stockRows) {
    if (needed <= 0) break;
    total += Number(stock.units_available);
    const use = Math.min(needed, Number(stock.units_available));
    deductions.push({ stock_id: stock.stock_id, bank_id: stock.bank_id, units: use });
    needed -= use;
  }
  if (needed > 0) {
    return {
      success: false,
      message: `Insufficient stock for ${request.blood_grp}. Available: ${total} units.`
    };
  }

  for (const d of deductions) {
    await conn.query(
      `UPDATE Blood_Stock
       SET units_available = units_available - ?
       WHERE stock_id = ? AND bank_id = ?`,
      [d.units, d.stock_id, d.bank_id]
    );
  }

  await conn.query(
    `UPDATE Requests_sent_to_BloodBanks
     SET request_status = 'Approved'
     WHERE request_id = ? AND bank_id = ?`,
    [request_id, bank_id]
  );
  await conn.query(
    `UPDATE Requests_sent_to_BloodBanks
     SET request_status = 'Cancelled'
     WHERE request_id = ? AND bank_id <> ?`,
    [request_id, bank_id]
  );
  await conn.query(
    `UPDATE Blood_Request_from_hospital
     SET final_status = 'Approved'
     WHERE request_id = ?`,
    [request_id]
  );
  const issued_id = uuidv4();
  await conn.query(
    `INSERT INTO Blood_issued_to_hospital
      (issued_id, bank_id, blood_grp, units_issued, issued_date, request_id)
     VALUES (?,?, ?, ?, NOW(), ?)`,
    [issued_id, bank_id, request.blood_grp, request.units_required, request_id]
  );

  return { success: true, message: "Request fulfilled successfully.", issued_id };
};

const rejectRequest = async (conn, {request_id, bank_id}) => {
  const [requestRows] = await conn.query(
    `SELECT r.request_id, r.hospital_id, r.blood_grp, r.units_required, r.final_status
     FROM Blood_Request_from_hospital r
     JOIN Requests_sent_to_BloodBanks rs ON rs.request_id = r.request_id
     WHERE r.request_id = ? AND rs.bank_id = ? AND rs.request_status = 'Processing'
     FOR UPDATE`,
    [request_id, bank_id]
  );
  if (!requestRows.length) {
    return { success: false, message: "Request not found or already processed." };
  }
  const request = requestRows[0];

  await conn.query(
    `UPDATE Requests_sent_to_BloodBanks
     SET request_status = 'Rejected'
     WHERE request_id = ? AND bank_id = ?`,
    [request_id, bank_id]
  );

  const [statusRows] = await conn.query(
    `SELECT request_status
     FROM Requests_sent_to_BloodBanks
     WHERE request_id = ?`,
    [request_id]
  );

  const allRejected = statusRows.length > 0 && statusRows.every((r) => r.request_status === "Rejected");

  if (allRejected) {
    await conn.query(
      `UPDATE Blood_Request_from_hospital
       SET final_status = 'Rejected'
       WHERE request_id = ? AND final_status = 'Processing'`,
      [request_id]
    );
    return { success: true, message: "Request rejected. All banks have now rejected this request." };
  }

  return { success: true, message: "Request rejected." };
};

const adjustStock = async (bank_id, stock_id, adjustment) => {
  const [currentRows] = await db.promise().query(
    `SELECT bs.stock_id, bs.bank_id, bs.blood_grp, bs.units_available, d.donation_date AS collection_dt
     FROM Blood_Stock bs
     LEFT JOIN Donation d ON d.donation_id = bs.donation_id
     WHERE bs.bank_id = ? AND bs.stock_id = ?`,
    [bank_id, stock_id]
  );
  if (!currentRows.length) return null;
  const current = currentRows[0];
  const nextUnits = Math.max(0, Number(current.units_available) + Number(adjustment));
  await db.promise().query(
    `UPDATE Blood_Stock SET units_available = ? WHERE bank_id = ? AND stock_id = ?`,
    [nextUnits, bank_id, stock_id]
  );
  return { ...current, units_available: nextUnits };
};

const writeOffStock = async (bank_id, stock_id) => {
  const [result] = await db.promise().query(
    `UPDATE Blood_Stock SET units_available = 0 WHERE bank_id = ? AND stock_id = ?`,
    [bank_id, stock_id]
  );
  return result.affectedRows > 0;
};

const useOwnStock = async (conn, bank_id, blood_grp, units, reason = "internal_use", request_id = null) => {
  const [stockRows] = await conn.query(
    `SELECT bs.stock_id, bs.bank_id, bs.units_available
     FROM Blood_Stock bs
     LEFT JOIN Donation d ON d.donation_id = bs.donation_id
     WHERE bs.bank_id = ? AND bs.blood_grp = ? AND bs.units_available > 0
     ORDER BY d.donation_date ASC, bs.stock_id ASC
     FOR UPDATE`,
    [bank_id, blood_grp]
  );
  let needed = Number(units);
  let total = 0;
  const deductions = [];
  for (const stock of stockRows) {
    if (needed <= 0) break;
    total += Number(stock.units_available);
    const use = Math.min(needed, Number(stock.units_available));
    deductions.push({ stock_id: stock.stock_id, bank_id: stock.bank_id, units: use });
    needed -= use;
  }
  if (needed > 0) {
    return { success: false, message: `Insufficient stock for ${blood_grp}. Available: ${total} units.` };
  }
  for (const d of deductions) {
    await conn.query(
      `UPDATE Blood_Stock SET units_available = units_available - ? WHERE stock_id = ? AND bank_id = ?`,
      [d.units, d.stock_id, d.bank_id]
    );
  }

  const issued_id = uuidv4();
  if (request_id) {
    await conn.query(
      `INSERT INTO Blood_issued_to_hospital
        (issued_id, bank_id, blood_grp, units_issued, issued_date, request_id)
       VALUES (?, ?, ?, ?, CURDATE(), ?)`,
      [issued_id, bank_id, blood_grp, units, request_id]
    );
  }

  return {
    success: true,
    message: `Stock used for ${reason}`,
    issued_id: request_id ? issued_id : null
  };
};
module.exports = {
  checkDonorExists,
  checkDonorEligibility,
  checkDonorExistsWithBloodGrp,
  insertDonation,
  insertBloodStockWithLock,
  getDashboardData,
  getInventoryData,
  getRequestData,
  getDonationHistory,
  fulfillRequest,
  rejectRequest,
  adjustStock,
  writeOffStock,
  useOwnStock
};
