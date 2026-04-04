const {
  checkDonorExists,
  insertDonor,
  checkBloodBankExists,
  insertBloodBank,
  checkHospitalExists,
  insertHospital
} = require("../models/profileSetupModels");

// Donor
const registerDonor = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { blood_grp, dob } = req.body;

    const exists = await checkDonorExists(user_id);
    if (exists) {
      return res.status(400).json({
        message: "Donor already registered",
        success: false
      });
    }

    await insertDonor({ user_id, blood_grp, dob });

    return res.status(201).json({
      message: "Donor registered successfully",
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


// Blood Bank
const registerBloodBank = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { latitude, longitude } = req.body;

    const exists = await checkBloodBankExists(user_id);
    if (exists) {
      return res.status(400).json({
        message: "Blood bank already registered",
        success: false
      });
    }

    await insertBloodBank({ user_id, latitude, longitude });

    return res.status(201).json({
      message: "Blood bank registered successfully",
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


// Hospital
const registerHospital = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { latitude, longitude } = req.body;

    const exists = await checkHospitalExists(user_id);
    if (exists) {
      return res.status(400).json({
        message: "Hospital already registered",
        success: false
      });
    }

    await insertHospital({ user_id, latitude, longitude });

    return res.status(201).json({
      message: "Hospital registered successfully",
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
  registerDonor,
  registerBloodBank,
  registerHospital
};