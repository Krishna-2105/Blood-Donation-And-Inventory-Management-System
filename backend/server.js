require('dotenv').config()
const express=require('express')
const app=express()
const bcrypt=require('bcrypt')
const cors=require('cors')
const db=require('./config/db.js')
const jwt=require('jsonwebtoken')
const authRoutes=require('./Routes/authRoutes')

app.use(cors())
app.use(express.json())

app.use('/api/auth',authRoutes)

app.get("/",(req,res)=>{
    
})



app.listen(process.env.PORT,()=>{
    console.log(`Server runnnig on port ${process.env.PORT}`)
})