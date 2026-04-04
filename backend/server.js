require('dotenv').config()

const express = require('express')
const app = express()

const bcrypt = require('bcrypt')
const cors = require('cors')
const db = require('./config/db.js')
const jwt = require('jsonwebtoken')

const authRoutes = require('./Routes/authRoutes')
const donorRoutes = require("./Routes/donorRoutes.js")
const hospitalRoutes = require("./Routes/hospitalRoutes.js")

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
)

app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/donor', donorRoutes)
app.use('/api/hospital', hospitalRoutes)


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