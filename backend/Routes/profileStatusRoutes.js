const express=require("express")
const authMiddleWare = require("../middleware/authMiddleWare")
const profileStatusRoute=require("../controllers/profileController")
const router=express.Router()

router.get("/",authMiddleWare,profileStatusRoute)

module.exports=router