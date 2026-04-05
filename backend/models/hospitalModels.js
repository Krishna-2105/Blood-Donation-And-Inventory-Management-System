const db = require("../config/db");

// get hospital location
const getHospitalLocation = async (hospital_id) => {

    const [rows] = await db.promise().query(
        `SELECT latitude, longitude
         FROM Organization_Location
         WHERE organisation_id = ?`,
        [hospital_id]
    );

    return rows;
};


// search banks
const searchBanks = async (latitude, longitude, blood_grp, units_required) => {

    const [rows] = await db.promise().query(
        `
        SELECT 
            bs.bank_id,
            u.name AS bank_name,
            SUM(bs.units_available) AS units_available,
            (6371 * ACOS(
                COS(RADIANS(?)) *
                COS(RADIANS(ol.latitude)) *
                COS(RADIANS(ol.longitude) - RADIANS(?)) +
                SIN(RADIANS(?)) *
                SIN(RADIANS(ol.latitude))
            )) AS distance
        FROM Blood_Stock bs
        JOIN User u ON bs.bank_id = u.user_id
        JOIN Organization_Location ol ON bs.bank_id = ol.organisation_id
        WHERE bs.blood_grp = ? AND u.user_type='bank'
        GROUP BY bs.bank_id
        HAVING SUM(bs.units_available) >= ?
        ORDER BY distance ASC
        `,
        [latitude, longitude, latitude, blood_grp, units_required]
    );

    return rows;
};


// create request
const createRequest = async (hospital_id, blood_grp, units_required, priority) => {

    const [result] = await db.promise().query(
        `INSERT INTO Blood_Request_from_hospital
        (hospital_id, blood_grp, units_required, priority)
        VALUES (?, ?, ?, ?)`,
        [hospital_id, blood_grp, units_required, priority]
    );

    return result;
};


// send request to bank
const sendRequestToBank = async (request_id, bank_id) => {

    const [result] = await db.promise().query(
        `INSERT INTO Requests_sent_to_BloodBanks
        (request_id, bank_id, request_status)
        VALUES (?, ?, 'Processing')`,
        [request_id, bank_id]
    );

    return result;
};


// get hospital requests
const getHospitalRequests = async (hospital_id) => {

    const [rows] = await db.promise().query(
        `SELECT *
         FROM Blood_Request_from_hospital
         WHERE hospital_id = ?
         ORDER BY requested_date DESC`,
        [hospital_id]
    );

    return rows;
};


// cancel request
const cancelRequest = async (request_id) => {

    const [result] = await db.promise().query(
        `UPDATE Blood_Request_from_hospital
         SET final_status='Cancelled'
         WHERE request_id=?`,
        [request_id]
    );

    return result;
};


// bank incoming requests
const getIncomingRequests = async (bank_id) => {

    const [rows] = await db.promise().query(
        `
        SELECT r.request_id,
               r.blood_grp,
               r.units_required,
               r.priority,
               r.hospital_id,
               u.name AS hospital_name,
               s.request_status
        FROM Requests_sent_to_BloodBanks s
        JOIN Blood_Request_from_hospital r
        ON s.request_id = r.request_id
        JOIN User u
        ON r.hospital_id = u.user_id
        WHERE s.bank_id=?
        `,
        [bank_id]
    );

    return rows;
};


module.exports = {
    getHospitalLocation,
    searchBanks,
    createRequest,
    sendRequestToBank,
    getHospitalRequests,
    cancelRequest,
    getIncomingRequests
};