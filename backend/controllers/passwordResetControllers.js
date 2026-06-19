const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { findUserByEmail, updatePasswordHash } = require("../models/userProfileModels");

// In-memory token store (no DB, no email)
// token -> { user_id, createdAt }
// The entire password-reset controller is commented out so the logic can be re-used later if needed.
/*
const resetTokens = {};
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

const forgotPasswordRoute = async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const token = uuidv4();
    resetTokens[token] = { user_id: user.user_id, createdAt: Date.now() };

    return res.json({
      success: true,
      reset_token: token,
      message: "Reset token generated",
      notification: { type: "success", text: "Reset token generated" },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPasswordRoute = async (req, res) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    const new_password = typeof req.body?.new_password === "string" ? req.body.new_password : "";

    if (!token || !new_password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const entry = resetTokens[token];
    if (!entry) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
    if (Date.now() - entry.createdAt > TOKEN_TTL_MS) {
      delete resetTokens[token];
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const hash = await bcrypt.hash(new_password, 10);
    await updatePasswordHash(entry.user_id, hash);

    delete resetTokens[token];

    return res.json({
      success: true,
      message: "Password reset successfully",
      notification: { type: "success", text: "Password reset successfully" },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  forgotPasswordRoute,
  resetPasswordRoute,
};
*/
