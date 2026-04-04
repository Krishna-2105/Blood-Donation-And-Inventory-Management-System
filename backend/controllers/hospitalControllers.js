const BloodRequest = require("../models/hospitalModels");


// SEARCH BANKS
const searchBanksRoute = async (req, res) => {
    try {

        const { hospital_id, blood_grp, units_required } = req.body;

        const location = await BloodRequest.getHospitalLocation(hospital_id);

        if (!location.length) {
            return res.status(404).json({
                message: "Hospital location not found",
                success: false
            });
        }

        const { latitude, longitude } = location[0];

        const banks = await BloodRequest.searchBanks(
            latitude,
            longitude,
            blood_grp,
            units_required
        );

        return res.status(200).json({
            message: "Banks fetched successfully",
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
    try {

        const { hospital_id, blood_grp, units_required, priority, selected_banks } = req.body;

        const result = await BloodRequest.createRequest(
            hospital_id,
            blood_grp,
            units_required,
            priority || 1
        );

        const request_id = result.insertId;

        // send request to selected banks
        if (selected_banks && selected_banks.length) {

            for (const bank_id of selected_banks) {
                await BloodRequest.sendRequestToBank(request_id, bank_id);
            }

        }

        return res.status(200).json({
            message: "Request sent successfully",
            request_id,
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



// GET HOSPITAL REQUESTS
// controllers/hospitalControllers.js
const getHospitalRequestsRoute = async (req, res) => {
  try {
    const hospital_id = req.user.user_id; // <- from JWT
    const requests = await BloodRequest.getHospitalRequests(hospital_id);

    return res.status(200).json({
      message: "Requests fetched successfully",
      requests,
      success: true
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error", success: false });
  }
};



// CANCEL REQUEST
const cancelRequestRoute = async (req, res) => {
    try {

        const { request_id } = req.params;

        await BloodRequest.cancelRequest(request_id);

        return res.status(200).json({
            message: "Request cancelled successfully",
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



// BANK INCOMING REQUESTS
const incomingRequestsRoute = async (req, res) => {
    try {

        const { bank_id } = req.params;

        const requests = await BloodRequest.getIncomingRequests(bank_id);

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


module.exports = {
    searchBanksRoute,
    sendRequestRoute,
    getHospitalRequestsRoute,
    cancelRequestRoute,
    incomingRequestsRoute
};