const {
  getUserType,
  checkDonor,
  checkHospital,
  checkBloodBank
} = require("../models/profileModels");

const profileStatusRoute = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const user_type = await getUserType(user_id);

    let profile_complete = false;

    if (user_type === "donor") {
      profile_complete = await checkDonor(user_id);
    }

    else if (user_type === "hospital") {
      profile_complete = await checkHospital(user_id);
    }

    else if (user_type === "blood_bank") {
      profile_complete = await checkBloodBank(user_id);
    }

    else if (user_type === "admin") {
      profile_complete = true; // no extra profile
    }

    res.json({
      user_type,
      profile_complete
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = profileStatusRoute;