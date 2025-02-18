const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();

router.post('/activate-account', async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.LOGINKEY);
        const email = decoded.email;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user record with password and activate account
        await db.query("UPDATE users SET password = ?, is_active = ? WHERE email = ?", [hashedPassword, 1, email]);

        res.status(200).json({ message: "Account activated successfully! You can now log in." });
    } catch (error) {
        console.error("Account activation error:", error);
        res.status(400).json({ message: "Invalid or expired activation link." });
    }
});

module.exports = router;
