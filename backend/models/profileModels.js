const db=require("../config/db")

const getProfile=async (userId)=>{
    const rows=await db.promise().query(
        'select user_id,name,email,phone_no,user_type,created_dt from \`User\` where user_id=?',
        [userId]
    )
    return rows[0];
}


// get user type
const getUserType = async (user_id) => {
  const [rows] = await db.promise().query(
    "SELECT user_type FROM User WHERE user_id = ?",
    [user_id]
  );
  return rows[0]?.user_type;
};

// check donor profile
const checkDonor = async (user_id) => {
  const [rows] = await db.promise().query(
    "SELECT donor_id FROM Donor WHERE donor_id = ?",
    [user_id]
  );
  return rows.length > 0;
};

// check hospital profile
const checkHospital = async (user_id) => {
  const [rows] = await db.promise().query(
    "SELECT hospital_id FROM Hospital WHERE hospital_id = ?",
    [user_id]
  );
  return rows.length > 0;
};

// check blood bank profile
const checkBloodBank = async (user_id) => {
  const [rows] = await db.promise().query(
    "SELECT bank_id FROM Blood_Bank WHERE bank_id = ?",
    [user_id]
  );
  return rows.length > 0;
};

module.exports = {
    getProfile,
  getUserType,
  checkDonor,
  checkHospital,
  checkBloodBank
};
