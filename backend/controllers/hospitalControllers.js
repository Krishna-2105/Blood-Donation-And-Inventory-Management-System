const {
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
} = require("../models/hospitalModels");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { notifyNewRequestToBank } = require("../services/notificationService");


// SEARCH BANKS
const searchBanksRoute = async (req, res) => {
  try {
    const hospital_id = req.user.user_id;

    const { blood_grp, units_required } = req.query;

    const location = await getHospitalLocation(hospital_id);

    if (!location.length) {
      return res.status(404).json({
        message: "Hospital location not found",
        success: false
      });
    }

    const { latitude, longitude } = location[0];

    const banks = await searchBanks(
      hospital_id,
      latitude,
      longitude,
      blood_grp,
      units_required
    );

    return res.status(200).json({
      banks,
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};


// SEND REQUEST
const sendRequestRoute = async (req, res) => {
    let conn;
    try {

        const hospital_id = req.user.user_id;
        const { blood_grp, units_required, priority, selected_banks } = req.body;
        const request_id = uuidv4();
        if (!Array.isArray(selected_banks) || selected_banks.length === 0) {
          return res.status(400).json({ message: "Select at least one bank", success: false });
        }
        conn = await db.promise().getConnection();
        await conn.beginTransaction();
        await createRequest(
          conn,
          request_id,
          hospital_id,
          blood_grp,
          units_required,
          priority || 1
        );
        for (const bank_id of selected_banks) {
          await sendRequestToBank(conn, request_id, bank_id);
        }
        await conn.commit();
        conn.release();

        try {
          for (const bank_id of selected_banks) {
            await notifyNewRequestToBank(bank_id, request_id, hospital_id);
          }
        } catch (e) {
          console.log("NOTIFICATION ERR:", e);
        }

        return res.status(200).json({
            message: "Request sent successfully",
            request_id,
            success: true,
            notification: {
              type: "success",
              text: "Blood request sent successfully"
            }
        });

    } catch (err) {
        if (conn) {
          await conn.rollback();
          conn.release();
        }
        console.log(err);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};



// GET HOSPITAL REQUESTS
// controllers/hospitalControllers.js

const getHospitalRequestsRoute = async (req, res) => {
  try {
    const hospital_id = req.user.user_id;

    const rows = await getHospitalRequests(hospital_id);

    const grouped = {};

    for (let row of rows) {
      if (!grouped[row.request_id]) {
        grouped[row.request_id] = {
          request_id: row.request_id,
          blood_grp: row.blood_grp,
          units_required: row.units_required,
          final_status: row.final_status,
          requested_date: row.requested_date,
          banks: []
        };
      }

      grouped[row.request_id].banks.push({
        bank_id: row.bank_id,
        bank_name: row.bank_name,
        status: row.request_status,
        issued_id: row.issued_id
      });
    }

    return res.json(Object.values(grouped));

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// CANCEL REQUEST
const cancelRequestRoute = async (req, res) => {
    let conn;
    try {

        const { request_id } = req.params;
        conn = await db.promise().getConnection();
        await conn.beginTransaction();
        const request = await getRequestById(conn, request_id);
        if (!request) {
          await conn.rollback();
          conn.release();
          return res.status(404).json({ success: false, message: "Request not found" });
        }
        if (request.hospital_id !== req.user.user_id) {
          await conn.rollback();
          conn.release();
          return res.status(403).json({ success: false, message: "Cannot cancel another hospital request" });
        }
        if (request.final_status !== "Processing") {
          await conn.rollback();
          conn.release();
          return res.status(400).json({ success: false, message: "Only processing requests can be cancelled" });
        }
        await cancelRequest(conn, request_id);
        await conn.commit();
        conn.release();

        return res.status(200).json({
            message: "Request cancelled successfully",
            success: true,
            notification: {
              type: "warning",
              text: "Request cancelled successfully"
            }
        });

    } catch (err) {
        if (conn) {
          await conn.rollback();
          conn.release();
        }
        console.log(err);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};



// CANCEL A SINGLE BANK REQUEST
const cancelBankRequestRoute = async (req, res) => {
    let conn;
    try {
        const { request_id, bank_id } = req.params;
        conn = await db.promise().getConnection();
        await conn.beginTransaction();

        const request = await getRequestById(conn, request_id);
        if (!request) {
          await conn.rollback();
          conn.release();
          return res.status(404).json({ success: false, message: "Request not found" });
        }
        if (request.hospital_id !== req.user.user_id) {
          await conn.rollback();
          conn.release();
          return res.status(403).json({ success: false, message: "Cannot cancel another hospital request" });
        }

        const result = await cancelBankRequest(conn, request_id, bank_id);
        if (!result.success) {
          await conn.rollback();
          conn.release();
          return res.status(400).json(result);
        }

        await conn.commit();
        conn.release();

        return res.status(200).json({
            ...result,
            notification: {
              type: "warning",
              text: "Bank request cancelled successfully"
            }
        });
    } catch (err) {
        if (conn) {
          await conn.rollback();
          conn.release();
        }
        console.log(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// BANK INCOMING REQUESTS
const incomingRequestsRoute = async (req, res) => {
    try {

        const { bank_id } = req.params;
        const requests = await getIncomingRequests(bank_id);

        return res.status(200).json({
            message: "Incoming requests fetched",
            requests,
            success: true
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

const getHospitalDashboardRoute = async (req, res) => {
  try {
    const hospital_id = req.user.user_id;
    const stats = await getHospitalDashboardStats(hospital_id);
    return res.status(200).json({ success: true, ...stats });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = {
  searchBanksRoute,
  sendRequestRoute,
  getHospitalRequestsRoute,
  cancelRequestRoute,
  cancelBankRequestRoute,
  incomingRequestsRoute,
  getHospitalDashboardRoute
};