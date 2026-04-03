const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

    const token = jwt.sign(
      {
        user_id: user.user_id,
      },
      "secret21",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = loginUser;