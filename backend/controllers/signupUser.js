const { createUser } = require("../models/userModels");
const { notifyNewRegistrationToAdmins } = require("../services/notificationService");

const signupUser = async (req, res) => {
  try {
    const rawName = req.body?.name;
    const rawEmail = req.body?.email;
    const rawPhone = req.body?.phone_no;
    const rawPassword = req.body?.password;
    const rawUserType = req.body?.user_type;

    const name = typeof rawName === "string" ? rawName.trim() : "";
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const phone_no = typeof rawPhone === "string" ? rawPhone.trim() : "";
    const password = typeof rawPassword === "string" ? rawPassword.trim() : "";
    const user_type = typeof rawUserType === "string" ? rawUserType.trim() : "";
    // Public signup allowed roles (admin cannot be self-registered)
    const allowedUserTypes = ["donor", "hospital", "blood_bank"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !password || !user_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!allowedUserTypes.includes(user_type)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // Explicit rejection for admin role even if provided
    if (user_type === "admin") {
      return res.status(403).json({ message: "Cannot register as admin" });
    }

    const created = await createUser({
      name,
      email,
      phone_no,
      password,
      user_type,
    });

    // server generates ids; enforce prefix correctness
    if (user_type === "admin" && !created.user_id.startsWith("ADM")) {
      return res.status(400).json({ message: "Admin ID must start with ADM" });
    }

    try {
      await notifyNewRegistrationToAdmins(created.user_id, user_type);
    } catch (e) {
      console.log("NOTIFICATION ERR:", e);
    }

    res.status(201).json({
      message: "User registered successfully",
      success:true,
      user_id: created.user_id
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    console.log("SIGNUP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = signupUser;
