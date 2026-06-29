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

const getPublicBanks = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
          bs.bank_id,
          u.name AS bank_name,
          SUM(bs.units_available) AS units_available,
          ol.latitude,
          ol.longitude
      FROM Blood_Stock bs
      JOIN Donation d
          ON bs.donation_id = d.donation_id
      JOIN \`User\` u
          ON bs.bank_id = u.user_id
      LEFT JOIN Organization_Location ol
          ON ol.organisation_id = bs.bank_id
      WHERE DATE_ADD(d.donation_date, INTERVAL 42 DAY) >= CURDATE()
      GROUP BY
          bs.bank_id,
          u.name,
          ol.latitude,
          ol.longitude
      HAVING SUM(bs.units_available) > 0
      ORDER BY u.name ASC
      `);
    return res.json({ success: true, banks: rows });
  } catch (err) {
    console.log('GET BANKS ERR', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getPublicStats, getPublicBanks };
