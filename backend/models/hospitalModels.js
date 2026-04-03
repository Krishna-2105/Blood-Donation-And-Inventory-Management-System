const db=require("../config/db")

const getRequests=async (hsptlId)=>{
    const [rows]=await db.promise().query(
       "select " ,[hsptlId]
    )
}