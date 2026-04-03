const express = require("express");
const router = express.Router();

const authMiddleWare = require("../middleware/authMiddleWare");
const roleMiddleware = require("../middleware/roleMiddleWare");

const getProfile = require("../models/profileModels");
const {getDetails, getHistory,getLastDonation} = require("../models/donorModels");


// Base route (optional test)
router.get(
    '/',
    authMiddleWare,
    roleMiddleware("DNR"),
    (req, res) => {
        res.json({ message: "Donor route working", success: true });
    }
);

// Profile route
router.get(
    '/profile',
    authMiddleWare,
    roleMiddleware("DNR"),
    async (req, res) => {
        try {
            const userId = req.user.user_id;

            const profile = await getProfile(userId);
            if (!profile) {
                return res.status(404).json({
                    message: "Profile not found",
                    success: false
                });
            }

            const details = await getDetails(userId);
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
);

router.get('/history',authMiddleWare,roleMiddleware("DNR"),async (req,res)=>{
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
        return res.status(500).json({
            message:"Server Error",
            success:false
        })
    }
})

router.get(
  '/lastdt',
  authMiddleWare,
  roleMiddleware("DNR"),
  async (req, res) => {
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
});
module.exports = router;