const db = require("../config/db");

// DONOR
const checkDonorExists = async (user_id) => {
  const [rows] = await db.promise().query(
    "SELECT 1 FROM Donor WHERE donor_id = ?",
    [user_id]
  );
  return rows.length > 0;
};

const insertDonor = async ({ user_id, blood_grp, dob }) => {
  await db.promise().query(
    `INSERT INTO Donor (donor_id, blood_grp, dob)
     VALUES (?, ?, ?)`,
    [user_id, blood_grp, dob]
  );
};


// BLOOD BANK
const checkBloodBankExists = async (user_id) => {
  const [rows] = await db.promise().query(
    "SELECT 1 FROM Blood_Bank WHERE bank_id = ?",
    [user_id]
  );
  return rows.length > 0;
};

const insertBloodBank = async ({ user_id, latitude, longitude }) => {
  await db.promise().query(
    `INSERT INTO Blood_Bank (bank_id)
     VALUES (?)`,
    [user_id]
  );

  // Optional: Organization table
  await db.promise().query(
    `INSERT INTO Organization (organization_id, latitude, longitude)
     VALUES (?, ?, ?)`,
    [user_id, latitude, longitude]
  );
};


// HOSPITAL
const checkHospitalExists = async (user_id) => {
  const [rows] = await db.promise().query(
    "SELECT 1 FROM Hospital WHERE hospital_id = ?",
    [user_id]
  );
  return rows.length > 0;
};

const insertHospital = async ({ user_id, latitude, longitude }) => {
  await db.promise().query(
    `INSERT INTO Hospital (hospital_id)
     VALUES (?)`,
    [user_id]
  );

  await db.promise().query(
    `INSERT INTO Organization (organization_id, latitude, longitude)
     VALUES (?, ?, ?)`,
    [user_id, latitude, longitude]
  );
};

module.exports = {
  checkDonorExists,
  insertDonor,
  checkBloodBankExists,
  insertBloodBank,
  checkHospitalExists,
  insertHospital
};