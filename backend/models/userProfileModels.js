const db = require("../config/db");

const getBaseUser = async (user_id) => {
  const [rows] = await db.promise().query(
    `SELECT user_id, name, email, phone_no, user_type, created_dt
     FROM \`User\`
     WHERE user_id = ?`,
    [user_id]
  );
  return rows[0] || null;
};

const getDonorExtra = async (donor_id) => {
  const [rows] = await db.promise().query(
    `SELECT blood_grp, dob
     FROM Donor
     WHERE donor_id = ?`,
    [donor_id]
  );
  return rows[0] || null;
};

const getOrgLocationExtra = async (organisation_id) => {
  const [rows] = await db.promise().query(
    `SELECT latitude, longitude
     FROM Organization_Location
     WHERE organisation_id = ?`,
    [organisation_id]
  );
  return rows[0] || null;
};

const getPasswordHash = async (user_id) => {
  const [rows] = await db.promise().query(
    `SELECT password_hash
     FROM \`User\`
     WHERE user_id = ?`,
    [user_id]
  );
  return rows[0]?.password_hash || null;
};

const updatePasswordHash = async (user_id, password_hash) => {
  const [result] = await db.promise().query(
    `UPDATE \`User\`
     SET password_hash = ?
     WHERE user_id = ?`,
    [password_hash, user_id]
  );
  return result.affectedRows > 0;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.promise().query(
    `SELECT user_id, email
     FROM \`User\`
     WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
};

module.exports = {
  getBaseUser,
  getDonorExtra,
  getOrgLocationExtra,
  getPasswordHash,
  updatePasswordHash,
  findUserByEmail,
};
