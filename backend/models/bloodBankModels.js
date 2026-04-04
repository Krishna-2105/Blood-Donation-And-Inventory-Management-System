// Check donor exists
const checkDonorExists = async (conn, donor_id) => {
  const [rows] = await conn.query(
    "SELECT 1 FROM Donor WHERE donor_id = ?",
    [donor_id]
  );
  return rows.length > 0;
};

// Insert donation
const insertDonation = async (conn, { donor_id, units_donated, bank_id }) => {
  const [result] = await conn.query(
    `INSERT INTO Donation 
     (donor_id, units_donated, donation_date, bank_id)
     VALUES (?, ?, CURDATE(), ?)`,
    [donor_id, units_donated, bank_id]
  );

  return result.insertId;
};

// MAX + 1 + LOCK
const insertBloodStockWithLock = async (
  conn,
  { bank_id, blood_grp, units_available, donation_id }
) => {

  const [rows] = await conn.query(
    `SELECT COALESCE(MAX(stock_id), 0) AS max_id
     FROM Blood_Stock
     WHERE bank_id = ?
     FOR UPDATE`,
    [bank_id]
  );

  const nextStockId = rows[0].max_id + 1;

  await conn.query(
    `INSERT INTO Blood_Stock
     (stock_id, bank_id, blood_grp, units, collection_dt, donation_id)
     VALUES (?, ?, ?, ?, CURDATE(), ?)`,
    [nextStockId, bank_id, blood_grp, units_available, donation_id]
  );
};

module.exports = {
  checkDonorExists,
  insertDonation,
  insertBloodStockWithLock
};