const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const {
  notifyRequestApproved,
  notifyRequestRejected,
  notifyBloodIssued,
  notifyLargeTransactionToAdmins,
  checkLowStockAndNotify,
} = require("../services/notificationService");
const { LARGE_TRANSACTION_THRESHOLD } = require("../config/bloodConfig");
const {
  checkDonorExists,
  checkDonorEligibility,
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
} = require("../models/bloodBankModels");

const getOwnedDashboard = async (req, res) => {
  try {
    const data = await getDashboardData(req.bank_id);
    return res.json({ success: true, ...data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getOwnedInventory = async (req, res) => {
  try {
    const data = await getInventoryData(req.bank_id);
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getOwnedRequests = async (req, res) => {
  try {
    const data = await getRequestData(req.bank_id);
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getOwnedDonations = async (req, res) => {
  try {
    const data = await getDonationHistory(req.bank_id);
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const addOwnedDonation = async (req, res) => {
  const conn = await db.promise().getConnection();
  try {
    const { donor_id, units, blood_grp } = req.body;
    await conn.beginTransaction();
    const exists = await checkDonorExists(conn, donor_id);
    if (!exists) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Donor not registered" });
    }
    const eligibility = await checkDonorEligibility(conn, donor_id);
    if (!eligibility.eligible) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Donor not eligible. Try after ${eligibility.days_left} days`
      });
    }
    const donation_id = await insertDonation(conn, {
      donor_id,
      units_donated: units,
      bank_id: req.bank_id
    });
    await insertBloodStockWithLock(conn, {
      bank_id: req.bank_id,
      blood_grp,
      units_available: units,
      donation_id
    });
    await conn.commit();

    try {
      await checkLowStockAndNotify(req.bank_id);
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

    return res.status(201).json({
      success: true,
      message: "Donation successful",
      donation_id,
      notification: { type: "success", text: "Donation added successfully" }
    });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    conn.release();
  }
};

const fulfillOwnedRequest = async (req, res) => {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fulfillRequest(conn, req.params.request_id, req.bank_id);
    if (!result.success) {
      await conn.rollback();
      return res.status(400).json(result);
    }
    await conn.commit();

    try {
      await notifyRequestApproved(result.hospital_id, req.params.request_id, req.bank_id);
      await notifyBloodIssued(result.hospital_id, req.params.request_id, result.issued_id, result.units_required);
      if (Number(result.units_required) >= LARGE_TRANSACTION_THRESHOLD) {
        await notifyLargeTransactionToAdmins(result.hospital_id, req.params.request_id, result.units_required);
      }
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

    return res.json({
      ...result,
      notification: { type: "success", text: "Request fulfilled successfully" }
    });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    conn.release();
  }
};

const rejectOwnedRequest = async (req, res) => {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const result = await rejectRequest(conn, req.params.request_id, req.bank_id);
    if (!result.success) {
      await conn.rollback();
      return res.status(400).json(result);
    }
    await conn.commit();

    try {
      await notifyRequestRejected(result.hospital_id, req.params.request_id, req.bank_id);
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

    return res.json({
      ...result,
      notification: { type: "warning", text: "Request rejected" }
    });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    conn.release();
  }
};

const adjustOwnedInventory = async (req, res) => {
  try {
    const { stock_id, adjustment } = req.body;
    const stock = await adjustStock(req.bank_id, stock_id, Number(adjustment));
    if (!stock) return res.status(404).json({ success: false, message: "Stock row not found" });
    return res.json({ success: true, stock });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const writeOffOwnedInventory = async (req, res) => {
  try {
    const ok = await writeOffStock(req.bank_id, req.params.stock_id);
    if (!ok) return res.status(404).json({ success: false, message: "Stock row not found" });
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const useStockRoute = async (req, res) => {
  const { blood_grp, units, reason, priority = 1 } = req.body;
  if (!blood_grp || !units || Number(units) <= 0) {
    return res.status(400).json({ success: false, message: "Blood group and units are required." });
  }

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const request_id = uuidv4();

    await conn.query(
      `INSERT INTO Blood_Request_from_hospital
        (request_id, hospital_id, blood_grp, units_required, priority, final_status)
       VALUES (?, ?, ?, ?, ?, 'Approved')`,
      [request_id, req.user.user_id, blood_grp, Number(units), Number(priority)]
    );

    await conn.query(
      `INSERT INTO Requests_sent_to_BloodBanks
        (request_id, bank_id, request_status)
       VALUES (?, ?, 'Approved')`,
      [request_id, req.bank_id]
    );

    const result = await useOwnStock(
      conn,
      req.bank_id,
      blood_grp,
      Number(units),
      reason,
      request_id
    );
    if (!result.success) {
      await conn.rollback();
      return res.status(400).json(result);
    }
    await conn.commit();

    try {
      await notifyBloodIssued(req.user.user_id, request_id, result.issued_id, Number(units));
      if (Number(units) >= LARGE_TRANSACTION_THRESHOLD) {
        await notifyLargeTransactionToAdmins(req.user.user_id, request_id, Number(units));
      }
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

    return res.json({
      ...result,
      request_id,
      notification: { type: "success", text: "Own stock used successfully" },
      issued_id: result.issued_id
    });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    conn.release();
  }
};

module.exports = {
  getOwnedDashboard,
  getOwnedInventory,
  getOwnedRequests,
  getOwnedDonations,
  addOwnedDonation,
  fulfillOwnedRequest,
  rejectOwnedRequest,
  adjustOwnedInventory,
  writeOffOwnedInventory,
  useStockRoute
};
