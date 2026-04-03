const { createUser } = require("../models/userModels");

const signupUser = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, phone_no, password, user_type } = req.body;

    if (!name || !email || !password || !user_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await createUser({
      name,
      email,
      phone_no,
      password,
      user_type,
    });

    res.status(201).json({
      message: "User registered successfully",
      success:true
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Email or phone already exists",
      });
    }
    console.log("SIGNUP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = signupUser;