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
    return { user_id, result: rows };
};

module.exports = {
  findUserByIdentifier,
  createUser,
};

// Additional admin user management helpers
const getUsers = async ({ role, limit, offset }) => {
  let sql = `SELECT user_id, name, email, phone_no, user_type, created_dt FROM \`User\``;
  const params = [];
  if (role) {
    sql += ` WHERE user_type = ?`;
    params.push(role);
  }
  sql += ` ORDER BY created_dt DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  const [rows] = await db.promise().query(sql, params);
  return rows;
};

const getUserById = async (user_id) => {
  const [rows] = await db.promise().query(
    `SELECT user_id, name, email, phone_no, user_type, created_dt, IFNULL(is_active,1) AS is_active FROM \`User\` WHERE user_id = ?`,
    [user_id]
  );
  return rows[0];
};

const updateUserById = async (user_id, { name, email, phone_no, user_type }) => {
  const fields = [];
  const params = [];
  if (name) {
    fields.push("name = ?");
    params.push(name);
  }
  if (email) {
    fields.push("email = ?");
    params.push(email);
  }
  if (phone_no) {
    fields.push("phone_no = ?");
    params.push(phone_no);
  }
  if (user_type) {
    fields.push("user_type = ?");
    params.push(user_type);
  }
  if (fields.length === 0) return false;
  params.push(user_id);
  const sql = `UPDATE \`User\` SET ${fields.join(', ')} WHERE user_id = ?`;
  const [result] = await db.promise().query(sql, params);
  return result.affectedRows > 0;
};

// ensure is_active column is present? We'll update the row using IFNULL to support older schema.
const setUserStatus = async (user_id, is_active) => {
  // try update is_active column; if column missing add it and retry
  try {
    const [result] = await db.promise().query(`UPDATE \`User\` SET is_active = ? WHERE user_id = ?`, [is_active ? 1 : 0, user_id]);
    return result.affectedRows > 0;
  } catch (err) {
    // If column doesn't exist, add it and retry once
    if (err && err.code === "ER_BAD_FIELD_ERROR") {
      await db.promise().query(`ALTER TABLE \`User\` ADD COLUMN is_active TINYINT(1) DEFAULT 1`);
      const [result2] = await db.promise().query(`UPDATE \`User\` SET is_active = ? WHERE user_id = ?`, [is_active ? 1 : 0, user_id]);
      return result2.affectedRows > 0;
    }
    throw err;
  }
};

const deleteUserById = async (user_id) => {
  const [result] = await db.promise().query(`DELETE FROM \`User\` WHERE user_id = ?`, [user_id]);
  return result.affectedRows > 0;
};

// export additional functions
module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.updateUserById = updateUserById;
module.exports.setUserStatus = setUserStatus;
module.exports.deleteUserById = deleteUserById;
