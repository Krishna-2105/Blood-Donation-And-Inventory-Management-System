const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // make sure this is imported
const { findUserByIdentifier } = require("../models/userModels");

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await findUserByIdentifier(identifier);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 🔥 get role
    const user_type = user.user_type;

    // 🔥 check if profile complete
    let profile_complete = false;
    let has_blood_bank = false;
    let bank_id = null;

    if (user_type === "donor") {
      const [rows] = await db.promise().query(
        "SELECT * FROM Donor WHERE donor_id = ?",
        [user.user_id]
      );
      profile_complete = rows.length > 0;
    }

    if (user_type === "hospital") {
      const [rows] = await db.promise().query(
        "SELECT * FROM Hospital WHERE hospital_id = ?",
        [user.user_id]
      );
      profile_complete = rows.length > 0;

      const [bank] = await db.promise().query(
        "SELECT bank_id FROM Owns WHERE hospital_id = ?",
        [user.user_id]
      );
      has_blood_bank = bank.length > 0;
      bank_id = bank[0]?.bank_id || null;
    }

    if (user_type === "blood_bank") {
      const [rows] = await db.promise().query(
        "SELECT * FROM Blood_Bank WHERE bank_id = ?",
        [user.user_id]
      );
      profile_complete = rows.length > 0;
      has_blood_bank = true;
      // for blood_bank users, bank_id is the same as user_id
      bank_id = user.user_id;
    }

    if (user_type === "admin") {
      // admin has no setup tables
      profile_complete = true;
      has_blood_bank = false;
    }

    // 🔥 generate token
    const token = jwt.sign(
      { user_id: user.user_id, user_type, bank_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 🔥 send everything
    res.json({
      message: "Login successful",
      token,
      user_id: user.user_id,
      user_type,
      profile_complete,
      has_blood_bank,
      bank_id,
      success: true
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = loginUser;
