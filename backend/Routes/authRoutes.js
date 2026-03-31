const express=require('express')
const router=express.Router()
const jwt=require('jsonwebtoken')
const loginUser=require('./controllers/loginUser')
const signupUser=require('./controllers/signupUser')

router.post('/login',loginUser)
router.post('/signup',signupUser)

module.exports=router