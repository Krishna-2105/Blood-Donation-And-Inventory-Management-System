const db = require("../config/db");
const bcrypt = require("bcrypt");

// 🔹 Generate User ID (USR + timestamp)
const generateUserId = (user_type) => {
  let prefix = "";

  switch (user_type) {
    case "donor":
      prefix = "DNR";
      break;
    case "hospital":
      prefix = "HSP";
      break;
    case "blood_bank":
      prefix = "BNK";
      break;
      case "admin":
        prefix="ADM";
    default:
      prefix = "USR";
  }

  return prefix + Date.now().toString().slice(-6); // Example: HSP839201 , ensures uniqueness
};

// 🔹 Find user by email OR user_id
const findUserByIdentifier = async (identifier) => {
  const [rows]=await db.promise().query(
    "select * from \`User\` where user_id=? or email=?",[identifier,identifier]
  )
  return rows[0];
};

// 🔹 Create new user
const createUser =async ({ name, email, phone_no, password, user_type }) => {
    const user_id=generateUserId(user_type)
    const password_hash= await bcrypt.hash(password,10)

    const [rows]=await db.promise().query(
      "insert into \`User\` (user_id,name,email,phone_no,password_hash,user_type,created_dt) values(?,?,?,?,?,?,CURDATE())",
      [user_id,name,email,phone_no,password_hash,user_type]
    )
    return rows;
};

module.exports = {
  findUserByIdentifier,
  createUser,
};