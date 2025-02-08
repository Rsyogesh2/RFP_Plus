const express = require('express');
const sendResetEmail = require('./mailer'); // import mailer
const router = express.Router();

router.post('/request-reset', async (req, res) => {
    const { email } = req.body;
    console.log(email);
    // Check if the email exists in your database (e.g., user model)
    // Example: 
    // const user = await User.findOne({ where: { email } });

    // For this example, assuming email is valid
    if (email) {
        // Send the reset email
        sendResetEmail(email);

        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } else {
        res.status(400).json({ message: 'Email not found.' });
    }
});

router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;

    try {
        // Verify token
        const decoded = jwt.verify(token, SECRET_KEY);
        const email = decoded.email;

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password in database
        await db.query("UPDATE users_Login SET password = ? WHERE email = ?", [hashedPassword, email]);

        res.json({ message: "Password reset successful." });
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
});

module.exports = router;
