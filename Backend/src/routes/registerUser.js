const express = require('express');
const db = require('../config/db');
const {sendActivationEmail} = require('./mailer');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required." });
    }

    try {
        // Check if user already exists
        const existingUser = await db.query("SELECT * FROM users_login WHERE Username = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Insert new user (without password, since it's set upon activation)
        await db.query("INSERT INTO users (name, email, is_active) VALUES (?, ?, ?)", [name, email, 0]);

        // Send activation email
        sendActivationEmail(email, name);

        res.status(200).json({ message: "Registration successful! Check your email to activate your account." });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
