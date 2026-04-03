const db=require("../config/db")

const getDonorDetails=async (donorId)=>{
     const rows=await db.promise().query(
        'select * from Donor where donor_id=?',
        [donorId]
    )
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
module.exports={
    getDonorDetails,getHistory,getLastDonation
};


