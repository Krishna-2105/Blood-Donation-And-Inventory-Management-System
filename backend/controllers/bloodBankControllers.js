const {
  checkDonorExists,
  checkDonorExistsWithBloodGrp,
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
  writeOffStock
} = require("../models/bloodBankModels");
const db = require("../config/db");
const {
  notifyRequestApproved,
  notifyRequestRejected,
  notifyBloodIssued,
  notifyLargeTransactionToAdmins,
  checkLowStockAndNotify,
} = require("../services/notificationService");
const { LARGE_TRANSACTION_THRESHOLD } = require("../config/bloodConfig");

const checkDonorRoute = async (req, res) => {
  try {
    const { donor_id } = req.params;

    const conn = await db.promise().getConnection();

    const exists = await checkDonorExists(conn, donor_id);

    if (!exists) {
      conn.release();
      return res.status(404).json({
        message: "Donor not found",
        success: false
      });
    }

    const eligibility = await checkDonorEligibility(conn, donor_id);

    conn.release();

    return res.json({
      success: true,
      eligible: eligibility.eligible,
      days_left: eligibility.days_left || 0
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};

const addDonationRoute = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    // const { donor_id, units, blood_grp } = req.body;
    const donor_id = req.body.donor_id?.trim();
const units = req.body.units;
const blood_grp = req.body.blood_grp;
    const bank_id = req.user.user_id;
    console.log(req.body);
    // const donor_id=temp_donor_id.trim();

    await connection.beginTransaction();
    
    // 1️⃣ Check donor exists
    const exists = await checkDonorExists(connection, donor_id);
    if (!exists) {
      await connection.rollback();
      return res.status(404).json({
        message: "Donor not registered",
        success: false
      });
    }

    // 2️⃣ Check eligibility
    const eligibility = await checkDonorEligibility(connection, donor_id);

    if (!eligibility.eligible) {
      await connection.rollback();
      return res.status(400).json({
        message: `Donor not eligible. Try after ${eligibility.days_left} days`,
        success: false
      });
    }

    const existsWithBloodGrp = await checkDonorExistsWithBloodGrp(connection, {donor_id, blood_grp});
    if (!existsWithBloodGrp) {
      await connection.rollback();
      return res.status(400).json({
        message: "Donor not registered with this blood group",
        success: false
      });
    }

    // 3️⃣ Insert donation
    const donation_id = await insertDonation(connection, {
      donor_id,
      units_donated: units,
      bank_id
    });

    // 4️⃣ Insert stock
    await insertBloodStockWithLock(connection, {
      bank_id,
      blood_grp,
      units_available: units,
      donation_id
    });

    await connection.commit();

    try {
      await checkLowStockAndNotify(bank_id);
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

    return res.status(201).json({
      message: "Donation successful",
      success: true,
      donation_id,
      notification: {
        type: "success",
        text: "Donation added successfully"
      }
    });

  } catch (err) {
    await connection.rollback();
    console.log(err);

    return res.status(500).json({
      message: "Server error",
      success: false
    });

  } finally {
    connection.release();
  }
};
const getBloodBankDashboard = async (req, res) => {
  try {
    const bank_id = req.user.user_id;

    const data = await getDashboardData(bank_id);

    res.json({
      success: true,
      ...data
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
const getInventory = async (req, res) => {
  try {
    const bank_id = req.user.user_id;

    const data = await getInventoryData(bank_id);

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
const getRequests = async (req, res) => {
  try {
    const bank_id = req.user.user_id;

    const data = await getRequestData(bank_id);

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
const getDonations = async (req, res) => {
  try {
    const bank_id = req.user.user_id;

    const data = await getDonationHistory(bank_id);

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

const fulfillRequestRoute = async (req, res) => {
  const conn = await db.promise().getConnection();
  try {
    const bank_id = req.user.user_id;
    const { request_id } = req.params;
    await conn.beginTransaction();
    const result = await fulfillRequest(conn, {request_id, bank_id});
    if (!result.success) {
      await conn.rollback();
      return res.status(400).json(result);
    }
    await conn.commit();

    try {
      await notifyRequestApproved(result.hospital_id, request_id, bank_id);
      await notifyBloodIssued(result.hospital_id, request_id, result.issued_id, result.units_required);
      if (Number(result.units_required) >= LARGE_TRANSACTION_THRESHOLD) {
        await notifyLargeTransactionToAdmins(result.hospital_id, request_id, result.units_required);
      }
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

    return res.json({
      ...result,
      notification: {
        type: "success",
        text: "Request fulfilled successfully"
      }
    });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    conn.release();
  }
};

const rejectRequestRoute = async (req, res) => {
  const conn = await db.promise().getConnection();
  try {
    const bank_id = req.user.user_id;
    const { request_id } = req.params;
    await conn.beginTransaction();
    const result = await rejectRequest(conn, {request_id, bank_id});
    if (!result.success) {
      await conn.rollback();
      return res.status(400).json(result);
    }
    await conn.commit();

    try {
      await notifyRequestRejected(result.hospital_id, request_id, bank_id);
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

    return res.json({
      ...result,
      notification: {
        type: "warning",
        text: "Request rejected"
      }
    });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    conn.release();
  }
};

const adjustStockRoute = async (req, res) => {
  try {
    const { stock_id, bank_id, adjustment } = req.body;
    if (req.user.user_id !== bank_id) {
      return res.status(403).json({ success: false, message: "Unauthorized inventory update" });
    }
    const updated = await adjustStock(bank_id, stock_id, Number(adjustment));
    if (!updated) {
      return res.status(404).json({ success: false, message: "Stock row not found" });
    }
    return res.json({ success: true, message: "Inventory updated", stock: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const writeOffStockRoute = async (req, res) => {
  try {
    const bank_id = req.user.user_id;
    const { stock_id } = req.params;
    const ok = await writeOffStock(bank_id, stock_id);
    if (!ok) {
      return res.status(404).json({ success: false, message: "Stock row not found" });
    }
    return res.json({ success: true, message: "Stock written off" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
module.exports = {
  checkDonorRoute,
  addDonationRoute,
  getBloodBankDashboard,
  getInventory,
  getRequests,
  getDonations,
  fulfillRequestRoute,
  rejectRequestRoute,
  adjustStockRoute,
  writeOffStockRoute
};