const db = require("../config/db");

const {
  checkDonorExists,
  insertDonation,
  insertBloodStockWithLock
} = require("../models/bloodBankModels");

const addDonationRoute = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const { donor_id, units, blood_grp } = req.body;
    const bank_id = req.user.user_id;

    await connection.beginTransaction();

    // 1. Check donor
    const exists = await checkDonorExists(connection, donor_id);
    if (!exists) {
      await connection.rollback();
      return res.status(404).json({
        message: "Donor not registered",
        success: false
      });
    }

    // 2. Insert donation
    const donation_id = await insertDonation(connection, {
      donor_id,
      units_donated: units,
      bank_id
    });

    // 3. Insert stock (MAX+1+LOCK)
    await insertBloodStockWithLock(connection, {
      bank_id,
      blood_grp,
      units,
      donation_id
    });

    await connection.commit();

    return res.status(201).json({
      message: "Donation stored successfully",
      success: true
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

module.exports = {
  addDonationRoute
};