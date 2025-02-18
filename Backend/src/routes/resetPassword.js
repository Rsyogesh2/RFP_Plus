const express = require('express');
const {sendResetEmail} = require('./mailer'); // import mailer
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

    try {
        sendResetEmail(email);
        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        console.error("Error sending reset email:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});

router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: "Invalid request. Token and password required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.LOGINKEY); // Use process.env.LOGINKEY
        console.log("Decoded Token:", decoded);
        const email = decoded.email;

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("UPDATE users_Login SET password = ? WHERE Username = ?", [hashedPassword, email]);

        res.json({ message: "Password reset successful." });
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(400).json({ message: "Invalid or expired token." });
    }
});


module.exports = router;
