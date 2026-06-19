require('dotenv').config()

const express = require('express')
const app = express()

const bcrypt = require('bcrypt')
const cors = require('cors')
const db = require('./config/db.js')
const jwt = require('jsonwebtoken')

const authRoutes = require('./Routes/authRoutes')
const appointmentRoutes = require('./Routes/appointmentRoutes')
const donorRoutes = require("./Routes/donorRoutes.js")
const bloodBankRoutes = require("./Routes/bloodBankRoutes.js")
const hospitalRoutes = require("./Routes/hospitalRoutes.js")
const profileSetupRoutes = require("./Routes/profileSetupRoutes.js")
const profileStatusRoute = require("./Routes/profileStatusRoutes.js")
const ownedBankRoutes = require("./Routes/ownedBankRoutes.js")
const userRoutes = require("./Routes/userRoutes.js")
const adminRoutes = require("./Routes/adminRoutes.js")
const publicRoutes = require("./Routes/publicRoutes.js")
const bankRoutes = require("./Routes/bankRoutes.js")
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
)


app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/setup', profileSetupRoutes)
app.use('/api/donor', donorRoutes)
app.use('/api/bloodbank', bloodBankRoutes)
app.use('/api/hospital', hospitalRoutes)
app.use('/api/profile/status', profileStatusRoute)
app.use('/api/ownedbank', ownedBankRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/bloodbanks', bankRoutes)

// Test route

app.get("/", (req, res) => {
  res.json({
    message: "API working",
    success: true
  })
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
