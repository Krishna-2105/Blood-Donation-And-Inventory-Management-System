const roleMiddleware = (role) => {
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({message:"Unauthorized",success:false})
        }

        const prefix = req.user.user_id.slice(0, 3);
       if(prefix!==role)
       {
        return res.status(403).json({message:"Access Denied",success:false})
       }
        next();
    };
}; 

module.exports=roleMiddleware
