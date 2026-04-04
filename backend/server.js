require('dotenv').config()
const express=require('express')
const app=express()
const bcrypt=require('bcrypt')
const cors=require('cors')
const db=require('./config/db.js')
const jwt=require('jsonwebtoken')
const authRoutes=require('./Routes/authRoutes')
const donorRoutes=require("./Routes/donorRoutes.js")
const bloodBankRoutes = require("./Routes/bloodBankRoutes")
const profileSetupRoutes = require("./Routes/profileSetupRoutes")

app.use(
  cors({
    origin: "http://localhost:5173", // your React app URL
    credentials: true,
  })
);
app.use(express.json())

app.use('/api/auth',authRoutes)
app.use("/api/setup", profileSetupRoutes)
app.use('/api/donor',donorRoutes)
app.use('/api/bloodbank',bloodBankRoutes)
// app.use('/api/hospital',hospitalRoutes)
app.get("/",(req,res)=>{
    
})



app.listen(process.env.PORT,()=>{
    console.log(`Server runnnig on port ${process.env.PORT}`)
})