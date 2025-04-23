const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();  // Load environment variables

const LOGINKEY = process.env.LOGINKEY; // Ensure this is defined
const API_URL = process.env.API_URL || 'http://localhost:3000';

const sendResetEmail = (recipientEmail,userName) => {
    const token = jwt.sign({ email: recipientEmail }, LOGINKEY, { expiresIn: "1h" });
    const resetLink = `${API_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Use environment variables
            pass: process.env.EMAIL_PASS   // Use an App Password for Gmail
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Reset Your RFPmanage Password',
        html: `
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password for your RFPmanage account. No worries—we’re here to help!</p>
            <p>Click the button below to set a new password:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>If you didn’t request this, you can ignore this email. Your account remains secure.</p>
            <p>For any assistance, feel free to contact our support team.</p>
            <p><strong>RFPmanage Team</strong></p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};


 const sendActivationEmail = (recipientEmail, userName) => {
    if (!LOGINKEY) {
        console.error("Error: LOGINKEY is missing in environment variables!");
        return;
    }

    // Generate activation token (valid for 24 hours)
    const token = jwt.sign({ email: recipientEmail }, LOGINKEY, { expiresIn: "24h" });
    const activationLink = `${API_URL}/activate-account?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Welcome to RFPmanage! Activate your account now.',
        html: `
            <p>Hi ${userName},</p>
            <p>Greetings from RFPmanage. You're almost ready to explore all the features of rfpmanage.com.</p>
            <p>Your email id will be your user id. Click here to activate your account and unlock access to your user id</p>
            <p>Activate Now:</p>
            <p><a href="${activationLink}" style="display:inline-block;padding:10px 20px;font-size:16px;color:#fff;background:#28a745;text-decoration:none;border-radius:5px;">Activate Account</a></p>
            <p><strong>RFPmanage Team</strong></p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending activation email:', error);
        } else {
            console.log('Activation email sent:', info.response);
        }
    });
};


// ✅ Export both functions
module.exports = { sendActivationEmail, sendResetEmail };