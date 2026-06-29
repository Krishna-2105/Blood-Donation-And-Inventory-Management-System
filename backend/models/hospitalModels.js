const db = require("../config/db");
const getHospitalLocation = async (hospital_id) => {
  const [rows] = await db.promise().query(
    `SELECT latitude, longitude
     FROM Organization_Location
     WHERE organisation_id = ?`,
    [hospital_id]
  );
  return rows;
};

const searchBanks = async (hospital_id, latitude, longitude, blood_grp, units_required) => {
  const [rows] = await db.promise().query(
    `
    SELECT
      bs.bank_id,
      u.name AS bank_name,
      SUM(bs.units_available) AS units_available,
    (6371 * 2 * ASIN(SQRT(
        POWER(SIN(RADIANS(ol.latitude - ?)/2), 2) +
        COS(RADIANS(?)) * COS(RADIANS(ol.latitude)) * POWER(SIN(RADIANS(ol.longitude - ?)/2), 2)
      ))) AS distance
    FROM Blood_Stock bs
    JOIN Donation d ON bs.donation_id = d.donation_id
    JOIN User u ON bs.bank_id = u.user_id
    JOIN Organization_Location ol ON bs.bank_id = ol.organisation_id
    LEFT JOIN Owns own ON own.bank_id = bs.bank_id AND own.hospital_id = ?
    WHERE bs.blood_grp = ?
      AND u.user_type = 'blood_bank'
      AND DATE_ADD(d.donation_date, INTERVAL 42 DAY) >= CURDATE()
      AND own.bank_id IS NULL
    GROUP BY bs.bank_id, u.name, ol.latitude, ol.longitude
    HAVING SUM(bs.units_available) >= ?
    ORDER BY distance ASC
    `,
    [latitude, latitude, longitude, hospital_id, blood_grp, units_required]
  );
  return rows;
};

const createRequest = async (conn, request_id, hospital_id, blood_grp, units_required, priority) => {
  const [result] = await conn.query(
    `INSERT INTO Blood_Request_from_hospital
      (request_id, hospital_id, blood_grp, units_required, priority)
     VALUES (?, ?, ?, ?, ?)`,
    [request_id, hospital_id, blood_grp, units_required, priority]
  );
  return result;
};

const sendRequestToBank = async (conn, request_id, bank_id) => {
  const [result] = await conn.query(
    `INSERT INTO Requests_sent_to_BloodBanks
      (request_id, bank_id, request_status)
     VALUES (?, ?, 'Processing')`,
    [request_id, bank_id]
  );
  return result;
};

const getHospitalRequests = async (hospital_id) => {
  const [rows] = await db.promise().query(
    `
    SELECT
      r.request_id,
      r.blood_grp,
      r.units_required,
      r.final_status,
      r.requested_date,
      rs.bank_id,
      rs.request_status,
      u.name AS bank_name,
      i.issued_id
    FROM Blood_Request_from_hospital r
    JOIN Requests_sent_to_BloodBanks rs ON r.request_id = rs.request_id
    JOIN User u ON rs.bank_id = u.user_id
    LEFT JOIN Blood_issued_to_hospital i
      ON i.request_id = rs.request_id AND i.bank_id = rs.bank_id
    WHERE r.hospital_id = ?
    ORDER BY r.requested_date DESC
    `,
    [hospital_id]
  );
  return rows;
};

const getRequestById = async (conn, request_id) => {
  const [rows] = await conn.query(
    `SELECT request_id, hospital_id, blood_grp, units_required, final_status
     FROM Blood_Request_from_hospital
     WHERE request_id = ?
     FOR UPDATE`,
    [request_id]
  );
  return rows[0] || null;
};

const cancelRequest = async (conn, request_id) => {
  await conn.query(
    `UPDATE Blood_Request_from_hospital
     SET final_status='Cancelled'
     WHERE request_id=?`,
    [request_id]
  );
  await conn.query(
    `UPDATE Requests_sent_to_BloodBanks
     SET request_status='Cancelled'
     WHERE request_id = ?`,
    [request_id]
  );
};

const cancelBankRequest = async (conn, request_id, bank_id) => {
  const [row] = await conn.query(
    `SELECT request_status
     FROM Requests_sent_to_BloodBanks
     WHERE request_id = ? AND bank_id = ?`,
    [request_id, bank_id]
  );

  if (!row.length) {
    return { success: false, message: "Request not found for this bank." };
  }

  if (row[0].request_status !== 'Processing') {
    return { success: false, message: "Only processing bank requests can be cancelled." };
  }

  await conn.query(
    `UPDATE Requests_sent_to_BloodBanks
     SET request_status='Cancelled'
     WHERE request_id = ? AND bank_id = ?`,
    [request_id, bank_id]
  );

  const [statusRows] = await conn.query(
    `SELECT request_status
     FROM Requests_sent_to_BloodBanks
     WHERE request_id = ?`,
    [request_id]
  );

  const hasApproved = statusRows.some((s) => s.request_status === 'Approved');
  const allRejected = statusRows.length > 0 && statusRows.every((s) => s.request_status === 'Rejected');
  const allCancelled = statusRows.length > 0 && statusRows.every((s) => s.request_status === 'Cancelled');
  const hasProcessing = statusRows.some((s) => s.request_status === 'Processing');
  const newFinalStatus = hasApproved
    ? 'Approved'
    : allCancelled
      ? 'Cancelled'
      : hasProcessing
        ? 'Processing'
        : 'Rejected';

  await conn.query(
    `UPDATE Blood_Request_from_hospital
     SET final_status = ?
     WHERE request_id = ?`,
    [newFinalStatus, request_id]
  );

  return { success: true, message: 'Bank request cancelled.', final_status: newFinalStatus };
};

const getIncomingRequests = async (bank_id) => {
  const [rows] = await db.promise().query(
    `
    SELECT r.request_id, r.blood_grp, r.units_required, r.priority, r.hospital_id,
           u.name AS hospital_name, s.request_status
    FROM Requests_sent_to_BloodBanks s
    JOIN Blood_Request_from_hospital r ON s.request_id = r.request_id
    JOIN User u ON r.hospital_id = u.user_id
    WHERE s.bank_id=?
    `,
    [bank_id]
  );
  return rows;
};

const getHospitalDashboardStats = async (hospital_id) => {
  const [rows] = await db.promise().query(
    `SELECT final_status, COUNT(*) AS total
     FROM Blood_Request_from_hospital
     WHERE hospital_id = ?
     GROUP BY final_status`,
    [hospital_id]
  );
  const stats = {
    total_requests: 0,
    pending_requests: 0,
    fulfilled_requests: 0,
    rejected_requests: 0,
    cancelled_requests: 0
  };
  for (const row of rows) {
    stats.total_requests += Number(row.total);
    if (row.final_status === "Processing") stats.pending_requests = Number(row.total);
    if (row.final_status === "Approved") stats.fulfilled_requests = Number(row.total);
    if (row.final_status === "Rejected") stats.rejected_requests = Number(row.total);
    if (row.final_status === "Cancelled") stats.cancelled_requests = Number(row.total);
  }
  return stats;
};


module.exports = {
  getHospitalLocation,
  searchBanks,
  createRequest,
  sendRequestToBank,
  getHospitalRequests,
  getRequestById,
  cancelRequest,
  cancelBankRequest,
  getIncomingRequests,
  getHospitalDashboardStats
};
