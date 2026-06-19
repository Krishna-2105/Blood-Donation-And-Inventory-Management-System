const db = require('../config/db');

const createAppointment = async (conn, { donor_id, bank_id, appointment_date, appointment_time, remarks }) => {
  const [result] = await conn.query(
    `INSERT INTO Donation_Appointment (donor_id, bank_id, appointment_date, appointment_time, remarks) VALUES (?, ?, ?, ?, ?)`,
    [donor_id, bank_id, appointment_date, appointment_time, remarks || null]
  );
  return result.insertId;
};

const getDonorAppointments = async (donor_id) => {
  const [rows] = await db.promise().query(
    `SELECT appointment_id, donor_id, bank_id, appointment_date, appointment_time, status, remarks, created_at
     FROM Donation_Appointment
     WHERE donor_id = ?
     ORDER BY appointment_date DESC, appointment_time DESC`,
    [donor_id]
  );
  return rows;
};

const getBankAppointments = async (bank_id) => {
  const [rows] = await db.promise().query(
    `SELECT a.appointment_id, a.donor_id, u.name AS donor_name, a.bank_id, a.appointment_date, a.appointment_time, a.status, a.remarks, a.created_at
     FROM Donation_Appointment a
     LEFT JOIN \`User\` u ON a.donor_id = u.user_id
     WHERE a.bank_id = ?
     ORDER BY a.appointment_date ASC, a.appointment_time ASC`,
    [bank_id]
  );
  return rows;
};

const getAllAppointments = async () => {
  const [rows] = await db.promise().query(
    `SELECT a.*, du.name AS donor_name, bu.name AS bank_name
     FROM Donation_Appointment a
     LEFT JOIN \`User\` du ON a.donor_id = du.user_id
     LEFT JOIN \`User\` bu ON a.bank_id = bu.user_id
     ORDER BY a.created_at DESC`
  );
  return rows;
};

const getAppointmentById = async (appointment_id) => {
  const [rows] = await db.promise().query(
    `SELECT * FROM Donation_Appointment WHERE appointment_id = ? LIMIT 1`,
    [appointment_id]
  );
  return rows[0] || null;
};

const updateAppointmentStatus = async (conn, appointment_id, status, remarks = null) => {
  const [result] = await conn.query(
    `UPDATE Donation_Appointment SET status = ?, remarks = ? WHERE appointment_id = ?`,
    [status, remarks, appointment_id]
  );
  return result.affectedRows > 0;
};

const cancelAppointment = async (conn, appointment_id) => {
  const [result] = await conn.query(
    `UPDATE Donation_Appointment SET status = 'Cancelled' WHERE appointment_id = ? AND status IN ('Pending')`,
    [appointment_id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  createAppointment,
  getDonorAppointments,
  getBankAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment
};
