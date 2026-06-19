const db=require("../config/db")

const getDonorDetails=async (donorId)=>{
     const [rows] = await db.promise().query(
        'select * from Donor where donor_id=?',
        [donorId]
    );
    return rows[0];
}

const getHistory=async (donorId)=>{
    const [rows]=await db.promise().query(
        "select d.donation_id,b.name,d.donation_date,dnr.blood_grp,d.units_donated from Donation d join Donor dnr on dnr.donor_id=d.donor_id join \`User\` b on b.user_id=d.bank_id where d.donor_id=?",
        [donorId]
    )
    return rows;
}

const getLastDonation = async (donorId) => {
    const [rows] = await db.promise().query(
        "SELECT donation_date FROM Donation WHERE donor_id = ? ORDER BY donation_date DESC LIMIT 1",
        [donorId]
    );

    return rows[0]; 
};

const getDonorEligibility = async (donorId) => {
    const last = await getLastDonation(donorId);
    if (!last || !last.donation_date) {
        return { eligible: true, nextEligibleDate: null };
    }
    const lastDate = new Date(last.donation_date);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 90);
    const today = new Date();
    const diff = (nextDate - today) / (1000 * 60 * 60 * 24);
    if (diff > 0) {
        return { eligible: false, nextEligibleDate: nextDate.toISOString().slice(0,10), days_left: Math.ceil(diff) };
    }
    return { eligible: true, nextEligibleDate: nextDate.toISOString().slice(0,10) };
}
module.exports={
    getDonorDetails,getHistory,getLastDonation,getDonorEligibility
};
