const db = require('../config/db');
const {
  notifyAppointmentBookedToBank,
  notifyAppointmentApproved,
  notifyAppointmentRejected,
} = require("../services/notificationService");
const {
  createAppointment,
  getDonorAppointments,
  getBankAppointments,
  getAllAppointments,
  getAppointmentById,
  getDonorAppointmentOnDate,
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(appointment_date + 'T00:00:00');

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (selectedDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book an appointment for a past date.' });
    }

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 2);
    if (selectedDate < minDate) {
      return res.status(400).json({ success: false, message: 'Appointments must be booked at least 2 days in advance.' });
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    if (selectedDate > maxDate) {
      return res.status(400).json({ success: false, message: 'Appointments can only be booked up to 30 days in advance.' });
    }

    const existing = await getDonorAppointmentOnDate(donor_id, appointment_date);
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have an appointment on this date. Please choose another date.' });
    }

    conn = await db.promise().getConnection();
    await conn.beginTransaction();
    const id = await createAppointment(conn, { donor_id, bank_id, appointment_date, appointment_time, remarks });
    await conn.commit();
    conn.release();

    try {
      await notifyAppointmentBookedToBank(bank_id, donor_id, id);
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

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

    try {
      if (status === 'Approved') {
        await notifyAppointmentApproved(appt.donor_id, appointment_id);
      } else if (status === 'Rejected') {
        await notifyAppointmentRejected(appt.donor_id, appointment_id);
      }
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

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
