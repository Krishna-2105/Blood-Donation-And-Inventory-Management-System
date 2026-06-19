const db = require('../config/db');
const {
  createAppointment,
  getDonorAppointments,
  getBankAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment
} = require('../models/appointmentModels');

// DONOR: create appointment
const createAppointmentRoute = async (req, res) => {
  let conn;
  try {
    const donor_id = req.user.user_id;
    const { bank_id, appointment_date, appointment_time, remarks } = req.body || {};
    if (!bank_id || !appointment_date || !appointment_time) return res.status(400).json({ success: false, message: 'Missing required fields' });
    conn = await db.promise().getConnection();
    await conn.beginTransaction();
    const id = await createAppointment(conn, { donor_id, bank_id, appointment_date, appointment_time, remarks });
    await conn.commit();
    conn.release();
    return res.status(201).json({ success: true, appointment_id: id, message: 'Appointment created' });
  } catch (err) {
    if (conn) { await conn.rollback(); conn.release(); }
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DONOR: get my appointments
const getDonorAppointmentsRoute = async (req, res) => {
  try {
    const donor_id = req.user.user_id;
    const rows = await getDonorAppointments(donor_id);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DONOR: cancel appointment
const cancelAppointmentRoute = async (req, res) => {
  let conn;
  try {
    const donor_id = req.user.user_id;
    const { appointment_id } = req.params;
    const appt = await getAppointmentById(appointment_id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appt.donor_id !== donor_id) return res.status(403).json({ success: false, message: 'Cannot cancel others appointment' });
    if (appt.status !== 'Pending') return res.status(400).json({ success: false, message: 'Only pending appointments can be cancelled' });
    conn = await db.promise().getConnection();
    await conn.beginTransaction();
    const ok = await cancelAppointment(conn, appointment_id);
    if (!ok) { await conn.rollback(); conn.release(); return res.status(400).json({ success: false, message: 'Failed to cancel' }); }
    await conn.commit(); conn.release();
    return res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    if (conn) { await conn.rollback(); conn.release(); }
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// BANK: view incoming appointments
const getBankAppointmentsRoute = async (req, res) => {
  try {
    // bank id from params or from user if owned bank
    const bank_id = req.params.bank_id || req.user.user_id;
    const rows = await getBankAppointments(bank_id);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// BANK: approve/reject/complete
const updateAppointmentStatusRoute = async (req, res) => {
  let conn;
  try {
    const bank_id = req.user.user_id;
    const { appointment_id } = req.params;
    const { status, remarks } = req.body || {};
    if (!['Approved','Rejected','Completed'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const appt = await getAppointmentById(appointment_id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appt.bank_id !== bank_id) return res.status(403).json({ success: false, message: 'Cannot modify appointment for another bank' });
    conn = await db.promise().getConnection();
    await conn.beginTransaction();
    const ok = await updateAppointmentStatus(conn, appointment_id, status, remarks || appt.remarks);
    if (!ok) { await conn.rollback(); conn.release(); return res.status(400).json({ success: false, message: 'Failed to update status' }); }
    await conn.commit(); conn.release();
    return res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    if (conn) { await conn.rollback(); conn.release(); }
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADMIN: get all
const getAllAppointmentsRoute = async (req, res) => {
  try {
    const rows = await getAllAppointments();
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createAppointmentRoute,
  getDonorAppointmentsRoute,
  cancelAppointmentRoute,
  getBankAppointmentsRoute,
  updateAppointmentStatusRoute,
  getAllAppointmentsRoute
};
