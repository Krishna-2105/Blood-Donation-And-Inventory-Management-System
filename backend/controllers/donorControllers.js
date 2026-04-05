// const getProfile = require("../models/profileModels");
const {getDonorDetails,getHistory,getLastDonation}=require("../models/donorModels")
const {getProfile}=require("../models/profileModels")
const donorProfileRoute=async (req,res)=>{
      try {
            const userId = req.user.user_id;

            const profile = await getProfile(userId);
            if (!profile) {
                return res.status(404).json({
                    message: "Profile not found",
                    success: false
                });
            }

            const details = await getDonorDetails(userId);
            if (!details) {
                return res.status(404).json({
                    message: "Donor details not found",
                    success: false
                });
            }

            return res.status(200).json({
                message: "Got the user profile",
                profile,
                details,
                success: true
            });

        } catch (err) {
            return res.status(500).json({
                message: "Server error",
                success: false
            });
        }
}

const historyRoute=async (req,res)=>{
     try{
        const userId=req.user.user_id

        const history=await getHistory(userId)
        return res.status(200).json({
            message:"Got Donor History",
            history,
            success:true
        })
    }   
    catch(err){
        console.log(err)
        return res.status(500).json({
            message:"Server Error",
            success:false
        })
    }
}

const lastDonationRoute=async (req,res)=>{
     try {
        const userId = req.user.user_id;  

        const lastDonation = await getLastDonation(userId);

        if (!lastDonation) {
            return res.status(404).json({
                message: "No donations found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Last donation fetched",
            lastDonation,
            success: true
        });

    } catch (err) {
        console.log("ERROR:", err); 
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
}

module.exports={
    donorProfileRoute,historyRoute,lastDonationRoute
}   