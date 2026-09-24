const db = require('../config/db');

// GET /api/bloodbanks/nearby?latitude=..&longitude=..&radius=..(km)
const nearbyBanks = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    // Haversine formula in SQL (distance in km)
    const q = `
      SELECT
        u.user_id AS bank_id,
        u.name AS bank_name,
        ol.address,
        ol.latitude,
        ol.longitude,
        SUM(bs.units_available) AS total_units,
        GROUP_CONCAT(DISTINCT bs.blood_grp SEPARATOR ',') AS available_blood_groups,
        (6371 * 2 * ASIN(SQRT(
          POWER(SIN(RADIANS(ol.latitude - ?)/2), 2) +
          COS(RADIANS(?)) * COS(RADIANS(ol.latitude)) * POWER(SIN(RADIANS(ol.longitude - ?)/2), 2)
        ))) AS distance
      FROM Blood_Stock bs
      JOIN Donation d ON bs.donation_id = d.donation_id
      JOIN ` + "`User`" + ` u ON bs.bank_id = u.user_id
      LEFT JOIN Organization_Location ol ON ol.organisation_id = bs.bank_id
      WHERE ol.latitude IS NOT NULL AND ol.longitude IS NOT NULL
        AND DATE_ADD(d.donation_date, INTERVAL 42 DAY) >= CURDATE()
      GROUP BY u.user_id, u.name, ol.address, ol.latitude, ol.longitude
      HAVING distance <= ?
      ORDER BY distance ASC
    `;

    const [rows] = await db.promise().query(q, [Number(latitude), Number(latitude), Number(longitude), Number(radius)]);

    // map available_blood_groups to array
    const mapped = rows.map(r => ({
      bank_id: r.bank_id,
      bank_name: r.bank_name,
      address: r.address || '',
      latitude: r.latitude,
      longitude: r.longitude,
      distance: Number(r.distance),
      total_units: Number(r.total_units || 0),
      available_blood_groups: r.available_blood_groups ? r.available_blood_groups.split(',') : []
    }));

    return res.json({ success: true, banks: mapped });
  } catch (err) {
    console.log('NEARBY BANKS ERR', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { nearbyBanks };
