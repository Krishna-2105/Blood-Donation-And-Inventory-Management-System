const db=require("../config/db")

const getProfile=async (userId)=>{
    const rows=await db.promise().query(
        'select user_id,name,email,phone_no,user_type,created_dt from \`User\` where user_id=?',
        [userId]
    )
    return rows[0];
}

module.exports=getProfile