const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); // Consider using for password hashing
const jwt = require('jsonwebtoken'); // Consider using for authentication

// const bcrypt = require("bcryptjs");


require('dotenv').config();
// 

// app.use(bodyParser.json());
const SECRET_KEY = process.env.LOGINKEY; // Use an environment variable in production

router.post("/api/login", async (req, res) => {
    console.log("POST /api/login endpoint hit");
  
    const { username, password } = req.body;
    console.log("Received data:", { username, password }); // Avoid logging password in production
  
    // SQL query
    const query = "SELECT * FROM Users_Login WHERE Username = ?";
    // console.log("Executing query:", query);
  
    try {
      // Use the promise-based `execute` method
      const [results] = await db.execute(query, [username]);
      // console.log(results.Role);
      // console.log("Query results:", results);
  
      // Check if user exists
      if (results.length === 0) {
        console.log("User not found");
        return res.status(404).json({ message: "User not found" });
      }
  
      const user = results[0];
      console.log("Fetched user:", user);
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.Password);
      console.log("Password validation result:", isPasswordValid);
  
      if (!isPasswordValid) {
        console.log("Invalid credentials");
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
        expiresIn: "1h",
      });
      // const roles = results.map((row) => row.Role);

      console.log("Generated token:", token);
      res.json({ token });
  
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.post("/api/get-roles", async (req, res) => {
    try {
      const { username } = req.body;
  
      // Fetch roles for the user
      const query = `SELECT Role FROM Users_Login WHERE Username = ?`;
      
      const [results] = await db.execute(query, [username]);
      const query1 = `SELECT uma.user_name AS userName, 
       uma.rfp_no AS rfpNo, 
       uma.entity_name AS entityName, 
       uma.is_active AS isActive, 
       uma.date_from AS dateFrom, 
       uma.date_to AS dateTo, 
       uma.is_maker AS isMaker, 
       uma.is_authorizer AS isAuthorizer, 
       uma.is_reviewer AS isReviewer, 
       uma.module_name AS moduleName, 
       uma.createdby AS createdBy
        FROM user_modules_assignment AS uma
        INNER JOIN Users_Table AS ut 
            ON uma.createdby = ut.createdby AND uma.user_name = ut.user_name
        WHERE ut.email = ?;
        `;
        const [results1] = await db.execute(query1, [username]);
        console.log(results1)
      if (results.length === 0) {
        return res.status(404).json({ message: "No roles found for this user." });
      }
      if(results[0].Role=="Super Admin"){
        console.log("super Admin")
      const querysuperAdmin = `SELECT valid_from, valid_to FROM superadmin_users WHERE super_user_email=?`;
      const [superAdminValidity] = await db.execute(querysuperAdmin, [username]);
      console.log(superAdminValidity)
      if (superAdminValidity && superAdminValidity.length > 0) {
          const { valid_from, valid_to } = superAdminValidity[0]; // Destructure the fetched data
      
          // Parse the database dates to JavaScript Date objects
          const validFromDate = new Date(valid_from);
          const validToDate = new Date(valid_to);
          const today = new Date(); // Today's date
      
          // Check if today's date is within the range
          const isValid = today >= validFromDate && today <= validToDate;
      
          console.log("Is valid:", isValid);
          const roles = results.map((row) => row.Role);
          
          return res.json({ roles }); // Return true or false
      } else {
          console.log("No validity data found");
          return res.status(404).json({ message: "No validity for this user." });
      }
      }
      // Extract roles and send as an array
      const roles = results.map((row) => row.Role);
      res.json({ roles,results1 });
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  
// Protected Route
router.get("/api/protected", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    res.json({ message: "Protected content", user: decoded });
  });
});


// async function insertdat() {
//   const password = "system@123"; // Replace with the user's password
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);
  
//   const query = "INSERT INTO Users_Login (Username, Password,Role,Entity_Name) VALUES (?, ?,?, ?)";
//   db.query(query, ["GlobalUser", hashedPassword,"Global Admin",""], (err, results) => {
//     if (err) throw err;
//     console.log("User created!");
//   });
//     }
//     insertdat()

module.exports = router;