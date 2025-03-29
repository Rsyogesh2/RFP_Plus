// src/app.js
const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const db = require('./config/db');
const dataRoutes = require('./routes/dataRoutes');
const globalUserRoutes = require('./routes/globalUserRoutes');
const resetPasswordRoute = require('./routes/resetPassword');

const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); // Consider using for password hashing
const jwt = require('jsonwebtoken'); // Consider using for authentication
const login = require('./login/login');
const addUsers = require('./routes/addUsers');
const scoringCriteria = require('./routes/scoringCriteria');
// const bcrypt = require("bcryptjs");

// Allow requests from the frontend



require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// 
// Increase the payload limit
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.json());
const cors = require('cors');

app.use(cors({
  // origin: 'https://rfp-plus.vercel.app', // Allow only the frontend URL
  // origin: 'https://rfp-plus.onrender.com', // Allow only the frontend URL
  orgin:"http://localhost:5000",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials (cookies, authorization headers)
}));

app.use('/', login);
app.use('/', addUsers);
app.use('/', scoringCriteria);
app.use('/', resetPasswordRoute);
// Home route
// app.use(express.static(path.join(__dirname, 'client/build')));

// API routes (if any)
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});
// Mount the API routes under `/api`
app.use('/api', dataRoutes);

app.use('/', globalUserRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// async function createGlobalUser(){
//     const password = "system@123";
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
      
//     const query1 = "INSERT INTO Users_Login (Username, Password,Role,Entity_Name) VALUES (?, ?,?, ?)";
//     db.query(query1, ["AdminUser", hashedPassword,"Global Admin","AppControl"], (err, results) => {
//         if (err) throw err;
//         console.log("User created!");
//     }) }
//   createGlobalUser()