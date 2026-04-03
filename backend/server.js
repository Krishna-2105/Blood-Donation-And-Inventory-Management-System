require('dotenv').config()
const express=require('express')
const app=express()
const bcrypt=require('bcrypt')
const cors=require('cors')
const db=require('./config/db.js')
const jwt=require('jsonwebtoken')
const authRoutes=require('./Routes/authRoutes')
const donorRoutes=require("./Routes/donorRoutes.js")
app.use(
  cors({
    origin: "http://localhost:5173", // your React app URL
    credentials: true,
  })
);
app.use(express.json())

app.use('/api/auth',authRoutes)
app.use('/api/',donorRoutes)
app.get("/",(req,res)=>{
    
})



app.listen(process.env.PORT,()=>{
    console.log(`Server runnnig on port ${process.env.PORT}`)
})