const jwt=require("jsonwebtoken")

const authMiddleWare=(req,res,next)=>{
    try{

        const authHeader=req.headers.authorization;
        if(!authHeader)
        {
            return res.status(401).json({message:"No token provided",success:false})

        }
        const parts=authHeader.split(" ");
        if(parts.length!==2)
        {
            return res.status(401).json({message:"Invalid token format",success:false})
        }
        const token=parts[1]
        console.log("TOKEN:", token);
        const decoded=jwt.verify(token,"secret21")
        req.user=decoded

        next()
    }
    catch(err){
        return res.status(403).json({message:"Invalid or Expired Token",success:false})
    }
}

module.exports=authMiddleWare