const db = require("../config/db");

const getPublicStats = async (req, res) => {
  try {
    const [[users]] = await db.promise().query(`SELECT COUNT(*) AS users_count FROM ` + "`User`" );
    const [[donors]] = await db.promise().query(`SELECT COUNT(*) AS donors_count FROM Donor`);
    const [[donations]] = await db.promise().query(`SELECT COUNT(*) AS donations_count FROM Donation`);
    const [[requests]] = await db.promise().query(`SELECT COUNT(*) AS requests_count FROM Blood_Request_from_hospital`);

    return res.json({ success: true, data: {
      users: users.users_count || 0,
      donors: donors.donors_count || 0,
      donations: donations.donations_count || 0,
      requests: requests.requests_count || 0,
    }});
  } catch (err) {
    console.log('PUBLIC STATS ERR', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getPublicStats };
