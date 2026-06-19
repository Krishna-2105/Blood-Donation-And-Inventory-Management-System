const express=require('express')
const router=express.Router()
const jwt=require('jsonwebtoken')
const loginUser=require('../controllers/loginUser')
const signupUser=require('../controllers/signupUser')
// const { forgotPasswordRoute, resetPasswordRoute } = require("../controllers/passwordResetControllers");

router.post('/login',loginUser)
router.post('/signup',signupUser)
// Forgot/reset-password endpoints are commented out. To re-enable, uncomment the import above and these routes.
// router.post("/forgot-password", forgotPasswordRoute);
// router.post("/reset-password", resetPasswordRoute);

module.exports=router
