const db = require("../config/db");
const {
  createNotification,
  createNotificationWithConn,
} = require("../models/notificationModels");
const { LOW_STOCK_THRESHOLD, LARGE_TRANSACTION_THRESHOLD } = require("../config/bloodConfig");

const getAllAdminUserIds = async () => {
  const [rows] = await db.promise().query(
    `SELECT user_id FROM \`User\` WHERE user_type = 'admin'`
  );
  return rows.map((r) => r.user_id);
};

const notifyRequestApproved = async (hospital_id, request_id, bank_id) => {
  await createNotification({
    user_id: hospital_id,
    title: "Request Approved",
    message: `Your blood request ${request_id} has been approved by bank ${bank_id}.`,
    type: "REQUEST",
  });
};

const notifyRequestRejected = async (hospital_id, request_id, bank_id) => {
  await createNotification({
    user_id: hospital_id,
    title: "Request Rejected",
    message: `Your blood request ${request_id} has been rejected by bank ${bank_id}.`,
    type: "REQUEST",
  });
};

const notifyBloodIssued = async (hospital_id, request_id, issued_id, units) => {
  await createNotification({
    user_id: hospital_id,
    title: "Blood Issued",
    message: `Blood has been issued for request ${request_id}. Issued ID: ${issued_id}. Units: ${units}.`,
    type: "REQUEST",
  });
};

const notifyNewRequestToBank = async (bank_id, request_id, hospital_id) => {
  await createNotification({
    user_id: bank_id,
    title: "New Request Received",
    message: `A new blood request ${request_id} has been received from hospital ${hospital_id}.`,
    type: "REQUEST",
  });
};

const notifyAppointmentBookedToBank = async (bank_id, donor_id, appointment_id) => {
  await createNotification({
    user_id: bank_id,
    title: "Appointment Booked",
    message: `Donor ${donor_id} has booked an appointment (ID: ${appointment_id}).`,
    type: "APPOINTMENT",
  });
};

const notifyLowInventory = async (bank_id, blood_grp, units) => {
  await createNotification({
    user_id: bank_id,
    title: "Low Inventory Alert",
    message: `Low stock for blood group ${blood_grp}. Only ${units} units remaining.`,
    type: "INVENTORY",
  });
};

const notifyAppointmentApproved = async (donor_id, appointment_id) => {
  await createNotification({
    user_id: donor_id,
    title: "Appointment Approved",
    message: `Your appointment (ID: ${appointment_id}) has been approved.`,
    type: "APPOINTMENT",
  });
};

const notifyAppointmentRejected = async (donor_id, appointment_id) => {
  await createNotification({
    user_id: donor_id,
    title: "Appointment Rejected",
    message: `Your appointment (ID: ${appointment_id}) has been rejected.`,
    type: "APPOINTMENT",
  });
};

const notifyEligibleToDonate = async (donor_id) => {
  await createNotification({
    user_id: donor_id,
    title: "Eligible to Donate Again",
    message: "You are now eligible to donate blood again. Please schedule an appointment.",
    type: "DONATION",
  });
};

const notifyNewRegistrationToAdmins = async (new_user_id, user_type) => {
  const adminIds = await getAllAdminUserIds();
  for (const admin_id of adminIds) {
    await createNotification({
      user_id: admin_id,
      title: "New Registration",
      message: `A new ${user_type} (ID: ${new_user_id}) has registered.`,
      type: "SYSTEM",
    });
  }
};

const notifyLargeTransactionToAdmins = async (hospital_id, request_id, units) => {
  const adminIds = await getAllAdminUserIds();
  for (const admin_id of adminIds) {
    await createNotification({
      user_id: admin_id,
      title: "Large Blood Issue Transaction",
      message: `A large blood issue of ${units} units was made to hospital ${hospital_id} (Request: ${request_id}).`,
      type: "SYSTEM",
    });
  }
};

const checkLowStockAndNotify = async (bank_id) => {
  const [rows] = await db.promise().query(
    `SELECT bs.blood_grp, SUM(bs.units_available) AS units
     FROM Blood_Stock bs
     JOIN Donation d ON bs.donation_id = d.donation_id
     WHERE bs.bank_id = ? AND DATE_ADD(d.donation_date, INTERVAL 42 DAY) >= CURDATE()
     GROUP BY bs.blood_grp
     HAVING units < ?`,
    [bank_id, LOW_STOCK_THRESHOLD]
  );
  for (const row of rows) {
    await notifyLowInventory(bank_id, row.blood_grp, row.units);
  }
};

module.exports = {
  notifyRequestApproved,
  notifyRequestRejected,
  notifyBloodIssued,
  notifyNewRequestToBank,
  notifyAppointmentBookedToBank,
  notifyLowInventory,
  notifyAppointmentApproved,
  notifyAppointmentRejected,
  notifyEligibleToDonate,
  notifyNewRegistrationToAdmins,
  notifyLargeTransactionToAdmins,
  checkLowStockAndNotify,
};
