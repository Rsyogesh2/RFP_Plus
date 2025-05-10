const express = require('express');
const {sendResetEmail,verifyOtp,sendOtpEmail} = require('./mailer'); // import mailer
const router = express.Router();
const jwt = require('jsonwebtoken');  // Ensure this is imported
const bcrypt = require('bcrypt');  // Needed for password hashing
const db = require('../config/db');
require('dotenv').config();  // Load environment variables

router.post('/request-reset', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
     const [user] = await db.query("SELECT user_name FROM Users_Table WHERE email = ?", [email]);  
    try {
        sendResetEmail(email,user[0].user_name); // Pass the username to the mailer function
        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        console.error("Error sending reset email:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});

router.post("/get-otp", async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
    try {
        const [user] = await db.query("SELECT user_name FROM Users_Table WHERE email = ?", [email]);  
        if (!user || user.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        // Generate and send OTP
         sendOtpEmail(email,user[0].user_name); // Assuming sendOtpEmail is a function that sends the OTP to the email
        res.status(200).json({ message: "OTP sent to your email." }); // For testing purposes, you might want to remove this in production
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
}
);
router.post("/reset-password", async (req, res) => {
    const { token, email, password, otp } = req.body;
    if (!token || !password || !otp || !email) {
        return res.status(400).json({ message: "Invalid request. Token and password and email and Otp required." });
    }
    try {
        // Verify the OTP first
        const isOtpValid = await verifyOtp(email,otp); // Assuming verifyOtp is a function that verifies the OTP
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP." });
        }
        // Decode the token to get the email
        const decoded = jwt.verify(token, process.env.LOGINKEY); // Use process.env.LOGINKEY
        console.log("Decoded Token:", decoded);
        // email = decoded.email; // This line is not needed since email is already passed in the request body

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("UPDATE users_Login SET password = ? WHERE Username = ?", [hashedPassword, email]);

        res.json({ message: "Password reset successful." });
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(400).json({ message: "Invalid or expired token." });
    }
});


module.exports = router;
